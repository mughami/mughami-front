import { useState } from 'react';
import { Layout, Menu, Button, Drawer, Grid } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BookOutlined,
  TrophyOutlined,
  BarChartOutlined,
  // SettingOutlined,
  FormOutlined,
  CrownOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface AdminLayoutProps {
  children: React.ReactNode;
  selectedKey: string;
  onMenuSelect: (key: string) => void;
}

export const AdminLayout = ({ children, selectedKey, onMenuSelect }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const screens = useBreakpoint();
  // Desktop-first: useBreakpoint is empty on first render, so only treat as
  // mobile once we positively know the viewport is below the lg breakpoint.
  const isMobile = screens.lg === false;

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
      label: 'ქვიზები',
    },
    {
      key: 'tournaments',
      icon: <CrownOutlined />,
      label: 'ტურნირები',
    },
    {
      key: 'polls',
      icon: <FormOutlined />,
      label: 'გამოკითხვები',
    },
    {
      key: 'brackets',
      icon: <ThunderboltOutlined />,
      label: 'ეს თუ ის',
    },
    {
      key: 'quiz-stats',
      icon: <BarChartOutlined />,
      label: 'ქვიზების სტატისტიკა',
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'პარამეტრები',
    // },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const brand = (
    <div className="h-16 flex items-center justify-center">
      <h1 className="text-white text-xl font-bold">მუღამი</h1>
    </div>
  );

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={({ key }) => {
        onMenuSelect(key);
        setMobileOpen(false);
      }}
    />
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop / tablet: fixed collapsible sidebar */}
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed}>
          {brand}
          {menu}
        </Sider>
      )}

      {/* Mobile: sidebar becomes a slide-in drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={240}
          closable={false}
          styles={{ body: { padding: 0, background: '#001529' } }}
        >
          {brand}
          {menu}
        </Drawer>
      )}

      <Layout>
        <Header className="bg-white p-0 flex items-center justify-between px-4">
          <Button
            type="text"
            icon={
              isMobile ? (
                <MenuUnfoldOutlined />
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed(!collapsed))}
            className="text-lg"
          />
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} className="text-lg">
            <span className="hidden sm:inline">გასვლა</span>
          </Button>
        </Header>
        <Content className="m-3 p-3 sm:m-6 sm:p-6 bg-white min-h-[280px] overflow-x-auto">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
