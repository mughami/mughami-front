import axios from 'axios';
import type { Quiz, QuizResponse, QuestionsResponse, QuizQuestion } from './quizService';

// Create a separate axios instance for public requests (without auth)
const DEV_API_URL = 'http://localhost:54321';
const API_URL = import.meta.env.VITE_API_URL || DEV_API_URL;

const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicQuizService = {
  // Public quiz endpoints - using same route as home page but without authentication
  getPublicQuizzes: async (page: number = 0, size: number = 10): Promise<QuizResponse> => {
    try {
      // Use the same route as home page (/app/quiz) but without auth headers
      const response = await publicApiClient.get<QuizResponse>(`/app/quiz?page=${page}&size=${size}`);
      return response.data;
    } catch {
      // Fallback: return empty response if not accessible
      return {
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        size: size,
        content: [],
        number: page,
        numberOfElements: 0,
        empty: true,
      };
    }
  },

  getPublicQuiz: async (quizId: number): Promise<Quiz | null> => {
    try {
      // Try to get from the list of quizzes since there's no direct quiz endpoint
      const response = await publicApiClient.get<QuizResponse>(`/app/quiz?page=0&size=100`);
      const quiz = response.data.content.find((q) => q.quizId === quizId);
      return quiz || null;
    } catch {
      return null;
    }
  },

  getPublicQuizQuestions: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuestionsResponse> => {
    try {
      const response = await publicApiClient.get<QuestionsResponse>(
        `/app/quiz/${quizId}/questions-by-quiz?page=${page}&size=${size}`,
      );
      return response.data;
    } catch {
      return {
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        size: size,
        content: [],
        number: page,
        numberOfElements: 0,
        empty: true,
      };
    }
  },

  getPublicQuizPhoto: async (quizId: number): Promise<string> => {
    try {
      const response = await publicApiClient.get(`/app/quiz/${quizId}/photo`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch {
      return '';
    }
  },

  getPublicQuestionPhoto: async (questionId: number): Promise<string> => {
    try {
      const response = await publicApiClient.get(`/app/quiz/${questionId}/question-photo`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch {
      return '';
    }
  },
};

export default publicQuizService;

// Guest quiz controller endpoints (no auth; session-based)
export type GuestQuizStartResponse = {
  quizResponse: {
    quizId: number;
    quizName: string;
    categoryId: number;
    hasPhoto: boolean;
  };
  sessionId: string;
};

export type QuestionAnswerResponse = {
  id: number;
  answer: string;
  isCorrect: boolean;
};

export type QuestionStatsResponse = {
  questionResponse: QuizQuestion;
  questionAnswerResponse: QuestionAnswerResponse;
  selectedAnswer: QuestionAnswerResponse;
};

export type GuestQuizResultsResponse = {
  quizResponse: {
    quizId: number;
    quizName: string;
    categoryId: number;
    hasPhoto: boolean;
  };
  quizStatsResponse: QuestionStatsResponse[];
};

export type GuestQuizSubmitResponse = GuestQuizResultsResponse;

export const guestQuizService = {
  getAvailableQuizzes: async (page: number = 0, size: number = 10): Promise<QuizResponse> => {
    const response = await publicApiClient.get<QuizResponse>(
      `/app/guest/quiz/available?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getGuestQuiz: async (quizId: number): Promise<Quiz | null> => {
    const response = await publicApiClient.get<Quiz>(`/app/guest/quiz/${quizId}`);
    return response.data ?? null;
  },

  getGuestQuizQuestions: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuestionsResponse> => {
    const response = await publicApiClient.get<QuestionsResponse>(
      `/app/guest/quiz/quiz-questions/${quizId}?page=${page}&size=${size}`,
    );
    return response.data;
  },

  startGuestQuiz: async (quizId: number): Promise<GuestQuizStartResponse> => {
    const response = await publicApiClient.post<GuestQuizStartResponse>(
      `/app/guest/quiz/${quizId}/start`,
    );
    return response.data;
  },

  submitGuestQuizAnswer: async (
    sessionId: string,
    quizId: number,
    questionId: number,
    answerId: number,
  ): Promise<boolean> => {
    const response = await publicApiClient.post<boolean>(
      `/app/guest/quiz/session/${sessionId}/quiz/${quizId}/answer?questionId=${questionId}&answerId=${answerId}`,
    );
    return response.data === true;
  },

  submitGuestQuiz: async (sessionId: string, email?: string): Promise<GuestQuizSubmitResponse> => {
    const response = await publicApiClient.post<GuestQuizSubmitResponse>(
      `/app/guest/quiz/session/${sessionId}/submit${
        email ? `?email=${encodeURIComponent(email)}` : ''
      }`,
    );
    return response.data;
  },

  getGuestQuizResults: async (sessionId: string): Promise<GuestQuizResultsResponse> => {
    const response = await publicApiClient.get<GuestQuizResultsResponse>(
      `/app/guest/quiz/session/${sessionId}/results`,
    );
    return response.data;
  },
};
