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
import type { CategoryResponse } from '../../types';

const { Title } = Typography;

interface CategoryFormData {
  categoryName: string;
  subCategories: string[];
}

export const Categories = () => {
  const { adminCategories, isLoading, error, fetchAdminCategories, createAdminCategory, clearError } =
    useCategoryStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateCategory = async (values: CategoryFormData) => {
    try {
      const categoryData = {
        categoryName: values.categoryName,
        subCategoryRequestList: values.subCategories
          .filter((sub) => sub.trim())
          .map((subCategoryName) => ({ subCategoryName: subCategoryName.trim() })),
      };

      await createAdminCategory(categoryData);
      message.success('კატეგორია წარმატებით შეიქმნა');
      setIsModalVisible(false);
      form.resetFields();
    } catch {
      message.error('კატეგორიის შექმნისას მოხდა შეცდომა');
    }
  };

  const handleShowSubCategories = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsSubCategoryModalVisible(true);
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
          <Button type="link" icon={<EditOutlined />} disabled>
            რედაქტირება
          </Button>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ კატეგორიის წაშლა?"
            okText="დიახ"
            cancelText="არა"
            disabled
          >
            <Button type="link" danger icon={<DeleteOutlined />} disabled>
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
      dataIndex: 'subCategoryName',
      key: 'subCategoryName',
    },
    {
      title: 'შექმნის თარიღი',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ka-GE'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>კატეგორიების მართვა</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
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

      {/* Create Category Modal */}
      <Modal
        title="ახალი კატეგორიის დამატება"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCategory}
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
                <label className="block text-sm font-medium mb-2">ქვეკატეგორიები</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name]}
                      style={{ flex: 1 }}
                      //   rules={[{ required: true, message: 'შეიყვანეთ ქვეკატეგორიის სახელი' }]}
                    >
                      <Input placeholder="ქვეკატეგორიის სახელი" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button type="link" danger onClick={() => remove(name)}>
                        წაშლა
                      </Button>
                    )}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    ქვეკატეგორიის დამატება
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item className="mb-0 pt-4">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>გაუქმება</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                შექმნა
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* SubCategories Modal */}
      <Modal
        title={`${selectedCategory?.categoryName} - ქვეკატეგორიები`}
        open={isSubCategoryModalVisible}
        onCancel={() => setIsSubCategoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSubCategoryModalVisible(false)}>
            დახურვა
          </Button>,
        ]}
        width={700}
      >
        <Table
          columns={subCategoryColumns}
          dataSource={selectedCategory?.subCategoryResponseList || []}
          rowKey="subCategoryId"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};
