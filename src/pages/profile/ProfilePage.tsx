import { useState } from 'react';
import {
  UserOutlined,
  MailOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
  LogoutOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  WarningOutlined,
  NumberOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store';
import { notification, Tooltip, Spin } from 'antd';
import { authService } from '../../services';
import { UserStatus } from '../../types';
import type { Gender } from '../../services/api/authService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const [formData, setFormData] = useState({
    firstName: user?.name || '',
    lastName: user?.lastname || '',
    userName: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    age: user?.age?.toString() || '',
    gender: (user?.gender || '') as Gender | '',
  });

  const handleStartEdit = () => {
    setFormData({
      firstName: user?.name || '',
      lastName: user?.lastname || '',
      userName: user?.username || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      age: user?.age?.toString() || '',
      gender: (user?.gender || '') as Gender | '',
    });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: (formData.gender as Gender) || undefined,
      });
      api['success']({ message: 'პროფილი წარმატებით განახლდა' });
      setIsEditing(false);
    } catch {
      api['error']({ message: 'პროფილის განახლება ვერ მოხერხდა' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRequestOTP = async () => {
    if (!user?.email) return;
    try {
      setIsVerifying(true);
      await authService.resendOTP(user.email);
      api['success']({
        message: 'OTP კოდი გაიგზავნა',
        description: 'გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა',
      });
    } catch (error) {
      console.error('OTP request error:', error);
      api['error']({
        message: 'OTP კოდის მიღების შეცდომა',
        description: 'გთხოვთ სცადოთ ხელახლა',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email || !otp) return;
    try {
      setIsVerifying(true);
      await authService.verifyAccount(user.email, otp);
      api['success']({
        message: 'ელ-ფოსტა წარმატებით დადასტურდა',
        description: 'თქვენი ანგარიში ახლა გააქტიურებულია',
      });
      setOtp('');
    } catch (error) {
      console.error('Verification error:', error);
      api['error']({
        message: 'ელ-ფოსტის დადასტურების შეცდომა',
        description: 'არასწორი კოდი. გთხოვთ სცადოთ ხელახლა',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Layout>
      {contextHolder}
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title">პროფილი</h1>

        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-group">
                  <label htmlFor="firstName" className="input-label">სახელი</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserOutlined className="text-gray-400" />
                    </span>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="lastName" className="input-label">გვარი</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserOutlined className="text-gray-400" />
                    </span>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="userName" className="input-label">მომხმარებლის სახელი</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserOutlined className="text-gray-400" />
                  </span>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email" className="input-label">ელ-ფოსტა</label>
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
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="phoneNumber" className="input-label">ტელეფონის ნომერი</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneOutlined className="text-gray-400" />
                  </span>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    maxLength={9}
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="input-group">
                  <label htmlFor="age" className="input-label">ასაკი</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min={1}
                    max={150}
                    value={formData.age}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="gender" className="input-label">სქესი</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">აირჩიეთ სქესი</option>
                    <option value="MALE">მამრობითი</option>
                    <option value="FEMALE">მდედრობითი</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <CloseOutlined className="mr-1" /> გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-60"
                >
                  {isLoading ? <Spin size="small" className="mr-2" /> : <SaveOutlined className="mr-1" />}
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
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold text-gray-900">{user?.name} {user?.lastname}</h2>
                      {user?.userStatus !== UserStatus.VERIFIED && (
                        <Tooltip title="თქვენი ელ-ფოსტა არ არის დადასტურებული">
                          <WarningOutlined className="ml-2 text-yellow-500" />
                        </Tooltip>
                      )}
                    </div>
                    {user?.username && (
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    )}
                    <p className="text-gray-600 flex items-center mt-1">
                      <MailOutlined className="mr-2" />
                      {user?.email}
                    </p>
                    {user?.phoneNumber && (
                      <p className="text-gray-600 flex items-center text-sm mt-1">
                        <PhoneOutlined className="mr-2" />
                        {user.phoneNumber}
                      </p>
                    )}
                    {(user?.gender || user?.age) && (
                      <div className="flex items-center gap-4 mt-1">
                        {user?.gender && (
                          <p className="text-gray-600 flex items-center text-sm">
                            {user.gender === 'MALE' ? (
                              <ManOutlined className="mr-1 text-blue-500" />
                            ) : (
                              <WomanOutlined className="mr-1 text-pink-500" />
                            )}
                            {user.gender === 'MALE' ? 'მამრობითი' : 'მდედრობითი'}
                          </p>
                        )}
                        {user?.age && (
                          <p className="text-gray-600 flex items-center text-sm">
                            <NumberOutlined className="mr-1" />
                            {user.age} წელი
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleStartEdit}
                  className="text-secondary hover:text-secondary-dark transition-colors"
                >
                  <EditOutlined className="text-lg" />
                </button>
              </div>

              {/* Email Verification Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafetyOutlined className="text-gray-400 mr-2" />
                    <span className="text-gray-600">ელ-ფოსტის დადასტურება</span>
                  </div>
                  {user?.userStatus === UserStatus.VERIFIED ? (
                    <span className="text-green-600 text-sm font-medium">დადასტურებული</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="OTP კოდი"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="form-input w-32"
                      />
                      <button
                        onClick={handleVerifyEmail}
                        disabled={isVerifying || !otp}
                        className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                      >
                        დადასტურება
                      </button>
                      <button
                        onClick={handleRequestOTP}
                        disabled={isVerifying}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        კოდის მიღება
                      </button>
                    </div>
                  )}
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
