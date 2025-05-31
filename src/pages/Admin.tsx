import { useState } from 'react';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, Select, message, Space } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Footer from '../components/Footer';

const { Header, Sider, Content } = Layout;

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'დეშბორდი',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'მომხმარებლები',
    },
    {
      key: 'categories',
      icon: <BookOutlined />,
      label: 'კატეგორიები',
    },
    {
      key: 'contests',
      icon: <TrophyOutlined />,
      label: 'კონკურსები',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'ანალიტიკა',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'პარამეტრები',
    },
  ];

  const userColumns = [
    {
      title: 'სახელი',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ელ-ფოსტა',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'როლი',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'სტატუსი',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'მოქმედებები',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link">რედაქტირება</Button>
          <Button type="link" danger>
            წაშლა
          </Button>
        </Space>
      ),
    },
  ];

  const mockUsers = [
    {
      key: '1',
      name: 'გიორგი გიორგაძე',
      email: 'giorgi@example.com',
      role: 'მომხმარებელი',
      status: 'აქტიური',
    },
    {
      key: '2',
      name: 'ნინო ნინიძე',
      email: 'nino@example.com',
      role: 'ადმინისტრატორი',
      status: 'აქტიური',
    },
  ];

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      message.success('მონაცემები წარმატებით დაემატა');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-bold mb-2">მომხმარებლები</h3>
              <p className="text-3xl font-bold text-primary">1,234</p>
            </Card>
            <Card>
              <h3 className="text-lg font-bold mb-2">კატეგორიები</h3>
              <p className="text-3xl font-bold text-primary">12</p>
            </Card>
            <Card>
              <h3 className="text-lg font-bold mb-2">კონკურსები</h3>
              <p className="text-3xl font-bold text-primary">5</p>
            </Card>
          </div>
        );
      case 'users':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">მომხმარებლები</h2>
              <Button type="primary" onClick={showModal}>
                ახალი მომხმარებელი
              </Button>
            </div>
            <Table columns={userColumns} dataSource={mockUsers} />
          </div>
        );
      default:
        return <div>აირჩიეთ სექცია</div>;
    }
  };

  return (
    <>
      <Layout className="min-h-screen">
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div className="h-8 m-4 bg-white/10 rounded" />
          <Menu
            theme="dark"
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Sider>
        <Layout>
          <Header className="bg-white p-0" />
          <Content className="m-6">{renderContent()}</Content>
        </Layout>

        <Modal
          title="ახალი მომხმარებელი"
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          okText="დამატება"
          cancelText="გაუქმება"
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
              name="role"
              label="როლი"
              rules={[{ required: true, message: 'გთხოვთ აირჩიოთ როლი' }]}
            >
              <Select>
                <Select.Option value="user">მომხმარებელი</Select.Option>
                <Select.Option value="admin">ადმინისტრატორი</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
      <Footer />
    </>
  );
};

export default Admin;
