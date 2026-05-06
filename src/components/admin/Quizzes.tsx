import React, { useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
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
  DatePicker,
  Badge,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { useQuizStore, cleanupBlobUrl } from '../../store/quizStore';
import { useCategoryStore } from '../../store/categoryStore';
import type { Quiz, CreateQuizRequest, AdminQuizFilters } from '../../services/api/quizService';
import { QuizManagement } from './QuizManagement';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

interface FormValues {
  quizName: string;
  categoryId: number;
  subCategoryId?: number;
  quizStatus: 'PENDING' | 'VERIFIED';
}

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
};

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

  const [filters, setFilters] = useState<AdminQuizFilters>({ sortBy: 'CREATED_AT', sortDirection: 'DESC' });
  const [nameInput, setNameInput] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);

  const filterSubcategoryOptions = useMemo(() => {
    if (!filterCategoryId) return [];
    const cat = adminCategories.find((c) => c.categoryId === filterCategoryId);
    return (cat?.subCategoryResponseList || []).map((s) => ({
      label: s.subCategoryName,
      value: s.subCategoryId,
    }));
  }, [filterCategoryId, adminCategories]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.name) count++;
    if (filters.quizStatus) count++;
    if (filters.quizType) count++;
    if (filters.categoryId != null) count++;
    if (filters.subcategoryId != null) count++;
    if (filters.createdFrom) count++;
    return count;
  }, [filters]);

  const updateFilter = (partial: Partial<AdminQuizFilters>) => {
    setCurrentPage(1);
    setFilters((f) => ({ ...f, ...partial }));
  };

  const handleClearFilters = () => {
    setFilters({ sortBy: 'CREATED_AT', sortDirection: 'DESC' });
    setNameInput('');
    setFilterCategoryId(undefined);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  useEffect(() => {
    fetchAdminQuizzes(currentPage - 1, pageSize, filters);
  }, [fetchAdminQuizzes, currentPage, pageSize, filters]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const prevUrls = blobUrlsRef.current;
      prevUrls.forEach((url) => cleanupBlobUrl(url));
      prevUrls.clear();

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

    if (quizzes.length > 0) fetchPhotos();

    return () => {
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
    };
  }, [quizzes, getQuizPhoto]);

  const handleCreateQuiz = async (values: FormValues) => {
    try {
      const quizData: CreateQuizRequest = {
        name: values.quizName,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        quizStatus: values.quizStatus,
      };
      const newQuiz = await createQuiz(quizData);
      if (photoFile) await addQuizPhoto(newQuiz.quizId, photoFile);
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

  const handleSubmit = (values: FormValues) =>
    editingQuiz ? handleUpdateQuiz(values) : handleCreateQuiz(values);

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    const cat = adminCategories.find((c) => c.categoryId === quiz.categoryId);
    const subs = (cat?.subCategoryResponseList || []).map((s) => ({
      label: s.subCategoryName,
      value: s.subCategoryId,
    }));
    setSubOptions((prev) => ({ ...prev, [quiz.categoryId]: subs }));
    form.setFieldsValue({
      quizName: quiz.quizName,
      categoryId: quiz.categoryId,
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

  if (selectedQuizId) {
    return <QuizManagement quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)} />;
  }

  const columns = [
    {
      title: 'ფოტო',
      key: 'photo',
      width: 72,
      render: (quiz: Quiz) => (
        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {quiz.hasPhoto && quizPhotos[quiz.quizId] ? (
            <Image src={quizPhotos[quiz.quizId]} alt={quiz.quizName} className="w-full h-full object-cover" preview={false} />
          ) : (
            <TrophyOutlined className="text-gray-400" />
          )}
        </div>
      ),
    },
    {
      title: 'სახელი',
      dataIndex: 'quizName',
      key: 'quizName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'კატეგორია',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number) => {
        const cat = adminCategories.find((c) => c.categoryId === categoryId);
        return cat ? <Tag color="blue">{cat.categoryName}</Tag> : <Tag>უცნობი</Tag>;
      },
    },
    {
      title: 'ქვეკატეგორია',
      key: 'subCategory',
      render: (quiz: Quiz) => {
        const subId =
          (quiz as unknown as { subcategoryId?: number }).subcategoryId ??
          (quiz as unknown as { subCategoryId?: number }).subCategoryId;
        if (!subId) return <Text type="secondary">—</Text>;
        const cat = adminCategories.find((c) => c.categoryId === quiz.categoryId);
        const sub = cat?.subCategoryResponseList.find((s) => s.subCategoryId === subId);
        return sub ? <Tag color="purple">{sub.subCategoryName}</Tag> : <Tag>{subId}</Tag>;
      },
    },
    {
      title: 'სტატუსი',
      key: 'status',
      render: (quiz: Quiz) => {
        const status = quiz.quizStatus || 'PENDING';
        return <Badge status={STATUS_COLORS[status] as 'success' | 'warning' | 'error'} text={status} />;
      },
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      render: (quiz: Quiz) => (
        <Space size={0}>
          <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedQuizId(quiz.quizId)} size="small">ნახვა</Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditQuiz(quiz)} size="small">რედაქტირება</Button>
          <Popconfirm
            title="ვიქტორინის წაშლა"
            description="ეს მოქმედება შეუქცევადია."
            onConfirm={() => handleDeleteQuiz(quiz.quizId)}
            okText="წაშლა"
            okButtonProps={{ danger: true }}
            cancelText="გაუქმება"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">წაშლა</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">ქვიზების მართვა</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingQuiz(null); form.resetFields(); setPhotoFile(null); setIsModalVisible(true); }}
          size="large"
        >
          ახალი ვიქტორინა
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16}>
        {[
          { title: 'სულ ვიქტორინა', value: totalQuizzes, icon: <TrophyOutlined /> },
          { title: 'ნაჩვენები', value: quizzes.length, icon: <TrophyOutlined /> },
          { title: 'კითხვები', value: 0, icon: <QuestionCircleOutlined /> },
        ].map((stat, i) => (
          <Col span={8} key={i}>
            <Card size="small">
              <Statistic title={stat.title} value={stat.value} prefix={stat.icon} valueStyle={{ color: '#1677ff' }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Panel */}
      <Card
        size="small"
        title={
          <Space>
            <FilterOutlined className="text-blue-500" />
            <span className="font-semibold">ფილტრები</span>
            {activeFilterCount > 0 && (
              <Tag color="blue" className="!ml-1">{activeFilterCount} აქტიური</Tag>
            )}
          </Space>
        }
        extra={
          activeFilterCount > 0 && (
            <Button
              size="small"
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleClearFilters}
            >
              გასუფთავება
            </Button>
          )
        }
      >
        <Row gutter={[12, 16]}>
          {/* Search */}
          <Col xs={24} sm={24} md={8} lg={6}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">
                <SearchOutlined className="mr-1" />სახელი
              </Text>
              <Input.Search
                placeholder="ვიქტორინის სახელი..."
                allowClear
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (!e.target.value) updateFilter({ name: undefined });
                }}
                onSearch={(v) => updateFilter({ name: v || undefined })}
              />
            </div>
          </Col>

          {/* Status */}
          <Col xs={12} sm={8} md={4} lg={3}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">სტატუსი</Text>
              <Select
                placeholder="ყველა"
                allowClear
                style={{ width: '100%' }}
                value={filters.quizStatus}
                onChange={(v) => updateFilter({ quizStatus: v })}
                options={[
                  { label: '✅ Verified', value: 'VERIFIED' },
                  { label: '⏳ Pending', value: 'PENDING' },
                  { label: '❌ Rejected', value: 'REJECTED' },
                ]}
              />
            </div>
          </Col>

          {/* Type */}
          <Col xs={12} sm={8} md={4} lg={3}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">ტიპი</Text>
              <Select
                placeholder="ყველა"
                allowClear
                style={{ width: '100%' }}
                value={filters.quizType}
                onChange={(v) => updateFilter({ quizType: v })}
                options={[
                  { label: '🏆 Tournament', value: 'TOURNAMENT' },
                  { label: '🎯 Free', value: 'FREE' },
                ]}
              />
            </div>
          </Col>

          {/* Category */}
          <Col xs={24} sm={8} md={6} lg={5}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">კატეგორია</Text>
              <Select
                placeholder="ყველა კატეგორია"
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: '100%' }}
                value={filters.categoryId}
                onChange={(v: number | undefined) => {
                  setFilterCategoryId(v);
                  updateFilter({ categoryId: v, subcategoryId: undefined });
                }}
                options={adminCategories.map((c) => ({ label: c.categoryName, value: c.categoryId }))}
              />
            </div>
          </Col>

          {/* Subcategory */}
          <Col xs={24} sm={8} md={6} lg={5}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">ქვეკატეგორია</Text>
              <Select
                placeholder={filterCategoryId ? 'ყველა' : 'აირჩიეთ კატეგორია'}
                allowClear
                style={{ width: '100%' }}
                disabled={!filterCategoryId}
                value={filters.subcategoryId}
                onChange={(v) => updateFilter({ subcategoryId: v })}
                options={filterSubcategoryOptions}
              />
            </div>
          </Col>
        </Row>

        <Divider className="!my-3" />

        <Row gutter={[12, 16]} align="bottom">
          {/* Date range */}
          <Col xs={24} md={12} lg={10}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">შექმნის პერიოდი</Text>
              <RangePicker
                style={{ width: '100%' }}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                value={
                  filters.createdFrom && filters.createdTo
                    ? [dayjs(filters.createdFrom), dayjs(filters.createdTo)]
                    : null
                }
                onChange={(dates) =>
                  updateFilter({
                    createdFrom: dates?.[0]?.toISOString() ?? undefined,
                    createdTo: dates?.[1]?.toISOString() ?? undefined,
                  })
                }
              />
            </div>
          </Col>

          {/* Sort by */}
          <Col xs={12} sm={8} md={5} lg={4}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">
                <SortAscendingOutlined className="mr-1" />სორტირება
              </Text>
              <Select
                style={{ width: '100%' }}
                value={filters.sortBy}
                onChange={(v) => updateFilter({ sortBy: v })}
                options={[
                  { label: 'შექმნის თარიღი', value: 'CREATED_AT' },
                  { label: 'სახელი', value: 'NAME' },
                  { label: 'ტიპი', value: 'TYPE' },
                  { label: 'სტატუსი', value: 'STATUS' },
                ]}
              />
            </div>
          </Col>

          {/* Direction */}
          <Col xs={12} sm={8} md={4} lg={3}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">მიმართულება</Text>
              <Select
                style={{ width: '100%' }}
                value={filters.sortDirection}
                onChange={(v) => updateFilter({ sortDirection: v })}
                options={[
                  { label: '↓ კლებადი', value: 'DESC' },
                  { label: '↑ მზარდი', value: 'ASC' },
                ]}
              />
            </div>
          </Col>
        </Row>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <>
            <Divider className="!my-3" />
            <div className="flex flex-wrap gap-2">
              {filters.name && (
                <Tag closable color="blue" onClose={() => { updateFilter({ name: undefined }); setNameInput(''); }}>
                  სახელი: {filters.name}
                </Tag>
              )}
              {filters.quizStatus && (
                <Tag closable color="blue" onClose={() => updateFilter({ quizStatus: undefined })}>
                  სტატუსი: {filters.quizStatus}
                </Tag>
              )}
              {filters.quizType && (
                <Tag closable color="blue" onClose={() => updateFilter({ quizType: undefined })}>
                  ტიპი: {filters.quizType}
                </Tag>
              )}
              {filters.categoryId != null && (
                <Tag closable color="blue" onClose={() => { setFilterCategoryId(undefined); updateFilter({ categoryId: undefined, subcategoryId: undefined }); }}>
                  კატეგორია: {adminCategories.find((c) => c.categoryId === filters.categoryId)?.categoryName}
                </Tag>
              )}
              {filters.subcategoryId != null && (
                <Tag closable color="blue" onClose={() => updateFilter({ subcategoryId: undefined })}>
                  ქვეკატეგორია: {filterSubcategoryOptions.find((s) => s.value === filters.subcategoryId)?.label}
                </Tag>
              )}
              {filters.createdFrom && (
                <Tag closable color="blue" onClose={() => updateFilter({ createdFrom: undefined, createdTo: undefined })}>
                  პერიოდი: {dayjs(filters.createdFrom).format('MM/DD')} → {dayjs(filters.createdTo).format('MM/DD')}
                </Tag>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Table */}
      <Card size="small">
        <Table
          columns={columns}
          dataSource={quizzes}
          rowKey="quizId"
          loading={loading}
          size="middle"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalQuizzes,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / სულ ${total}`,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current || 1);
            setPageSize(pagination.pageSize || pageSize);
          }}
        />
      </Card>

      {/* Create / Edit Modal */}
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
          initialValues={{ quizStatus: 'PENDING' }}
        >
          <Form.Item
            name="quizName"
            label="ვიქტორინის სახელი"
            rules={[
              { required: true, message: 'გთხოვთ შეიყვანოთ სახელი' },
              { min: 3, message: 'მინიმუმ 3 სიმბოლო' },
            ]}
          >
            <Input placeholder="მაგ: მუღამის ვიქტორინა" />
          </Form.Item>

          <Form.Item name="categoryId" label="კატეგორია" rules={[{ required: true, message: 'გთხოვთ აირჩიოთ კატეგორია' }]}>
            <Select
              placeholder="აირჩიეთ კატეგორია"
              showSearch
              optionFilterProp="children"
              onChange={(categoryId: number) => {
                const cat = adminCategories.find((c) => c.categoryId === categoryId);
                const subs = (cat?.subCategoryResponseList || []).map((s) => ({ label: s.subCategoryName, value: s.subCategoryId }));
                setSubOptions((prev) => ({ ...prev, [categoryId]: subs }));
                const cur = form.getFieldValue('subCategoryId');
                form.setFieldsValue({ subCategoryId: subs.some((s) => s.value === cur) ? cur : undefined });
              }}
            >
              {adminCategories.map((c) => <Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="subCategoryId" label="ქვეკატეგორია">
            <Select placeholder="არასავალდებულო" allowClear options={subOptions[form.getFieldValue('categoryId')] || []} />
          </Form.Item>

          <Form.Item label="ვიქტორინის ფოტო">
            <Upload beforeUpload={(f) => { setPhotoFile(f); return false; }} onRemove={() => setPhotoFile(null)} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>ფოტოს ატვირთვა</Button>
            </Upload>
            <Text type="secondary" className="text-xs">800×600px, მაქს. 2MB</Text>
          </Form.Item>

          <Form.Item name="quizStatus" label="სტატუსი" rules={[{ required: true }]}>
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
