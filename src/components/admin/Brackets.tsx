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
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useBracketStore } from '../../store';
import bracketService from '../../services/api/bracketService';
import type { Bracket, BracketOption, BracketStatus } from '../../services/api/bracketService';

const STATUS_META: Record<BracketStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'აქტიური', color: 'green' },
  PENDING: { label: 'მოლოდინში', color: 'orange' },
};

const { Title } = Typography;

export const Brackets = () => {
  const {
    adminBrackets,
    currentBracketDetails,
    loading,
    error,
    fetchAdminBrackets,
    fetchAdminBracket,
    createBracket,
    updateBracket,
    deleteBracket,
    addBracketOption,
    deleteBracketOption,
    clearError,
  } = useBracketStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createForm] = Form.useForm<{ name: string; status: BracketStatus }>();
  const [editForm] = Form.useForm<{ name: string; status: BracketStatus }>();
  const [editingBracket, setEditingBracket] = useState<Bracket | null>(null);
  const [selectedBracket, setSelectedBracket] = useState<Bracket | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [optionPhotos, setOptionPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());

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
    fetchAdminBrackets();
  }, [fetchAdminBrackets]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await createBracket(values.name.trim(), values.status);
      message.success('თამაში წარმატებით შეიქმნა');
      createForm.resetFields();
      setCreateOpen(false);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
    }
  };

  const openEdit = (bracket: Bracket) => {
    setEditingBracket(bracket);
    editForm.setFieldsValue({ name: bracket.name, status: bracket.status });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingBracket) return;
    try {
      const values = await editForm.validateFields();
      await updateBracket(editingBracket.id, values.name.trim(), values.status);
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
      render: (name: string) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <ThunderboltOutlined className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{name}</span>
        </div>
      ),
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
        <Table
          columns={columns}
          dataSource={adminBrackets}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `სულ ${total} თამაში`,
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
        <Form form={createForm} layout="vertical" initialValues={{ status: 'PENDING' }}>
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
    </div>
  );
};
