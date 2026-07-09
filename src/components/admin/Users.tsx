import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
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
  Card,
  Row,
  Col,
  DatePicker,
  Tag,
  Divider,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import useUserStore from '../../store/userStore';
import { UserStatus, UserRole } from '../../types';
import type { User } from '../../services/api/authService';
import type { UserFilters } from '../../services/api/userService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  VERIFIED: 'success',
  UNVERIFIED: 'warning',
  BLOCKED: 'error',
};

export const Users = () => {
  const { users, totalUsers, loading: usersLoading, createUser, updateUser, deleteUser, fetchUsers } = useUserStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [filters, setFilters] = useState<UserFilters>({});

  const updateFilter = (partial: Partial<UserFilters>) => {
    setCurrentPage(1);
    setFilters((f) => ({ ...f, ...partial }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.createdFrom) count++;
    if (filters.verifiedFrom) count++;
    return count;
  }, [filters]);

  useEffect(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters]);

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    message.success('მომხმარებელი წაიშალა');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createUser({ ...values, role: UserRole.ADMIN, permissions: ['EDITOR'] });
      message.success('მომხმარებელი წარმატებით დაემატა');
      setIsModalVisible(false);
      form.resetFields();
    } catch {
      // validation error — antd shows inline messages
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({ name: user.name, lastname: user.lastname, email: user.email });
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
    } catch {
      // validation error
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">მომხმარებლები</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          ახალი მომხმარებელი
        </Button>
      </div>

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
            <Button size="small" type="text" danger icon={<CloseCircleOutlined />} onClick={handleClearFilters}>
              გასუფთავება
            </Button>
          )
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">
                <CalendarOutlined className="mr-1" />რეგისტრაციის პერიოდი
              </Text>
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

          <Col xs={24} md={12}>
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs font-medium">
                <CheckCircleOutlined className="mr-1" />ვერიფიკაციის პერიოდი
              </Text>
              <RangePicker
                style={{ width: '100%' }}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                value={
                  filters.verifiedFrom && filters.verifiedTo
                    ? [dayjs(filters.verifiedFrom), dayjs(filters.verifiedTo)]
                    : null
                }
                onChange={(dates) =>
                  updateFilter({
                    verifiedFrom: dates?.[0]?.toISOString() ?? undefined,
                    verifiedTo: dates?.[1]?.toISOString() ?? undefined,
                  })
                }
              />
            </div>
          </Col>
        </Row>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <>
            <Divider className="!my-3" />
            <div className="flex flex-wrap gap-2">
              {filters.createdFrom && (
                <Tag closable color="blue" onClose={() => updateFilter({ createdFrom: undefined, createdTo: undefined })}>
                  რეგისტრაცია: {dayjs(filters.createdFrom).format('MM/DD')} → {dayjs(filters.createdTo).format('MM/DD')}
                </Tag>
              )}
              {filters.verifiedFrom && (
                <Tag closable color="blue" onClose={() => updateFilter({ verifiedFrom: undefined, verifiedTo: undefined })}>
                  ვერიფიკაცია: {dayjs(filters.verifiedFrom).format('MM/DD')} → {dayjs(filters.verifiedTo).format('MM/DD')}
                </Tag>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Table */}
      <Card size="small">
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={users}
          loading={usersLoading}
          rowKey="id"
          size="middle"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalUsers,
            showTotal: (total, range) => `${range[0]}–${range[1]} / სულ ${total}`,
            onChange: setCurrentPage,
          }}
        >
          <Table.Column
            title="მომხმარებელი"
            key="name"
            render={(_: unknown, record: User) => (
              <div className="flex items-center gap-2">
                <Avatar icon={<UserOutlined />} size="small" />
                <div>
                  <div className="font-medium leading-tight">{`${record.name} ${record.lastname}`}</div>
                  <div className="text-xs text-gray-400">{record.email}</div>
                </div>
              </div>
            )}
          />
          <Table.Column
            title="ტელეფონი"
            dataIndex="phoneNumber"
            key="phoneNumber"
            render={(phone: string) => phone || <Text type="secondary">—</Text>}
          />
          <Table.Column
            title="სტატუსი"
            dataIndex="status"
            key="status"
            render={(status: UserStatus) => (
              <Badge status={STATUS_COLOR[status] ?? 'default'} text={status} />
            )}
          />
          <Table.Column
            title="მოქმედებები"
            key="actions"
            render={(_: unknown, record: User) => (
              <Space size={0}>
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                  რედაქტირება
                </Button>
                <Popconfirm
                  title="მომხმარებლის წაშლა"
                  description="ეს მოქმედება შეუქცევადია."
                  onConfirm={() => handleDeleteUser(record.id)}
                  okText="წაშლა"
                  okButtonProps={{ danger: true }}
                  cancelText="გაუქმება"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>წაშლა</Button>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </Card>

      {/* Create Modal */}
      <Modal title="ახალი მომხმარებელი" open={isModalVisible} onOk={handleSubmit} onCancel={() => { setIsModalVisible(false); form.resetFields(); }} okText="დამატება" cancelText="გაუქმება">
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="სახელი" rules={[{ required: true, message: 'შეიყვანეთ სახელი' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastname" label="გვარი" rules={[{ required: true, message: 'შეიყვანეთ გვარი' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="მომხმარებლის სახელი" rules={[{ required: true, message: 'შეიყვანეთ username' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="ელ-ფოსტა" rules={[{ required: true, type: 'email', message: 'სწორი ელ-ფოსტა' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="პაროლი" rules={[{ required: true, message: 'შეიყვანეთ პაროლი' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="მომხმარებლის რედაქტირება" open={isEditModalVisible} onOk={handleEditSubmit} onCancel={() => { setIsEditModalVisible(false); setEditingUser(null); editForm.resetFields(); }} okText="განახლება" cancelText="გაუქმება">
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item name="name" label="სახელი" rules={[{ required: true, message: 'შეიყვანეთ სახელი' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastname" label="გვარი" rules={[{ required: true, message: 'შეიყვანეთ გვარი' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="ელ-ფოსტა" rules={[{ required: true, type: 'email', message: 'სწორი ელ-ფოსტა' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
