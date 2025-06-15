import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  // useLocation
} from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import QuizPage from './pages/quizzes/QuizPage';
import ProfilePage from './pages/profile/ProfilePage';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useAuthStore } from './store';
import { UserRole } from './types';
import './App.css';
import { useEffect, useState } from 'react';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getCurrentUser();
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [getCurrentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, user, getCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getCurrentUser();
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [getCurrentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(isAuthenticated, user, isLoading);
  if (!isAuthenticated || user?.userRole !== UserRole.ADMIN) {
    //go back previous page
    navigate(-1);
  }

  return children;
};

const AuthRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, user, getCurrentUser } = useAuthStore();
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  //if role is admin naviagate to /admin
  if (isAuthenticated && user?.userRole === UserRole.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && user?.userRole !== UserRole.ADMIN) {
    return <Navigate to="/categories" replace />;
  }

  return children;
};

function App() {
  // Redirect authenticated users away from auth pages

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <AuthRoute>
            <VerifyEmailPage />
          </AuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthRoute>
            <ForgotPasswordPage />
          </AuthRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:categoryId"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
