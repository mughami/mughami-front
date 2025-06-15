import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BookOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
  selectedKey: string;
  onMenuSelect: (key: string) => void;
}

export const AdminLayout = ({ children, selectedKey, onMenuSelect }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

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
      key: 'polls',
      icon: <FormOutlined />,
      label: 'გამოკითხვები',
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="h-16 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">მუღამი</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => onMenuSelect(key)}
        />
      </Sider>
      <Layout>
        <Header className="bg-white p-0 flex items-center justify-between px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} className="text-lg">
            გასვლა
          </Button>
        </Header>
        <Content className="m-6 p-6 bg-white min-h-[280px]">{children}</Content>
      </Layout>
    </Layout>
  );
};
