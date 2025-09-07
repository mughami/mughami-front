import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Table,
  message,
  Space,
  Typography,
  Upload,
  Image,
  Row,
  Col,
  Tag,
  Popconfirm,
  List,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useQuizStore, cleanupBlobUrl } from '../../store/quizStore';
import { useCategoryStore } from '../../store/categoryStore';
import type { QuizQuestion, CreateQuestionRequest } from '../../services/api/quizService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface QuizManagementProps {
  quizId: number;
  onBack: () => void;
}

export const QuizManagement: React.FC<QuizManagementProps> = ({ quizId, onBack }) => {
  const {
    currentQuiz,
    currentQuestions,
    loading,
    fetchQuiz,
    fetchAdminQuizQuestions,
    createQuestion,
    deleteAdminQuizQuestion,
    addQuizPhoto,
    addQuestionPhoto,
    getQuizPhoto,
    getQuestionPhoto,
  } = useQuizStore();

  const { adminCategories } = useCategoryStore();

  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [questionForm] = Form.useForm();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [questionPhotoFile, setQuestionPhotoFile] = useState<File | null>(null);
  const [quizPhotoUrl, setQuizPhotoUrl] = useState<string>('');
  const [questionPhotos, setQuestionPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const [answers, setAnswers] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz(quizId);
    fetchAdminQuizQuestions(quizId, 0, 50); // Fetch more questions for management
  }, [quizId, fetchQuiz, fetchAdminQuizQuestions]);

  useEffect(() => {
    // Fetch quiz photo
    if (currentQuiz?.hasPhoto) {
      getQuizPhoto(currentQuiz.quizId).then((photoUrl) => {
        // Clean up previous quiz photo URL
        if (quizPhotoUrl) {
          cleanupBlobUrl(quizPhotoUrl);
          blobUrlsRef.current.delete(quizPhotoUrl);
        }
        setQuizPhotoUrl(photoUrl);
        blobUrlsRef.current.add(photoUrl);
      });
    }
  }, [currentQuiz, getQuizPhoto]);

  useEffect(() => {
    // Fetch photos for questions that have photos
    const fetchPhotos = async () => {
      // Clean up previous blob URLs for questions
      Object.values(questionPhotos).forEach((url) => {
        cleanupBlobUrl(url);
        blobUrlsRef.current.delete(url);
      });

      const photos: Record<number, string> = {};
      for (const question of currentQuestions) {
        if (question.hasPhoto) {
          try {
            const photoUrl = await getQuestionPhoto(question.id);
            photos[question.id] = photoUrl;
            blobUrlsRef.current.add(photoUrl);
          } catch {
            console.error(`Failed to fetch photo for question ${question.id}`);
          }
        }
      }
      setQuestionPhotos(photos);
    };

    if (currentQuestions.length > 0) {
      fetchPhotos();
    }

    // Cleanup function to revoke blob URLs when component unmounts or dependencies change
    return () => {
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();
    };
  }, [currentQuestions, getQuestionPhoto]);

  const handleCreateQuestion = async (values: {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
  }) => {
    try {
      const questionData: CreateQuestionRequest = {
        question: values.question,
        answers: values.answers.map((answer: string, index: number) => ({
          answer,
          isCorrect: index === values.correctAnswerIndex,
        })),
      };

      const question = await createQuestion(quizId, questionData);
      // If there's a photo, we need to add it to the newly created question
      if (questionPhotoFile) {
        try {
          // Refresh questions to get the newly created question
          await fetchAdminQuizQuestions(quizId, 0, 50);

          // The questions should now be updated in the store
          // We'll add the photo to the last question (the newly created one)
          await addQuestionPhoto(question.id, questionPhotoFile);
          message.success('კითხვა და ფოტო წარმატებით დაემატა!');
        } catch {
          message.warning('კითხვა დაემატა, მაგრამ ფოტოს დამატება ვერ მოხერხდა');
        }
      } else {
        message.success('კითხვა წარმატებით დაემატა!');
      }

      setIsQuestionModalVisible(false);
      questionForm.resetFields();
      setAnswers([]);
      setQuestionPhotoFile(null);
    } catch {
      message.error('კითხვის დამატებისას მოხდა შეცდომა');
    }
  };

  const handleAddQuizPhoto = async () => {
    if (!photoFile) {
      message.error('გთხოვთ აირჩიოთ ფოტო');
      return;
    }

    try {
      await addQuizPhoto(quizId, photoFile);
      message.success('ფოტო წარმატებით დაემატა!');
      setIsPhotoModalVisible(false);
      setPhotoFile(null);
      // Refresh quiz data
      fetchQuiz(quizId);
    } catch {
      message.error('ფოტოს დამატებისას მოხდა შეცდომა');
    }
  };

  const handleAddQuestionPhoto = async (questionId: number, photo: File) => {
    setUploadingPhoto(questionId);
    try {
      await addQuestionPhoto(questionId, photo);
      message.success('კითხვის ფოტო წარმატებით დაემატა!');
      // Refresh questions to update the hasPhoto status
      await fetchAdminQuizQuestions(quizId, 0, 50);
    } catch {
      message.error('კითხვის ფოტოს დამატებისას მოხდა შეცდომა');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleOpenQuestionModal = () => {
    setIsQuestionModalVisible(true);
    questionForm.resetFields();
    setAnswers([]);
    setQuestionPhotoFile(null);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalVisible(false);
    questionForm.resetFields();
    setAnswers([]);
    setQuestionPhotoFile(null);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteAdminQuizQuestion(quizId, questionId);
      message.success('კითხვა წარმატებით წაიშალა!');
      // Refresh questions for this quiz
      await fetchAdminQuizQuestions(quizId, 0, 50);
    } catch {
      message.error('კითხვის წაშლისას მოხდა შეცდომა');
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = adminCategories.find((cat) => cat.categoryId === categoryId);
    return category ? category.categoryName : 'უცნობი';
  };

  const questionColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: QuizQuestion, __: QuizQuestion, index: number) => <Text strong>{index + 1}</Text>,
    },
    {
      title: 'ფოტო',
      key: 'photo',
      width: 80,
      render: (question: QuizQuestion) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {question.hasPhoto && questionPhotos[question.id] ? (
            <Image
              src={questionPhotos[question.id]}
              alt="Question"
              className="w-full h-full object-cover"
              preview={false}
            />
          ) : (
            <QuestionCircleOutlined className="text-gray-400" />
          )}
        </div>
      ),
    },
    {
      title: 'კითხვა',
      dataIndex: 'question',
      key: 'question',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'პასუხები',
      key: 'answers',
      render: (question: QuizQuestion) => (
        <List
          size="small"
          dataSource={question.answers}
          renderItem={(answer, index) => (
            <List.Item className="py-1">
              <Text className={answer.isCorrect ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                {index + 1}. {answer.answer}
                {answer.isCorrect && (
                  <Tag color="green" className="ml-2">
                    სწორი
                  </Tag>
                )}
              </Text>
            </List.Item>
          )}
        />
      ),
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      width: 200,
      render: (question: QuizQuestion) => (
        <Space direction="vertical" size="small">
          <Upload
            beforeUpload={(file) => {
              handleAddQuestionPhoto(question.id, file);
              return false;
            }}
            showUploadList={false}
            accept="image/*"
            disabled={uploadingPhoto === question.id}
          >
            <Button
              type="link"
              icon={<UploadOutlined />}
              size="small"
              loading={uploadingPhoto === question.id}
            >
              {question.hasPhoto ? 'ფოტოს შეცვლა' : 'ფოტოს დამატება'}
            </Button>
          </Upload>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ კითხვის წაშლა?"
            onConfirm={() => handleDeleteQuestion(question.id)}
            okText="დიახ"
            cancelText="არა"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              წაშლა
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!currentQuiz) {
    return <div>ვიქტორინა იტვირთება...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            უკან
          </Button>
          <div>
            <Title level={2} className="mb-0">
              {currentQuiz.quizName}
            </Title>
            <Text type="secondary">კატეგორია: {getCategoryName(currentQuiz.categoryId)}</Text>
          </div>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setIsPhotoModalVisible(true)}
            disabled={currentQuiz.hasPhoto}
          >
            ფოტოს დამატება
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenQuestionModal}>
            კითხვის დამატება
          </Button>
        </Space>
      </div>

      {/* Quiz Info */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <div className="text-center">
              {currentQuiz.hasPhoto && quizPhotoUrl ? (
                <Image
                  src={quizPhotoUrl}
                  alt={currentQuiz.quizName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <TrophyOutlined className="text-white text-4xl" />
                </div>
              )}
              <Title level={4}>{currentQuiz.quizName}</Title>
              <Tag color="blue">{getCategoryName(currentQuiz.categoryId)}</Tag>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="ვიქტორინის სტატისტიკა">
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-center">
                  <Title level={3} className="text-blue-600">
                    {currentQuestions.length}
                  </Title>
                  <Text>კითხვა</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <Title level={3} className="text-green-600">
                    {currentQuestions.filter((q) => q.hasPhoto).length}
                  </Title>
                  <Text>ფოტო</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <Title level={3} className="text-purple-600">
                    {currentQuiz.hasPhoto ? 'დიახ' : 'არა'}
                  </Title>
                  <Text>ვიქტორინის ფოტო</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Questions Table */}
      <Card title="კითხვები" extra={<Text>სულ: {currentQuestions.length}</Text>}>
        <Table
          columns={questionColumns}
          dataSource={currentQuestions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${total} კითხვიდან`,
          }}
        />
      </Card>

      {/* Create Question Modal */}
      <Modal
        title="ახალი კითხვა"
        open={isQuestionModalVisible}
        onCancel={handleCloseQuestionModal}
        footer={null}
        width={600}
      >
        <Form form={questionForm} layout="vertical" onFinish={handleCreateQuestion}>
          <Form.Item
            name="question"
            label="კითხვა"
            rules={[
              { required: true, message: 'გთხოვთ შეიყვანოთ კითხვა' },
              { min: 5, message: 'კითხვა უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს' },
            ]}
          >
            <TextArea rows={3} placeholder="შეიყვანეთ კითხვა..." />
          </Form.Item>

          <Form.Item
            name="answers"
            label="პასუხები"
            rules={[
              {
                validator: async (_, answers) => {
                  if (!answers || answers.length < 2) {
                    return Promise.reject(new Error('მინიმუმ 2 პასუხი უნდა იყოს'));
                  }
                },
              },
            ]}
          >
            <Form.List
              name="answers"
              rules={[
                {
                  validator: async (_, answers) => {
                    if (!answers || answers.length < 2) {
                      return Promise.reject(new Error('მინიმუმ 2 პასუხი უნდა იყოს'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item required={false} key={field.key} label={index === 0 ? 'პასუხები' : ''}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: 'გთხოვთ შეიყვანოთ პასუხი',
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          placeholder={`პასუხი ${index + 1}`}
                          style={{ width: '90%' }}
                          onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[index] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                        />
                      </Form.Item>
                      {fields.length > 2 && (
                        <Button
                          type="link"
                          onClick={() => {
                            remove(field.name);
                            const newAnswers = [...answers];
                            newAnswers.splice(index, 1);
                            setAnswers(newAnswers);
                          }}
                          style={{ width: '10%' }}
                        >
                          წაშლა
                        </Button>
                      )}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        setAnswers([...answers, '']);
                      }}
                      block
                    >
                      პასუხის დამატება
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="correctAnswerIndex"
            label="სწორი პასუხი"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ სწორი პასუხი' }]}
          >
            <Select placeholder="აირჩიეთ სწორი პასუხი" disabled={!answers.length}>
              {answers.map((answer: string, index: number) => (
                <Select.Option key={index} value={index}>
                  {index + 1}. {answer || `პასუხი ${index + 1}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="კითხვის ფოტო (არასავალდებულო)">
            <Upload
              beforeUpload={(file) => {
                setQuestionPhotoFile(file);
                return false;
              }}
              onRemove={() => setQuestionPhotoFile(null)}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>ფოტოს ატვირთვა</Button>
            </Upload>
            <Text type="secondary">რეკომენდებული ზომა: 800x600px, მაქსიმუმ 2MB</Text>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                დამატება
              </Button>
              <Button onClick={handleCloseQuestionModal}>გაუქმება</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Quiz Photo Modal */}
      <Modal
        title="ვიქტორინის ფოტოს დამატება"
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form layout="vertical">
          <Form.Item label="ფოტო">
            <Upload
              beforeUpload={(file) => {
                setPhotoFile(file);
                return false;
              }}
              onRemove={() => setPhotoFile(null)}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>ფოტოს ატვირთვა</Button>
            </Upload>
            <Text type="secondary">რეკომენდებული ზომა: 800x600px, მაქსიმუმ 2MB</Text>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                onClick={handleAddQuizPhoto}
                loading={loading}
                disabled={!photoFile}
              >
                დამატება
              </Button>
              <Button onClick={() => setIsPhotoModalVisible(false)}>გაუქმება</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
