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
  subCategoryId?: number;
  quizStatus: 'PENDING' | 'VERIFIED';
}

export const Quizzes: React.FC = () => {
  const {
    quizzes,
    loading,
    totalQuizzes,
    fetchAdminQuizzes,
    createQuiz,
    addQuizPhoto,
    getQuizPhoto,
    updateAdminQuiz,
    deleteAdminQuiz,
  } = useQuizStore();

  const { adminCategories, fetchAdminCategories } = useCategoryStore();
  const [subOptions, setSubOptions] = useState<Record<number, { label: string; value: number }[]>>({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [quizPhotos, setQuizPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    fetchAdminQuizzes(currentPage - 1, pageSize);
    fetchAdminCategories();
  }, [fetchAdminQuizzes, fetchAdminCategories, currentPage, pageSize]);

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
        subCategoryId: values.subCategoryId,
        quizStatus: values.quizStatus,
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

  const handleUpdateQuiz = async (values: FormValues) => {
    if (!editingQuiz) return;
    try {
      await updateAdminQuiz(editingQuiz.quizId, {
        name: values.quizName,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        quizStatus: values.quizStatus,
      });
      message.success('ვიქტორინა წარმატებით განახლდა!');
      setIsModalVisible(false);
      setEditingQuiz(null);
      form.resetFields();
    } catch {
      message.error('ვიქტორინის განახლებისას მოხდა შეცდომა');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (editingQuiz) {
      return handleUpdateQuiz(values);
    }
    return handleCreateQuiz(values);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    form.setFieldsValue({
      quizName: quiz.quizName,
      categoryId: quiz.categoryId,
      // backend returns 'subcategoryId'; prefer that if present
      subCategoryId:
        (quiz as unknown as { subcategoryId?: number; subCategoryId?: number }).subcategoryId ??
        (quiz as unknown as { subcategoryId?: number; subCategoryId?: number }).subCategoryId,
      quizStatus: quiz.quizStatus || 'PENDING',
    });
    setIsModalVisible(true);
  };

  const handleDeleteQuiz = async (quizId: number) => {
    try {
      await deleteAdminQuiz(quizId);
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
      render: (quiz: Quiz) => (
        <Tag color={quiz.quizStatus === 'VERIFIED' ? 'green' : 'orange'}>
          {quiz.quizStatus || 'PENDING'}
        </Tag>
      ),
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
            onConfirm={() => handleDeleteQuiz(quiz.quizId)}
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
            current: currentPage,
            pageSize,
            total: totalQuizzes,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${total} ვიქტორინიდან`,
          }}
          onChange={(pagination) => {
            const nextPage = pagination.current || 1;
            const nextSize = pagination.pageSize || pageSize;
            setCurrentPage(nextPage);
            setPageSize(nextSize);
            // fetch will be triggered by the effect watching currentPage/pageSize
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
          onFinish={handleSubmit}
          initialValues={{
            categoryId: undefined,
            subCategoryId: undefined,
            quizStatus: 'PENDING',
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
            <Select
              placeholder="აირჩიეთ კატეგორია"
              onChange={(categoryId: number) => {
                const cat = adminCategories.find((c) => c.categoryId === categoryId);
                const subs = (cat?.subCategoryResponseList || []).map((s) => ({
                  label: s.subCategoryName,
                  value: s.subCategoryId,
                }));
                setSubOptions((prev) => ({ ...prev, [categoryId]: subs }));
                // reset sub-category on category change
                form.setFieldsValue({ subCategoryId: undefined });
              }}
            >
              {adminCategories.map((category) => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subCategoryId" label="ქვეკატეგორია">
            <Select
              placeholder="აირჩიეთ ქვეკატეგორია (არასავალდებულო)"
              allowClear
              options={subOptions[form.getFieldValue('categoryId')] || []}
            />
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

          <Form.Item
            name="quizStatus"
            label="სტატუსი"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ სტატუსი' }]}
          >
            <Select>
              <Option value="PENDING">PENDING</Option>
              <Option value="VERIFIED">VERIFIED</Option>
            </Select>
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
