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
import QuizPlayPage from './pages/quizzes/QuizPlayPage';
import QuizResultsPage from './pages/quizzes/QuizResultsPage';
import PublicQuizPlayPage from './pages/quizzes/PublicQuizPlayPage';
import PublicQuizzesPage from './pages/quizzes/PublicQuizzesPage';
import ProfilePage from './pages/profile/ProfilePage';
import Home from './pages/Home';
import Admin from './pages/Admin';
import PollsPage from './pages/PollsPage';
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

  if (!isAuthenticated || user?.userRole !== UserRole.ADMIN) {
    navigate('/login');
  }

  return children;
};

const AuthRoute = ({ children }: { children: React.ReactElement }) => {
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

      {/* Quiz routes - accessible to all users */}
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/quizzes/:categoryId" element={<QuizPage />} />
      <Route path="/quiz/play/:quizId" element={<QuizPlayPage />} />
      <Route path="/quiz/results" element={<QuizResultsPage />} />

      {/* Polls route - accessible to all users */}
      <Route path="/polls" element={<PollsPage />} />

      {/* Public quiz routes - no authentication required */}
      <Route path="/public-quizzes" element={<PublicQuizzesPage />} />
      <Route path="/public-quiz/play/:quizId" element={<PublicQuizPlayPage />} />

      {/* Protected routes */}
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
