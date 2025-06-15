import { Card } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined, FormOutlined } from '@ant-design/icons';
import useDashboardStore from '../../store/dashboardStore';

export const Dashboard = () => {
  const { stats, loading: statsLoading } = useDashboardStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card loading={statsLoading}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">მომხმარებლები</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-500 mt-1">აქტიური: {stats?.activeUsers || 0}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <UserOutlined className="text-2xl text-primary" />
          </div>
        </div>
      </Card>
      <Card loading={statsLoading}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">კატეგორიები</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalCategories || 0}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <BookOutlined className="text-2xl text-primary" />
          </div>
        </div>
      </Card>
      <Card loading={statsLoading}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">კონკურსები</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalContests || 0}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <TrophyOutlined className="text-2xl text-primary" />
          </div>
        </div>
      </Card>
      <Card loading={statsLoading}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">გამოკითხვები</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalPolls || 0}</p>
            <p className="text-sm text-gray-500 mt-1">სულ ხმა: {stats?.totalVotes || 0}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <FormOutlined className="text-2xl text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
};
