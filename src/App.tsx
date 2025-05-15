import {
  Routes,
  Route,
  Navigate,
  // useLocation
} from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import QuizPage from './pages/quizzes/QuizPage';
import ProfilePage from './pages/profile/ProfilePage';
import { useAuthStore } from './store';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  // const { isAuthenticated } = useAuthStore();
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users away from auth pages
  const AuthRoute = ({ children }: { children: React.ReactElement }) => {
    return isAuthenticated ? <Navigate to="/categories" replace /> : children;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/categories" replace />} />

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

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
