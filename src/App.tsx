import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  // useLocation
} from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import Loading from './components/Loading';
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const QuizPage = lazy(() => import('./pages/quizzes/QuizPage'));
const QuizPlayPage = lazy(() => import('./pages/quizzes/QuizPlayPage'));
const QuizResultsPage = lazy(() => import('./pages/quizzes/QuizResultsPage'));
const PublicQuizPlayPage = lazy(() => import('./pages/quizzes/PublicQuizPlayPage'));
const PublicQuizzesPage = lazy(() => import('./pages/quizzes/PublicQuizzesPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/Admin'));
const PollsPage = lazy(() => import('./pages/PollsPage'));
import { useAuthStore } from './store';
import { UserRole } from './types';
import './App.css';

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
    return <Loading />;
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
    return <Loading />;
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
    <Suspense fallback={<Loading fullScreen={true} />}>
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
    </Suspense>
  );
}

export default App;
