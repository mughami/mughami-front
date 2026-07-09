import type { Quiz, QuizResponse, QuestionsResponse, QuizQuestion } from './quizService';
import apiClient from './client';

// Filters supported by the authenticated /app/quiz list endpoint.
export interface PublicQuizFilters {
  quizName?: string;
  categoryId?: number;
  subCategoryId?: number;
  sortBy?: 'NAME' | 'TYPE' | 'CREATED_AT' | 'STATUS';
  sortDirection?: 'ASC' | 'DESC';
}

// Result object returned by the authenticated submit endpoint.
export type AuthQuizSubmitResponse = {
  rank: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  timeTakenSeconds: number;
  completedAt: string;
  durationSeconds: number;
};

const emptyQuizResponse = (page: number, size: number): QuizResponse => ({
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  size,
  content: [],
  number: page,
  numberOfElements: 0,
  empty: true,
});

// The questions endpoints differ in shape: the guest route returns a flat page
// ({ content, totalElements }) while the authenticated /app/quiz route nests it
// under `page` ({ page: { content }, totalQuestions }). Normalize both here.
type RawQuestionsPage = {
  content?: QuizQuestion[];
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
};
type RawQuestionsResponse = RawQuestionsPage & { page?: RawQuestionsPage; totalQuestions?: number };

const normalizeQuestions = (
  data: RawQuestionsResponse | undefined,
  page: number,
  size: number,
): QuestionsResponse => {
  const pageData: RawQuestionsPage = data?.page ?? data ?? {};
  const content = pageData.content ?? [];
  return {
    content,
    totalElements: pageData.totalElements ?? data?.totalQuestions ?? content.length,
    totalPages: pageData.totalPages ?? 1,
    first: pageData.first ?? true,
    last: pageData.last ?? true,
    size: pageData.size ?? size,
    number: pageData.number ?? page,
    numberOfElements: pageData.numberOfElements ?? content.length,
    empty: pageData.empty ?? content.length === 0,
  };
};

const publicQuizService = {
  // Authenticated public list — /app/quiz supports name/category/sort filters.
  getPublicQuizzes: async (
    page: number = 0,
    size: number = 10,
    filters: PublicQuizFilters = {},
  ): Promise<QuizResponse> => {
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (filters.quizName) params.set('quizName', filters.quizName);
      if (filters.categoryId != null) params.set('categoryId', String(filters.categoryId));
      if (filters.subCategoryId != null) params.set('subCategoryId', String(filters.subCategoryId));
      if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      const response = await apiClient.get<QuizResponse>(`/app/quiz?${params.toString()}`);
      return response.data;
    } catch {
      return emptyQuizResponse(page, size);
    }
  },

  getPublicQuiz: async (quizId: number): Promise<Quiz | null> => {
    try {
      const response = await apiClient.get<Quiz>(`/app/quiz/${quizId}`);
      return response.data ?? null;
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
      const response = await apiClient.get<RawQuestionsResponse>(
        `/app/quiz/${quizId}/questions-by-quiz?page=${page}&size=${size}`,
      );
      return normalizeQuestions(response.data, page, size);
    } catch {
      return normalizeQuestions(undefined, page, size);
    }
  },

  // Authenticated play flow (/app/quiz/*).
  startPublicQuiz: async (quizId: number): Promise<void> => {
    await apiClient.post(`/app/quiz/${quizId}/start`);
  },

  fillPublicQuizAnswer: async (
    quizId: number,
    questionId: number,
    answerId: number,
  ): Promise<boolean> => {
    const response = await apiClient.post<boolean>(
      `/app/quiz/fill-quiz/${quizId}?questionId=${questionId}&answerId=${answerId}`,
    );
    return response.data === true;
  },

  submitPublicQuiz: async (quizId: number): Promise<AuthQuizSubmitResponse> => {
    const response = await apiClient.post<AuthQuizSubmitResponse>(`/app/quiz/${quizId}/submit`);
    return response.data;
  },

  // The authenticated list endpoint returns questions without their answers;
  // this fetches a single question with its answers populated.
  getPublicQuestion: async (questionId: number): Promise<QuizQuestion> => {
    const response = await apiClient.get<QuizQuestion>(`/app/quiz/${questionId}/question`);
    return response.data;
  },

  getPublicQuizPhoto: async (quizId: number): Promise<string> => {
    try {
      const response = await apiClient.get(`/app/quiz/${quizId}/photo`, {
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
      const response = await apiClient.get(`/app/quiz/${questionId}/question-photo`, {
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
    subCategoryId?: number;
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
    subCategoryId?: number;
    hasPhoto: boolean;
  };
  quizStatsResponse: QuestionStatsResponse[];
};

export type GuestQuizSubmitResponse = GuestQuizResultsResponse;

export const guestQuizService = {
  getAvailableQuizzes: async (page: number = 0, size: number = 10): Promise<QuizResponse> => {
    const response = await apiClient.get<QuizResponse>(
      `/app/guest/quiz/available?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getGuestQuiz: async (quizId: number): Promise<Quiz | null> => {
    const response = await apiClient.get<Quiz>(`/app/guest/quiz/${quizId}`);
    return response.data ?? null;
  },

  getGuestQuizQuestions: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<QuestionsResponse> => {
    const response = await apiClient.get<RawQuestionsResponse>(
      `/app/guest/quiz/quiz-questions/${quizId}?page=${page}&size=${size}`,
    );
    return normalizeQuestions(response.data, page, size);
  },

  startGuestQuiz: async (quizId: number): Promise<GuestQuizStartResponse> => {
    const response = await apiClient.post<GuestQuizStartResponse>(`/app/guest/quiz/${quizId}/start`);
    return response.data;
  },

  submitGuestQuizAnswer: async (
    sessionId: string,
    quizId: number,
    questionId: number,
    answerId: number,
  ): Promise<boolean> => {
    const response = await apiClient.post<boolean>(
      `/app/guest/quiz/session/${sessionId}/quiz/${quizId}/answer?questionId=${questionId}&answerId=${answerId}`,
    );
    return response.data === true;
  },

  submitGuestQuiz: async (sessionId: string, email?: string): Promise<GuestQuizSubmitResponse> => {
    const response = await apiClient.post<GuestQuizSubmitResponse>(
      `/app/guest/quiz/session/${sessionId}/submit${
        email ? `?email=${encodeURIComponent(email)}` : ''
      }`,
    );
    return response.data;
  },

  getGuestQuizResults: async (sessionId: string): Promise<GuestQuizResultsResponse> => {
    const response = await apiClient.get<GuestQuizResultsResponse>(
      `/app/guest/quiz/session/${sessionId}/results`,
    );
    return response.data;
  },

  getGuestQuizSuggestions: async (subcategoryId: number): Promise<Quiz[]> => {
    const response = await apiClient.get<Quiz[]>(
      `/app/guest/quiz/suggestions/${subcategoryId}`,
    );
    return response.data;
  },
};
