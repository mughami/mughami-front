export { default as apiClient } from './api/client';
export { default as authService } from './api/authService';
export { default as categoryService } from './api/categoryService';
export { default as quizService } from './api/quizService';
export { default as paymentService } from './api/paymentService';

// Re-export types
export type { User, LoginCredentials, RegisterData, AuthResponse } from './api/authService';
export type { Category } from './api/categoryService';
export type {
  Quiz,
  QuizQuestion,
  QuizAnswer,
  QuizResponse,
  QuestionsResponse,
  CreateQuizRequest,
  CreateQuestionRequest,
} from './api/quizService';
export type { PaymentIntent, PaymentRequest } from './api/paymentService';
