import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
  message,
  Image,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  TrophyOutlined,
  BulbOutlined,
  StarFilled,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useBracketStore, useCategoryStore } from '../../store';
import bracketService from '../../services/api/bracketService';
import type {
  Bracket,
  BracketOption,
  BracketStatus,
  SortDir,
} from '../../services/api/bracketService';

const STATUS_META: Record<BracketStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'აქტიური', color: 'green' },
  PENDING: { label: 'მოლოდინში', color: 'orange' },
};

const { Title } = Typography;

export const Brackets = () => {
  const {
    adminBrackets,
    adminBracketsTotal,
    currentBracketDetails,
    suggestions,
    suggestionsLoading,
    loading,
    error,
    fetchAdminBrackets,
    fetchAdminBracket,
    createBracket,
    updateBracket,
    deleteBracket,
    addBracketOption,
    deleteBracketOption,
    fetchSuggestions,
    addSuggestions,
    removeSuggestion,
    clearSuggestions,
    clearError,
  } = useBracketStore();

  const { adminCategories, fetchAdminCategories } = useCategoryStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createForm] = Form.useForm<{
    name: string;
    status: BracketStatus;
    isFavorite: boolean;
    categoryId?: number;
    subcategoryId?: number;
  }>();
  const [editForm] = Form.useForm<{
    name: string;
    status: BracketStatus;
    isFavorite: boolean;
    categoryId?: number;
    subcategoryId?: number;
  }>();

  // Subcategories depend on the category chosen — one set per form.
  const subcategoryOptionsFor = (categoryId?: number) =>
    adminCategories
      .find((c) => c.categoryId === categoryId)
      ?.subCategoryResponseList.map((s) => ({
        value: s.subCategoryId,
        label: s.subCategoryName,
      })) ?? [];

  const categoryOptions = adminCategories.map((c) => ({
    value: c.categoryId,
    label: c.categoryName,
  }));

  const selectedCategoryId = Form.useWatch('categoryId', createForm);
  const subcategoryOptions = subcategoryOptionsFor(selectedCategoryId);

  const editSelectedCategoryId = Form.useWatch('categoryId', editForm);
  const editSubcategoryOptions = subcategoryOptionsFor(editSelectedCategoryId);
  const [editingBracket, setEditingBracket] = useState<Bracket | null>(null);
  const [selectedBracket, setSelectedBracket] = useState<Bracket | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [optionPhotos, setOptionPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionBracket, setSuggestionBracket] = useState<Bracket | null>(null);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<number[]>([]);

  // Server-side filters + pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BracketStatus | undefined>();
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>();
  const [filterSubcategoryId, setFilterSubcategoryId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<SortDir>('DESC');

  useEffect(() => {
    const blobs = blobUrlsRef.current;
    const fetchPhotos = async () => {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      blobs.clear();

      if (!currentBracketDetails) {
        setOptionPhotos({});
        return;
      }

      const photos: Record<number, string> = {};
      for (const opt of currentBracketDetails.options ?? []) {
        try {
          const url = await bracketService.getAdminOptionPhoto(opt.id);
          photos[opt.id] = url;
          blobs.add(url);
        } catch {
          console.error(`Failed to fetch photo for option ${opt.id}`);
        }
      }
      setOptionPhotos(photos);
    };

    fetchPhotos();

    return () => {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      blobs.clear();
    };
  }, [currentBracketDetails]);

  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  useEffect(() => {
    fetchAdminBrackets({
      page,
      size: pageSize,
      search: search || undefined,
      status: statusFilter,
      categoryId: filterCategoryId,
      subcategoryId: filterSubcategoryId,
      sortBy,
      sortDir,
    });
  }, [
    fetchAdminBrackets,
    page,
    pageSize,
    search,
    statusFilter,
    filterCategoryId,
    filterSubcategoryId,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await createBracket({
        name: values.name.trim(),
        status: values.status,
        isFavorite: values.isFavorite ?? false,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
      });
      message.success('თამაში წარმატებით შეიქმნა');
      createForm.resetFields();
      setCreateOpen(false);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
    }
  };

  const openEdit = (bracket: Bracket) => {
    setEditingBracket(bracket);
    editForm.setFieldsValue({
      name: bracket.name,
      status: bracket.status,
      isFavorite: bracket.type === 'FAVORITE',
      categoryId: bracket.categoryResponse?.categoryId,
      subcategoryId: bracket.subCategoryResponse?.subCategoryId,
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingBracket) return;
    try {
      const values = await editForm.validateFields();
      await updateBracket(editingBracket.id, {
        name: values.name.trim(),
        status: values.status,
        isFavorite: values.isFavorite ?? false,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
      });
      message.success('თამაში განახლდა');
      setEditOpen(false);
      setEditingBracket(null);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBracket(id);
      message.success('თამაში წაშლილია');
    } catch {
      // store handles error message
    }
  };

  const openDetails = async (bracket: Bracket) => {
    setSelectedBracket(bracket);
    setDetailsOpen(true);
    await fetchAdminBracket(bracket.id);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedBracket(null);
    setUploadFile(null);
    setFileList([]);
  };

  const handleAddOption = async () => {
    if (!selectedBracket || !uploadFile) {
      message.warning('გთხოვთ აირჩიოთ ფოტო');
      return;
    }
    setUploading(true);
    try {
      await addBracketOption(selectedBracket.id, uploadFile);
      message.success('ვარიანტი დამატებულია');
      setUploadFile(null);
      setFileList([]);
    } catch {
      // store handles error message
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!selectedBracket) return;
    try {
      await deleteBracketOption(selectedBracket.id, optionId);
      message.success('ვარიანტი წაშლილია');
    } catch {
      // store handles error message
    }
  };

  const openSuggestions = async (bracket: Bracket) => {
    setSuggestionBracket(bracket);
    setSelectedSuggestionIds([]);
    setSuggestionsOpen(true);
    await fetchSuggestions(bracket.id);
  };

  const closeSuggestions = () => {
    setSuggestionsOpen(false);
    setSuggestionBracket(null);
    setSelectedSuggestionIds([]);
    clearSuggestions();
  };

  const handleAddSuggestions = async () => {
    if (!suggestionBracket || selectedSuggestionIds.length === 0) return;
    try {
      await addSuggestions(suggestionBracket.id, selectedSuggestionIds);
      message.success('შეთავაზებები დაემატა');
      setSelectedSuggestionIds([]);
    } catch {
      // store handles error message
    }
  };

  const handleRemoveSuggestion = async (suggestedBracketId: number) => {
    if (!suggestionBracket) return;
    try {
      await removeSuggestion(suggestionBracket.id, suggestedBracketId);
      message.success('შეთავაზება წაიშალა');
    } catch {
      // store handles error message
    }
  };

  // Brackets eligible to be suggested: every other bracket not already suggested.
  const suggestionCandidates = suggestionBracket
    ? adminBrackets.filter(
        (b) =>
          b.id !== suggestionBracket.id && !suggestions.some((s) => s.id === b.id),
      )
    : [];

  const optionsList = currentBracketDetails?.options ?? [];
  const totalWinnings = optionsList.reduce((sum, o) => sum + (o.totalWinnings ?? 0), 0);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'დასახელება',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Bracket) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <ThunderboltOutlined className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{name}</span>
          {record.type === 'FAVORITE' && <StarFilled className="text-amber-400 ml-2" />}
        </div>
      ),
    },
    {
      title: 'კატეგორია',
      key: 'category',
      render: (_: unknown, record: Bracket) => {
        const category = record.categoryResponse?.categoryName;
        const subcategory = record.subCategoryResponse?.subCategoryName;
        if (!category && !subcategory) {
          return <span className="text-gray-300">—</span>;
        }
        return (
          <Space direction="vertical" size={2}>
            {category && <Tag color="blue">{category}</Tag>}
            {subcategory && <Tag color="cyan">{subcategory}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'სტატუსი',
      dataIndex: 'status',
      key: 'status',
      render: (status: BracketStatus) => {
        const meta = STATUS_META[status] ?? { label: status, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: Bracket) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            დეტალები
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            რედაქტირება
          </Button>
          <Button type="link" icon={<BulbOutlined />} onClick={() => openSuggestions(record)}>
            შეთავაზებები
          </Button>
          <Popconfirm
            title="თამაშის წაშლა"
            description="დარწმუნებული ხართ?"
            okText="დიახ"
            cancelText="არა"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              წაშლა
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Title level={2} className="!mb-1">
            ეს თუ ის
          </Title>
          <p className="text-gray-500">მართეთ „ეს თუ ის“ თამაშები</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateOpen(true)}
        >
          ახალი თამაში
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input.Search
            allowClear
            placeholder="ძებნა დასახელებით"
            className="!w-full sm:!w-64"
            defaultValue={search}
            onSearch={(value) => {
              setSearch(value.trim());
              setPage(0);
            }}
          />
          <Select
            allowClear
            placeholder="კატეგორია"
            className="!w-full sm:!w-44"
            value={filterCategoryId}
            onChange={(value) => {
              setFilterCategoryId(value);
              setFilterSubcategoryId(undefined);
              setPage(0);
            }}
            options={categoryOptions}
          />
          <Select
            allowClear
            placeholder="ქვეკატეგორია"
            className="!w-full sm:!w-44"
            disabled={!filterCategoryId}
            value={filterSubcategoryId}
            onChange={(value) => {
              setFilterSubcategoryId(value);
              setPage(0);
            }}
            options={subcategoryOptionsFor(filterCategoryId)}
          />
          <Select
            allowClear
            placeholder="სტატუსი"
            className="!w-full sm:!w-36"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(0);
            }}
            options={[
              { value: 'ACTIVE', label: STATUS_META.ACTIVE.label },
              { value: 'PENDING', label: STATUS_META.PENDING.label },
            ]}
          />
          <Select
            placeholder="დალაგება"
            className="!w-full sm:!w-40"
            allowClear
            value={sortBy}
            onChange={(value) => {
              setSortBy(value);
              setPage(0);
            }}
            options={[
              { value: 'createdAt', label: 'თარიღით' },
              { value: 'name', label: 'დასახელებით' },
            ]}
          />
          <Select
            className="!w-full sm:!w-32"
            value={sortDir}
            onChange={(value) => {
              setSortDir(value);
              setPage(0);
            }}
            options={[
              { value: 'DESC', label: 'კლებადი' },
              { value: 'ASC', label: 'ზრდადი' },
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={adminBrackets}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page + 1,
            pageSize,
            total: adminBracketsTotal,
            showSizeChanger: true,
            showTotal: (total) => `სულ ${total} თამაში`,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage - 1);
              setPageSize(nextSize);
            },
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="ახალი თამაში"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        confirmLoading={loading}
        okText="შექმნა"
        cancelText="გაუქმება"
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ status: 'PENDING', isFavorite: false }}
        >
          <Form.Item
            name="name"
            label="დასახელება"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ დასახელება' }]}
          >
            <Input placeholder="მაგ: საუკეთესო სპორტსმენი" />
          </Form.Item>
          <Form.Item
            name="status"
            label="სტატუსი"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ სტატუსი' }]}
          >
            <Select
              options={[
                { value: 'ACTIVE', label: STATUS_META.ACTIVE.label },
                { value: 'PENDING', label: STATUS_META.PENDING.label },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="კატეგორია"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ კატეგორია' }]}
          >
            <Select
              placeholder="აირჩიეთ კატეგორია"
              onChange={() => createForm.setFieldsValue({ subcategoryId: undefined })}
              options={categoryOptions}
            />
          </Form.Item>
          <Form.Item name="subcategoryId" label="ქვეკატეგორია">
            <Select
              allowClear
              placeholder="აირჩიეთ ქვეკატეგორია"
              disabled={!selectedCategoryId}
              options={subcategoryOptions}
            />
          </Form.Item>
          <Form.Item name="isFavorite" label="ფავორიტი" valuePropName="checked">
            <Switch checkedChildren="კი" unCheckedChildren="არა" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="თამაშის რედაქტირება"
        open={editOpen}
        onOk={handleEdit}
        onCancel={() => {
          setEditOpen(false);
          setEditingBracket(null);
        }}
        confirmLoading={loading}
        okText="შენახვა"
        cancelText="გაუქმება"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="დასახელება"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ დასახელება' }]}
          >
            <Input placeholder="მაგ: საუკეთესო სპორტსმენი" />
          </Form.Item>
          <Form.Item
            name="status"
            label="სტატუსი"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ სტატუსი' }]}
          >
            <Select
              options={[
                { value: 'ACTIVE', label: STATUS_META.ACTIVE.label },
                { value: 'PENDING', label: STATUS_META.PENDING.label },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="კატეგორია"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ კატეგორია' }]}
          >
            <Select
              placeholder="აირჩიეთ კატეგორია"
              onChange={() => editForm.setFieldsValue({ subcategoryId: undefined })}
              options={categoryOptions}
            />
          </Form.Item>
          <Form.Item name="subcategoryId" label="ქვეკატეგორია">
            <Select
              allowClear
              placeholder="აირჩიეთ ქვეკატეგორია"
              disabled={!editSelectedCategoryId}
              options={editSubcategoryOptions}
            />
          </Form.Item>
          <Form.Item name="isFavorite" label="ფავორიტი" valuePropName="checked">
            <Switch checkedChildren="კი" unCheckedChildren="არა" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={selectedBracket ? `${selectedBracket.name} — ვარიანტები` : 'თამაში'}
        open={detailsOpen}
        onCancel={closeDetails}
        footer={[
          <Button key="close" onClick={closeDetails}>
            დახურვა
          </Button>,
        ]}
        width={800}
      >
        {loading && !currentBracketDetails ? (
          <div className="py-10 text-center text-gray-500">იტვირთება...</div>
        ) : currentBracketDetails ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">ვარიანტი</div>
                <div className="text-lg font-semibold text-gray-800">{optionsList.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">სულ მოგებები</div>
                <div className="text-lg font-semibold text-indigo-600 flex items-center gap-1">
                  <TrophyOutlined /> {totalWinnings}
                </div>
              </div>
            </div>

            {(currentBracketDetails.categoryResponse ||
              currentBracketDetails.subCategoryResponse) && (
              <div className="flex flex-wrap gap-2">
                {currentBracketDetails.categoryResponse && (
                  <Tag color="blue">
                    კატეგორია: {currentBracketDetails.categoryResponse.categoryName}
                  </Tag>
                )}
                {currentBracketDetails.subCategoryResponse && (
                  <Tag color="cyan">
                    ქვეკატეგორია: {currentBracketDetails.subCategoryResponse.subCategoryName}
                  </Tag>
                )}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">ახალი ვარიანტის დამატება</div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Upload
                  accept="image/*"
                  fileList={fileList}
                  beforeUpload={(file) => {
                    setUploadFile(file);
                    setFileList([
                      {
                        uid: file.uid,
                        name: file.name,
                        status: 'done',
                      },
                    ]);
                    return false;
                  }}
                  onRemove={() => {
                    setUploadFile(null);
                    setFileList([]);
                  }}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>აირჩიე ფოტო</Button>
                </Upload>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddOption}
                  loading={uploading}
                  disabled={!uploadFile}
                >
                  დამატება
                </Button>
              </div>
            </div>

            {optionsList.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ვარიანტი ჯერ არ დაემატება. დაამატე მინიმუმ 2 ვარიანტი თამაშის დასაწყებად.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {optionsList.map((opt: BracketOption) => (
                  <div
                    key={opt.id}
                    className="group relative rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all bg-white shadow-sm"
                  >
                    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                      {optionPhotos[opt.id] ? (
                        <Image
                          src={optionPhotos[opt.id]}
                          alt={`Option ${opt.id}`}
                          className="!h-full !w-full !object-cover"
                          preview={{ mask: 'ნახვა' }}
                        />
                      ) : (
                        <span className="text-3xl text-gray-300">🖼️</span>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <Tag color="gold" icon={<TrophyOutlined />}>
                        {opt.totalWinnings}
                      </Tag>
                      <Popconfirm
                        title="წაშლა"
                        description="დარწმუნებული ხართ?"
                        okText="დიახ"
                        cancelText="არა"
                        onConfirm={() => handleDeleteOption(opt.id)}
                      >
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">დეტალები ვერ მოიძებნა</div>
        )}
      </Modal>

      {/* Suggestions Modal */}
      <Modal
        title={suggestionBracket ? `${suggestionBracket.name} — შეთავაზებები` : 'შეთავაზებები'}
        open={suggestionsOpen}
        onCancel={closeSuggestions}
        footer={[
          <Button key="close" onClick={closeSuggestions}>
            დახურვა
          </Button>,
        ]}
        width={640}
      >
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">შეთავაზებების დამატება</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                mode="multiple"
                allowClear
                className="flex-1"
                placeholder="აირჩიეთ თამაშები"
                value={selectedSuggestionIds}
                onChange={setSelectedSuggestionIds}
                optionFilterProp="label"
                options={suggestionCandidates.map((b) => ({ value: b.id, label: b.name }))}
                notFoundContent="დასამატებელი თამაში არ არის"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSuggestions}
                loading={suggestionsLoading}
                disabled={selectedSuggestionIds.length === 0}
              >
                დამატება
              </Button>
            </div>
          </div>

          {suggestionsLoading && suggestions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">იტვირთება...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">შეთავაზებები ჯერ არ დაემატა.</div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <BulbOutlined className="text-amber-600" />
                    </div>
                    <div className="font-medium text-gray-800">{s.name}</div>
                  </div>
                  <Popconfirm
                    title="შეთავაზების წაშლა"
                    description="დარწმუნებული ხართ?"
                    okText="დიახ"
                    cancelText="არა"
                    onConfirm={() => handleRemoveSuggestion(s.id)}
                  >
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
