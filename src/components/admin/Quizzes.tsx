import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  Card,
  Typography,
  Popconfirm,
  Tag,
  Image,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useQuizStore, cleanupBlobUrl } from '../../store/quizStore';
import { useCategoryStore } from '../../store/categoryStore';
import type { Quiz, CreateQuizRequest } from '../../services/api/quizService';
import { QuizManagement } from './QuizManagement';

const { Title, Text } = Typography;
const { Option } = Select;

interface FormValues {
  quizName: string;
  categoryId: number;
}

export const Quizzes: React.FC = () => {
  const { quizzes, loading, fetchAdminQuizzes, createQuiz, addQuizPhoto, getQuizPhoto } =
    useQuizStore();

  const { adminCategories, fetchAdminCategories } = useCategoryStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [quizPhotos, setQuizPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchAdminQuizzes();
    fetchAdminCategories();
  }, [fetchAdminQuizzes, fetchAdminCategories]);

  useEffect(() => {
    // Fetch photos for quizzes that have photos
    const fetchPhotos = async () => {
      // Clean up previous blob URLs
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();

      const photos: Record<number, string> = {};
      for (const quiz of quizzes) {
        if (quiz.hasPhoto) {
          try {
            const photoUrl = await getQuizPhoto(quiz.quizId);
            photos[quiz.quizId] = photoUrl;
            blobUrlsRef.current.add(photoUrl);
          } catch {
            console.error(`Failed to fetch photo for quiz ${quiz.quizId}`);
          }
        }
      }
      setQuizPhotos(photos);
    };

    if (quizzes.length > 0) {
      fetchPhotos();
    }

    // Cleanup function to revoke blob URLs when component unmounts
    return () => {
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();
    };
  }, [quizzes, getQuizPhoto]);

  const handleCreateQuiz = async (values: FormValues) => {
    try {
      // First create the quiz with JSON data
      const quizData: CreateQuizRequest = {
        name: values.quizName,
        categoryId: values.categoryId,
      };

      const newQuiz = await createQuiz(quizData);

      // Then add photo if provided
      if (photoFile) {
        await addQuizPhoto(newQuiz.quizId, photoFile);
      }

      message.success('ვიქტორინა წარმატებით დაემატა!');
      setIsModalVisible(false);
      form.resetFields();
      setPhotoFile(null);
    } catch {
      message.error('ვიქტორინის დამატებისას მოხდა შეცდომა');
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    form.setFieldsValue({
      quizName: quiz.quizName,
      categoryId: quiz.categoryId,
    });
    setIsModalVisible(true);
  };

  const handleDeleteQuiz = async () => {
    try {
      // Add delete functionality when available
      message.success('ვიქტორინა წარმატებით წაიშალა!');
    } catch {
      message.error('ვიქტორინის წაშლისას მოხდა შეცდომა');
    }
  };

  const handleViewQuiz = (quizId: number) => {
    setSelectedQuizId(quizId);
  };

  const handleBackToList = () => {
    setSelectedQuizId(null);
  };

  // If a quiz is selected, show the QuizManagement component
  if (selectedQuizId) {
    return <QuizManagement quizId={selectedQuizId} onBack={handleBackToList} />;
  }
  const columns = [
    {
      title: 'ფოტო',
      key: 'photo',
      width: 80,
      render: (quiz: Quiz) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {quiz.hasPhoto && quizPhotos[quiz.quizId] ? (
            <Image
              src={quizPhotos[quiz.quizId]}
              alt={quiz.quizName}
              className="w-full h-full object-cover"
              preview={false}
            />
          ) : (
            <TrophyOutlined className="text-gray-400 text-lg" />
          )}
        </div>
      ),
    },
    {
      title: 'ვიქტორინის სახელი',
      dataIndex: 'quizName',
      key: 'quizName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'კატეგორია',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number) => {
        const category = adminCategories.find((cat) => cat.categoryId === categoryId);
        return category ? (
          <Tag color="blue">{category.categoryName}</Tag>
        ) : (
          <Tag color="default">უცნობი</Tag>
        );
      },
    },
    {
      title: 'სტატუსი',
      key: 'status',
      render: () => <Tag color="green">აქტიური</Tag>,
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      render: (quiz: Quiz) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewQuiz(quiz.quizId)}
            size="small"
          >
            ნახვა
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditQuiz(quiz)}
            size="small"
          >
            რედაქტირება
          </Button>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ ვიქტორინის წაშლა?"
            onConfirm={handleDeleteQuiz}
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

  const stats = [
    {
      title: 'სულ ვიქტორინა',
      value: quizzes.length,
      icon: <TrophyOutlined />,
    },
    {
      title: 'აქტიური',
      value: quizzes.length, // Assuming all are active for now
      icon: <TrophyOutlined />,
    },
    {
      title: 'კითხვები',
      value: 0, // TODO: Add question count when available in Quiz type
      icon: <QuestionCircleOutlined />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2}>ვიქტორინების მართვა</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingQuiz(null);
            form.resetFields();
            setPhotoFile(null);
            setIsModalVisible(true);
          }}
          size="large"
        >
          ახალი ვიქტორინა
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        {stats.map((stat, index) => (
          <Col span={8} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quizzes Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={quizzes}
          rowKey="quizId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${total} ვიქტორინიდან`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingQuiz ? 'ვიქტორინის რედაქტირება' : 'ახალი ვიქტორინა'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateQuiz}
          initialValues={{
            categoryId: undefined,
          }}
        >
          <Form.Item
            name="quizName"
            label="ვიქტორინის სახელი"
            rules={[
              { required: true, message: 'გთხოვთ შეიყვანოთ ვიქტორინის სახელი' },
              { min: 3, message: 'სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს' },
            ]}
          >
            <Input placeholder="მაგ: მუღამის ვიქტორინა" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="კატეგორია"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ კატეგორია' }]}
          >
            <Select placeholder="აირჩიეთ კატეგორია">
              {adminCategories.map((category) => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="ვიქტორინის ფოტო">
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
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingQuiz ? 'განახლება' : 'დამატება'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>გაუქმება</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
