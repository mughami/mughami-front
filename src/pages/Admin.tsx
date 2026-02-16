import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../components/admin/Dashboard';
import { Users } from '../components/admin/Users';
import { Categories } from '../components/admin/Categories';
import { Polls } from '../components/admin/Polls';
import { Quizzes } from '../components/admin/Quizzes';
import { Tournaments } from '../components/admin/Tournaments';
import { Settings } from '../components/admin/Settings';
import QuizStats from '../components/admin/QuizStats';
import useDashboardStore from '../store/dashboardStore';
import { usePollStore } from '../store/pollStore';
import { useQuizStore } from '../store/quizStore';
import { useTournamentStore } from '../store/tournamentStore';
import useUserStore from '../store/userStore';
import useSettingsStore from '../store/settingsStore';
import { useCategoryStore } from '../store/categoryStore';

const Admin = () => {
  const { fetchStats, fetchQuizStats } = useDashboardStore();
  const { fetchPolls } = usePollStore();
  const { fetchAdminQuizzes } = useQuizStore();
  const { fetchAdminTournaments } = useTournamentStore();
  const { fetchUsers } = useUserStore();
  const { fetchSettings } = useSettingsStore();
  const { fetchAdminCategories } = useCategoryStore();

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
    } else if (selectedKey === 'categories') {
      fetchAdminCategories();
    } else if (selectedKey === 'settings') {
      fetchSettings();
    } else if (selectedKey === 'quiz-stats') {
      fetchQuizStats(1, 10);
    } else if (selectedKey === 'tournaments') {
      fetchAdminTournaments();
    }
  }, [
    selectedKey,
    fetchStats,
    fetchQuizStats,
    fetchPolls,
    fetchAdminQuizzes,
    fetchAdminTournaments,
    fetchUsers,
    fetchAdminCategories,
    fetchSettings,
  ]);

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'categories':
        return <Categories />;
      case 'polls':
        return <Polls />;
      case 'contests':
        return <Quizzes />;
      case 'tournaments':
        return <Tournaments />;
      case 'quiz-stats':
        return <QuizStats />;
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
