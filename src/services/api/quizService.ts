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
  subCategoryId?: number;
  hasPhoto: boolean;
  quizStatus?: 'PENDING' | 'VERIFIED';
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
  subCategoryId?: number;
  quizStatus?: 'PENDING' | 'VERIFIED';
}

export interface CreateQuestionRequest {
  question: string;
  answers: {
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface UpdateQuestionRequest {
  question: string;
  answers: {
    id?: number;
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface UpdateAnswerRequest {
  answer: string;
  isCorrect: boolean;
}

export interface UpdateQuizRequest {
  name: string;
  categoryId: number;
  subCategoryId?: number;
  quizStatus: 'PENDING' | 'VERIFIED';
}

const quizService = {
  // Admin endpoints
  getAdminQuizzes: async (page: number = 0, size: number = 10): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(`/admin/quiz?page=${page}&size=${size}`);
    return response.data;
  },

  createQuiz: async (data: CreateQuizRequest): Promise<Quiz> => {
    const payload: Record<string, unknown> = {
      name: data.name,
      categoryId: data.categoryId,
    };
    if (data.subCategoryId != null) payload['subcategoryId'] = data.subCategoryId;
    if (data.quizStatus !== undefined) payload['quizStatus'] = data.quizStatus;
    const response = await apiClient.post<Quiz>('/admin/quiz', payload);
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

  // Admin: update question
  updateQuestion: async (questionId: number, data: UpdateQuestionRequest): Promise<QuizQuestion> => {
    const response = await apiClient.put<QuizQuestion>(
      `/admin/quiz/question-update/${questionId}`,
      data,
    );
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

  getQuizzesBySubcategoryAdmin: async (
    subCategoryId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(
      `/admin/quiz/quiz-by-subcategory/${subCategoryId}?page=${page}&size=${size}`,
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

  // User answer submission per question
  fillQuizAnswer: async (quizId: number, questionId: number, answerId: number): Promise<boolean> => {
    const response = await apiClient.post<boolean>(
      `/app/quiz/fill-quiz/${quizId}?questionId=${questionId}&answerId=${answerId}`,
    );
    return response.data === true;
  },

  // Admin: update quiz
  updateAdminQuiz: async (quizId: number, data: UpdateQuizRequest): Promise<Quiz> => {
    console.log(data.subCategoryId);
    const body: Record<string, unknown> = {
      name: data.name,
      categoryId: data.categoryId,
      quizStatus: data.quizStatus,
      subcategoryId: data.subCategoryId || null,
    };

    console.log(body);
    const response = await apiClient.put<Quiz>(`/admin/quiz/${quizId}`, body);
    return response.data;
  },

  // Admin: delete quiz
  deleteAdminQuiz: async (quizId: number): Promise<void> => {
    await apiClient.delete(`/admin/quiz/${quizId}`);
  },

  // Admin: delete question by quiz and question id
  deleteAdminQuizQuestion: async (quizId: number, questionId: number): Promise<void> => {
    await apiClient.delete(`/admin/quiz/${quizId}/delete-question/${questionId}`);
  },

  // Admin: update single answer
  updateAdminAnswer: async (answerId: number, data: UpdateAnswerRequest): Promise<QuizAnswer> => {
    const response = await apiClient.put<QuizAnswer>(`/admin/quiz/answer-update/${answerId}`, data);
    return response.data;
  },
};

export default quizService;
