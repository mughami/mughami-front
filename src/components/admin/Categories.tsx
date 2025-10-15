import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../../store/categoryStore';
import type { CategoryResponse, SubCategoryResponse } from '../../types';

const { Title } = Typography;

interface CategoryFormData {
  categoryName: string;
  subCategories: string[];
}

export const Categories = () => {
  const {
    adminCategories,
    isLoading,
    error,
    fetchAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
    fetchAdminSubcategories,
    createAdminSubcategory,
    updateAdminSubcategory,
    deleteAdminSubcategory,
    clearError,
  } = useCategoryStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [subForm] = Form.useForm();
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editingSubName, setEditingSubName] = useState<string>('');

  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateOrUpdateCategory = async (values: CategoryFormData) => {
    try {
      const categoryData = {
        categoryName: values.categoryName,
        subCategoryRequestList: values.subCategories
          .filter((sub) => sub.trim())
          .map((subCategoryName) => ({ subCategoryName: subCategoryName.trim() })),
      };

      if (isEditing && selectedCategoryId != null) {
        await updateAdminCategory(selectedCategoryId, categoryData);
        message.success('კატეგორია განახლებულია');
      } else {
        await createAdminCategory(categoryData);
        message.success('კატეგორია წარმატებით შეიქმნა');
      }
      setIsModalVisible(false);
      setIsEditing(false);
      setSelectedCategoryId(null);
      form.resetFields();
    } catch {
      message.error('ქმედების შესრულებისას მოხდა შეცდომა');
    }
  };

  const handleShowSubCategories = async (category: CategoryResponse) => {
    setSelectedCategoryId(category.categoryId);
    setIsSubCategoryModalVisible(true);
    try {
      await fetchAdminSubcategories(category.categoryId);
    } catch {
      message.error('ქვეკატეგორიების ჩატვირთვისას მოხდა შეცდომა');
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedCategoryId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (category: CategoryResponse) => {
    setIsEditing(true);
    setSelectedCategoryId(category.categoryId);
    form.setFieldsValue({
      categoryName: category.categoryName,
      subCategories: category.subCategoryResponseList.map((s) => s.subCategoryName),
    });
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteAdminCategory(categoryId);
      message.success('კატეგორია წაშლილია');
    } catch {
      message.error('კატეგორიის წაშლისას მოხდა შეცდომა');
    }
  };

  const currentCategory: CategoryResponse | null =
    selectedCategoryId != null
      ? adminCategories.find((c) => c.categoryId === selectedCategoryId) || null
      : null;

  const handleAddSubcategory = async () => {
    try {
      const values = await subForm.validateFields();
      if (selectedCategoryId == null) return;
      await createAdminSubcategory(selectedCategoryId, {
        subCategoryName: (values.subCategoryName as string).trim(),
      });
      message.success('ქვეკატეგორია დამატებულია');
      subForm.resetFields();
    } catch {
      message.error('ქვეკატეგორიის დამატებისას მოხდა შეცდომა');
    }
  };

  const startEditSub = (row: { subCategoryId: number; subCategoryName: string }) => {
    setEditingSubId(row.subCategoryId);
    setEditingSubName(row.subCategoryName);
  };

  const cancelEditSub = () => {
    setEditingSubId(null);
    setEditingSubName('');
  };

  const saveEditSub = async () => {
    if (editingSubId == null) return;
    try {
      await updateAdminSubcategory(editingSubId, { subCategoryName: editingSubName.trim() });
      message.success('ქვეკატეგორია განახლებულია');
      cancelEditSub();
    } catch {
      message.error('ქვეკატეგორიის განახლებისას მოხდა შეცდომა');
    }
  };

  const handleDeleteSub = async (subCategoryId: number) => {
    try {
      await deleteAdminSubcategory(subCategoryId);
      message.success('ქვეკატეგორია წაშლილია');
    } catch {
      message.error('ქვეკატეგორიის წაშლისას მოხდა შეცდომა');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 80,
    },
    {
      title: 'კატეგორიის სახელი',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'ქვეკატეგორიები',
      key: 'subCategories',
      render: (record: CategoryResponse) => (
        <Tag color="blue">{record.subCategoryResponseList.length} ქვეკატეგორია</Tag>
      ),
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      render: (record: CategoryResponse) => (
        <Space>
          <Button
            type="link"
            icon={<FolderOpenOutlined />}
            onClick={() => handleShowSubCategories(record)}
          >
            ქვეკატეგორიები
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)}>
            რედაქტირება
          </Button>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ კატეგორიის წაშლა?"
            okText="დიახ"
            cancelText="არა"
            onConfirm={() => handleDeleteCategory(record.categoryId)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              წაშლა
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subCategoryColumns = [
    {
      title: 'ID',
      dataIndex: 'subCategoryId',
      key: 'subCategoryId',
      width: 80,
    },
    {
      title: 'ქვეკატეგორიის სახელი',
      key: 'subCategoryName',
      render: (record: SubCategoryResponse) =>
        editingSubId === record.subCategoryId ? (
          <Input
            value={editingSubName}
            onChange={(e) => setEditingSubName(e.target.value)}
            disabled={isLoading}
          />
        ) : (
          record.subCategoryName
        ),
    },
    {
      title: 'შექმნის თარიღი',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ka-GE'),
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      render: (record: SubCategoryResponse) => (
        <Space>
          {editingSubId === record.subCategoryId ? (
            <>
              <Button type="link" onClick={saveEditSub} loading={isLoading}>
                შენახვა
              </Button>
              <Button type="link" onClick={cancelEditSub} disabled={isLoading}>
                გაუქმება
              </Button>
            </>
          ) : (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => startEditSub(record)}>
                რედაქტირება
              </Button>
              <Popconfirm
                title="დარწმუნებული ხართ?"
                description="გსურთ ამ ქვეკატეგორიის წაშლა?"
                okText="დიახ"
                cancelText="არა"
                onConfirm={() => handleDeleteSub(record.subCategoryId)}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  წაშლა
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>კატეგორიების მართვა</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
          ახალი კატეგორია
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={adminCategories}
          loading={isLoading}
          rowKey="categoryId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `სულ: ${total} კატეგორია`,
          }}
        />
      </Card>

      {/* Create/Edit Category Modal */}
      <Modal
        title={isEditing ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორიის დამატება'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setSelectedCategoryId(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdateCategory}
          initialValues={{ subCategories: [''] }}
        >
          <Form.Item
            name="categoryName"
            label="კატეგორიის სახელი"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ კატეგორიის სახელი' }]}
          >
            <Input placeholder="მაგ: სპორტი" />
          </Form.Item>

          <Form.List name="subCategories">
            {(fields, { add, remove }) => (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">ქვეკატეგორიები</label>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name]} style={{ flex: 1 }}>
                      <Input placeholder="ქვეკატეგორიის სახელი" disabled={isEditing} />
                    </Form.Item>
                    {!isEditing && fields.length > 1 && (
                      <Button type="link" danger onClick={() => remove(name)}>
                        წაშლა
                      </Button>
                    )}
                  </Space>
                ))}
                {!isEditing && (
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      ქვეკატეგორიის დამატება
                    </Button>
                  </Form.Item>
                )}
                {isEditing && (
                  <div className="text-xs text-gray-500 mt-1">
                    ქვეკატეგორიების რედაქტირება/დამატება/წაშლა შესაძლებელია „ქვეკატეგორიები“ ღილაკიდან.
                  </div>
                )}
              </>
            )}
          </Form.List>

          <Form.Item className="mb-0 pt-4">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>გაუქმება</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {isEditing ? 'განახლება' : 'შექმნა'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* SubCategories Modal */}
      <Modal
        title={`${currentCategory?.categoryName || ''} - ქვეკატეგორიები`}
        open={isSubCategoryModalVisible}
        onCancel={() => setIsSubCategoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSubCategoryModalVisible(false)}>
            დახურვა
          </Button>,
        ]}
        width={700}
      >
        <Form form={subForm} layout="inline" onFinish={handleAddSubcategory} className="mb-4">
          <Form.Item
            name="subCategoryName"
            rules={[{ required: true, message: 'შეიყვანეთ ქვეკატეგორიის სახელი' }]}
          >
            <Input placeholder="ახალი ქვეკატეგორიის სახელი" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} icon={<PlusOutlined />}>
              დამატება
            </Button>
          </Form.Item>
        </Form>
        <Table
          columns={subCategoryColumns}
          dataSource={currentCategory?.subCategoryResponseList || []}
          rowKey="subCategoryId"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};
