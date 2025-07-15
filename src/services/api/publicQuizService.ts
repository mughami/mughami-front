import axios from 'axios';
import type { Quiz, QuizResponse, QuestionsResponse } from './quizService';

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
