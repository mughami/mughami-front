import { useState, useEffect } from 'react';
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  LogoutOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to update the user profile
    // For now, we'll just toggle the editing state
    setIsEditing(false);
    // In a real app, you would update the user in the store after a successful API call
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  //   if (!user) {
  //     return (
  //       <Layout>
  //         <div className="text-center py-10">
  //           <p className="text-xl text-red-600">მომხმარებელი არ არის ავტორიზებული</p>
  //           <Link to="/login" className="form-link mt-4 inline-block">
  //             შესვლა
  //           </Link>
  //         </div>
  //       </Layout>
  //     );
  //   }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title">პროფილი</h1>

        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="input-group">
                <label htmlFor="name" className="input-label">
                  სახელი
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserOutlined className="text-gray-400" />
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input "
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  ელ-ფოსტა
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailOutlined className="text-gray-400" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input "
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  შენახვა
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-600 flex items-center">
                      <MailOutlined className="mr-2" />
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-secondary hover:text-secondary-dark transition-colors"
                >
                  <EditOutlined className="text-lg" />
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <CalendarOutlined className="mr-2" />
                  <span>რეგისტრაციის თარიღი: {formatDate(user?.createdAt || '')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-card p-4">
            <h3 className="font-medium text-gray-700 mb-2">დასრულებული ვიქტორინები</h3>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <h3 className="font-medium text-gray-700 mb-2">მოგებული პრიზები</h3>
            <p className="text-2xl font-bold text-green-600">0 ₾</p>
          </div>
        </div>

        {/* Logout section */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ანგარიშის მართვა</h3>

          {showConfirmLogout ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <QuestionCircleOutlined className="text-red-500 text-lg mt-0.5 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">დარწმუნებული ხართ, რომ გსურთ გასვლა?</p>
                  <p className="text-red-700 text-sm mt-1">
                    გასვლის შემდეგ დაგჭირდებათ ხელახალი ავტორიზაცია.
                  </p>
                  <div className="mt-3 flex space-x-3">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      დიახ, გასვლა
                    </button>
                    <button
                      onClick={() => setShowConfirmLogout(false)}
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      გაუქმება
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmLogout(true)}
              className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              <LogoutOutlined className="mr-2" />
              გასვლა
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
