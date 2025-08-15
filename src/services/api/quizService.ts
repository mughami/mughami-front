import apiClient from './client';

// Types based on swagger API
export interface QuizAnswer {
  id: number;
  answer: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  hasPhoto: boolean;
  answers: QuizAnswer[];
}

export interface Quiz {
  quizId: number;
  quizName: string;
  categoryId: number;
  hasPhoto: boolean;
}

export interface QuizResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: Quiz[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface QuestionsResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: QuizQuestion[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateQuizRequest {
  name: string;
  categoryId: number;
}

export interface CreateQuestionRequest {
  question: string;
  answers: {
    answer: string;
    isCorrect: boolean;
  }[];
}

const quizService = {
  // Admin endpoints
  getAdminQuizzes: async (page: number = 0, size: number = 10): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(`/admin/quiz?page=${page}&size=${size}`);
    return response.data;
  },

  createQuiz: async (data: CreateQuizRequest): Promise<Quiz> => {
    const response = await apiClient.post<Quiz>('/admin/quiz', data);
    return response.data;
  },

  addQuizPhoto: async (quizId: number, photo: File): Promise<Quiz> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await apiClient.post<Quiz>(`/admin/quiz/add-photo/${quizId}`, formData);
    return response.data;
  },

  getAdminQuiz: async (quizId: number): Promise<Quiz> => {
    const response = await apiClient.get<Quiz>(`/admin/quiz/${quizId}`);
    return response.data;
  },

  getAdminQuizQuestions: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuestionsResponse> => {
    const response = await apiClient.get<QuestionsResponse>(
      `/admin/quiz/${quizId}/questions-by-quiz?page=${page}&size=${size}`,
    );
    return response.data;
  },

  createQuestion: async (quizId: number, data: CreateQuestionRequest): Promise<QuizQuestion> => {
    const response = await apiClient.post<QuizQuestion>(`/admin/quiz/${quizId}/questions`, data);
    return response.data;
  },

  deleteQuestion: async (questionId: number): Promise<void> => {
    await apiClient.delete(`/admin/quiz/questions/${questionId}`);
  },

  getQuizPhoto: async (quizId: number): Promise<string> => {
    const response = await apiClient.get(`/admin/quiz/${quizId}/photo`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  },

  getQuestion: async (questionId: number): Promise<QuizQuestion> => {
    const response = await apiClient.get<QuizQuestion>(`/admin/quiz/${questionId}/question`);
    return response.data;
  },

  getQuestionPhoto: async (questionId: number): Promise<string> => {
    const response = await apiClient.get(`/admin/quiz/${questionId}/question-photo`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  },

  getQuizzesByCategoryAdmin: async (
    categoryId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(
      `/admin/quiz/quiz-by-category/${categoryId}?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getQuizzesByCategoryUser: async (
    categoryId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(
      `/app/quiz/quiz-by-category/${categoryId}?page=${page}&size=${size}`,
    );
    return response.data;
  },

  // User endpoints
  getUserQuizzes: async (page: number = 0, size: number = 10): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(`/app/quiz?page=${page}&size=${size}`);
    return response.data;
  },

  getUserQuizQuestions: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuestionsResponse> => {
    const response = await apiClient.get<QuestionsResponse>(
      `/app/quiz/${quizId}/questions-by-quiz?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getUserQuizPhoto: async (quizId: number): Promise<string> => {
    const response = await apiClient.get(`/app/quiz/${quizId}/photo`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  },

  getUserQuestion: async (questionId: number): Promise<QuizQuestion> => {
    const response = await apiClient.get<QuizQuestion>(`/app/quiz/${questionId}/question`);
    return response.data;
  },

  getUserQuestionPhoto: async (questionId: number): Promise<string> => {
    const response = await apiClient.get(`/app/quiz/${questionId}/question-photo`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  },

  addQuestionPhoto: async (questionId: number, photo: File): Promise<QuizQuestion> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await apiClient.post<QuizQuestion>(
      `/admin/quiz/questions/${questionId}/question-photo`,
      formData,
    );
    return response.data;
  },
};

export default quizService;
