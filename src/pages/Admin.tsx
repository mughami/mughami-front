import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../components/admin/Dashboard';
import { Users } from '../components/admin/Users';
import { Polls } from '../components/admin/Polls';
import { Quizzes } from '../components/admin/Quizzes';
import { Settings } from '../components/admin/Settings';
import useDashboardStore from '../store/dashboardStore';
import { usePollStore } from '../store/pollStore';
import { useQuizStore } from '../store/quizStore';
import useUserStore from '../store/userStore';
import useSettingsStore from '../store/settingsStore';

const Admin = () => {
  const { fetchStats } = useDashboardStore();
  const { fetchPolls } = usePollStore();
  const { fetchAdminQuizzes } = useQuizStore();
  const { fetchUsers } = useUserStore();
  const { fetchSettings } = useSettingsStore();

  const [selectedKey, setSelectedKey] = useState(() => {
    const savedKey = localStorage.getItem('adminSelectedKey');
    return savedKey || 'dashboard';
  });

  const handleMenuSelect = (key: string) => {
    setSelectedKey(key);
    localStorage.setItem('adminSelectedKey', key);
  };

  useEffect(() => {
    if (selectedKey === 'dashboard') {
      fetchStats();
    } else if (selectedKey === 'polls') {
      fetchPolls(0, 10);
    } else if (selectedKey === 'contests') {
      fetchAdminQuizzes();
    } else if (selectedKey === 'users') {
      fetchUsers();
    } else if (selectedKey === 'settings') {
      fetchSettings();
    }
  }, [selectedKey, fetchStats, fetchPolls, fetchAdminQuizzes, fetchUsers, fetchSettings]);

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'polls':
        return <Polls />;
      case 'contests':
        return <Quizzes />;
      case 'settings':
        return <Settings />;
      default:
        return <>ჯერ არ დამატებულა</>;
    }
  };

  return (
    <AdminLayout selectedKey={selectedKey} onMenuSelect={handleMenuSelect}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
