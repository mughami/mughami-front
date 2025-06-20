import { useState } from 'react';
import {
  Button,
  Table,
  Space,
  Typography,
  Popconfirm,
  Avatar,
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import useUserStore from '../../store/userStore';
import { UserStatus, UserRole } from '../../types';
import type { User } from '../../services/api/authService';

const { Title } = Typography;

export const Users = () => {
  const {
    users,
    totalUsers,
    loading: usersLoading,
    createUser,
    updateUser,
    deleteUser,
  } = useUserStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    message.success('User deleted successfully');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createUser({
        ...values,
        role: UserRole.ADMIN,
        permissions: ['EDITOR'],
      });
      message.success('მომხმარებელი წარმატებით დაემატა');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      status: user,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('მომხმარებელი წარმატებით განახლდა');
        setIsEditModalVisible(false);
        editForm.resetFields();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingUser(null);
    editForm.resetFields();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>მომხმარებლები</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          ახალი მომხმარებელი
        </Button>
      </div>
      <Table
        dataSource={users}
        loading={usersLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize,
          total: totalUsers,
          onChange: handlePageChange,
        }}
      >
        <Table.Column
          title="სახელი"
          dataIndex="name"
          key="name"
          render={(_text: string, record: User) => (
            <div className="flex items-center">
              <Avatar icon={<UserOutlined />} className="mr-2" />
              <span>{`${record.name} ${record.lastname}`}</span>
            </div>
          )}
        />
        <Table.Column title="ელ-ფოსტა" dataIndex="email" key="email" />
        <Table.Column
          title="სტატუსი"
          dataIndex="status"
          key="status"
          render={(status: UserStatus) => <span>{status}</span>}
        />
        <Table.Column
          title="მოქმედებები"
          key="actions"
          render={(_: unknown, record: User) => (
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                className="flex items-center"
              >
                რედაქტირება
              </Button>
              <Popconfirm
                title="დარწმუნებული ხართ?"
                description="მომხმარებლის წაშლა შეუქცევადია"
                onConfirm={() => handleDeleteUser(record.id)}
                okText="დიახ"
                cancelText="არა"
              >
                <Button danger icon={<DeleteOutlined />} className="flex items-center">
                  წაშლა
                </Button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>

      <Modal
        title="ახალი მომხმარებელი"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="სახელი"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ სახელი' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastname"
            label="გვარი"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ გვარი' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="ელ-ფოსტა"
            rules={[
              { required: true, message: 'გთხოვთ შეიყვანოთ ელ-ფოსტა' },
              { type: 'email', message: 'გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="პაროლი"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ პაროლი' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="რედაქტირება"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="სახელი"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ სახელი' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastname"
            label="გვარი"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ გვარი' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="ელ-ფოსტა"
            rules={[
              { required: true, message: 'გთხოვთ შეიყვანოთ ელ-ფოსტა' },
              { type: 'email', message: 'გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="სტატუსი"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ სტატუსი' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
