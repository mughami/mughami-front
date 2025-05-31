import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  LogoutOutlined,
  TrophyOutlined,
  MenuOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
    setShowLogoutConfirm(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-auth-gradient shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  src="/favicon.jpeg"
                  alt="მუღამი"
                />
              </Link>
              <span className="ml-3 text-lg sm:text-xl font-bold text-white">მუღამი</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:bg-primary-dark p-2 rounded-md"
            >
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex items-center">
            <Link
              to="/categories"
              className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-dark transition-colors ${
                location.pathname === '/categories' ? 'bg-primary-dark' : ''
              }`}
            >
              კატეგორიები
            </Link>

            <Link
              to="/leaderboard"
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              <TrophyOutlined className="mr-1" />
              ლიდერბორდი
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                <DashboardOutlined className="mr-1" />
                ადმინ პანელი
              </Link>
            )}

            <div className="ml-4 relative flex-shrink-0">
              <div>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  <UserOutlined className="mr-1" />
                  პროფილი
                </Link>

                <button
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogoutOutlined className="mr-1" />
                  გასვლა
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-2 pb-4 space-y-1">
            <Link
              to="/categories"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-dark transition-colors ${
                location.pathname === '/categories' ? 'bg-primary-dark' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              კატეგორიები
            </Link>

            <Link
              to="/leaderboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <TrophyOutlined className="mr-1" />
              ლიდერბორდი
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-dark transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <DashboardOutlined className="mr-1" />
                ადმინ პანელი
              </Link>
            )}

            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserOutlined className="mr-1" />
              პროფილი
            </Link>

            <button
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-dark transition-colors"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogoutOutlined className="mr-1" />
              გასვლა
            </button>
          </div>
        )}
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-4 animate-fade-in">
            <div className="flex items-start mb-4">
              <QuestionCircleOutlined className="text-red-500 text-lg mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">გასვლა</h3>
                <p className="mt-2 text-sm text-gray-500">
                  დარწმუნებული ხართ, რომ გსურთ გასვლა? გასვლის შემდეგ დაგჭირდებათ ხელახალი ავტორიზაცია.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                გაუქმება
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700"
              >
                გასვლა
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
