import { create } from 'zustand';
import publicQuizService, {
  guestQuizService,
  type GuestQuizStartResponse,
  type GuestQuizResultsResponse,
} from '../services/api/publicQuizService';
import { useAuthStore } from './authStore';
import type { Quiz, QuizQuestion, QuizResponse, QuestionsResponse } from '../services/api/quizService';

// Helper function to calculate quiz score
const calculateScore = (
  questions: QuizQuestion[],
  selectedAnswers: Record<number, number>,
): number => {
  let score = 0;
  questions.forEach((question) => {
    const selectedAnswerIndex = selectedAnswers[question.id];
    if (selectedAnswerIndex !== undefined && question.answers[selectedAnswerIndex]?.isCorrect) {
      score++;
    }
  });
  return score;
};

// Helper function to cleanup blob URLs
export const cleanupBlobUrl = (url: string) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

interface PublicQuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentQuestions: QuizQuestion[];
  totalQuizzes: number;
  totalQuestions: number;
  loading: boolean;
  error: string | null;

  // Quiz playing state
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number>;
  quizStarted: boolean;
  quizCompleted: boolean;
  quizScore: number;
  quizResults: Record<
    number,
    {
      quizId: number;
      score: number;
      totalQuestions: number;
      completedAt: string;
    }
  >;

  // Guest session state
  sessionId: string | null;
  guestResults: GuestQuizResultsResponse | null;

  // Fetch operations
  fetchPublicQuizzes: (page?: number, size?: number) => Promise<void>;
  fetchPublicQuiz: (quizId: number) => Promise<void>;
  fetchPublicQuizQuestions: (quizId: number, page?: number, size?: number) => Promise<void>;

  // Quiz playing actions
  startQuiz: (quizId: number) => Promise<void>;
  selectAnswer: (questionId: number, answerIndex: number) => Promise<void> | void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: (email?: string) => Promise<void> | void;
  resetQuiz: () => void;

  // Photo operations
  getQuizPhoto: (quizId: number) => Promise<string>;
  getQuestionPhoto: (questionId: number) => Promise<string>;

  // Utility functions
  clearError: () => void;
  clearCurrentQuiz: () => void;
  clearCurrentQuestions: () => void;
}

export const usePublicQuizStore = create<PublicQuizState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  currentQuestions: [],
  totalQuizzes: 0,
  totalQuestions: 0,
  loading: false,
  error: null,

  // Quiz playing state
  currentQuestionIndex: 0,
  selectedAnswers: {},
  quizStarted: false,
  quizCompleted: false,
  quizScore: 0,
  quizResults: {},
  sessionId:
    (typeof localStorage !== 'undefined' && localStorage.getItem('guestQuizSessionId')) || null,
  guestResults: null,

  fetchPublicQuizzes: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const response: QuizResponse = isAuthenticated
        ? await publicQuizService.getPublicQuizzes(page, size)
        : await guestQuizService.getAvailableQuizzes(page, size);
      set({
        quizzes: response.content,
        totalQuizzes: response.totalElements,
        loading: false,
      });

      // Store quizzes in localStorage for results page
      const existingQuizzes = JSON.parse(localStorage.getItem('publicQuizzes') || '[]');
      const newQuizzes = response.content.filter(
        (quiz: Quiz) => !existingQuizzes.find((existing: Quiz) => existing.quizId === quiz.quizId),
      );
      localStorage.setItem('publicQuizzes', JSON.stringify([...existingQuizzes, ...newQuizzes]));
    } catch {
      set({
        error: 'Failed to fetch public quizzes',
        loading: false,
      });
    }
  },

  fetchPublicQuiz: async (quizId: number) => {
    set({ loading: true, error: null });
    try {
      // Try to get quiz from current list first
      const currentState = get();
      let quiz = currentState.quizzes.find((q: Quiz) => q.quizId === quizId);

      if (!quiz) {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        // If not found, try to fetch it directly
        const fetchedQuiz = isAuthenticated
          ? await publicQuizService.getPublicQuiz(quizId)
          : await guestQuizService.getGuestQuiz(quizId);
        quiz = fetchedQuiz || undefined;
      }

      if (quiz) {
        set({
          currentQuiz: quiz,
          loading: false,
        });
      } else {
        throw new Error('Quiz not found');
      }
    } catch {
      set({
        error: 'Failed to fetch quiz',
        loading: false,
      });
    }
  },

  fetchPublicQuizQuestions: async (quizId: number, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const response: QuestionsResponse = isAuthenticated
        ? await publicQuizService.getPublicQuizQuestions(quizId, page, size)
        : await guestQuizService.getGuestQuizQuestions(quizId, page, size);
      set({
        currentQuestions: response.content,
        totalQuestions: response.totalElements,
        loading: false,
      });
    } catch {
      set({
        error: 'Failed to fetch quiz questions',
        loading: false,
      });
    }
  },

  // Quiz playing actions
  startQuiz: async (quizId: number) => {
    set({ loading: true, error: null });
    try {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      console.log('isAuthenticated', isAuthenticated);
      if (isAuthenticated) {
        await publicQuizService.getPublicQuizQuestions(quizId, 0, 50);
        set({
          quizStarted: true,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          loading: false,
        });
      } else {
        const start: GuestQuizStartResponse = await guestQuizService.startGuestQuiz(quizId);
        try {
          localStorage.setItem('guestQuizSessionId', start.sessionId);
        } catch {
          // ignore localStorage set failures (private mode etc.)
        }
        set({
          sessionId: start.sessionId,
          currentQuiz: {
            quizId: start.quizResponse.quizId,
            quizName: start.quizResponse.quizName,
            categoryId: start.quizResponse.categoryId,
            hasPhoto: start.quizResponse.hasPhoto,
          },
          quizStarted: true,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          loading: false,
        });
        // Fetch questions for guest flow (optional prefetch)
        try {
          const q = await guestQuizService.getGuestQuizQuestions(quizId, 0, 50);
          set({ currentQuestions: q.content, totalQuestions: q.totalElements });
        } catch {
          // ignore prefetch failure
        }
      }
    } catch {
      set({
        error: 'Failed to start quiz',
        loading: false,
      });
    }
  },

  selectAnswer: async (questionId: number, answerIndex: number) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      const state = get();
      const sid = state.sessionId || localStorage.getItem('guestQuizSessionId') || null;
      if (!state.sessionId && sid) {
        set({ sessionId: sid });
      }
      const currentQuestion = state.currentQuestions.find((q) => q.id === questionId);
      const selectedAnswer = currentQuestion?.answers[answerIndex];
      if (sid && state.currentQuiz && selectedAnswer) {
        try {
          await guestQuizService.submitGuestQuizAnswer(
            sid,
            state.currentQuiz.quizId,
            questionId,
            selectedAnswer.id,
          );
        } catch {
          // ignore network failure, UI still updates locally
        }
      }
    }
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: answerIndex,
      },
    }));
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },

  previousQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex - 1,
    }));
  },

  completeQuiz: async (email?: string) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      const state = get();
      const sid = state.sessionId || localStorage.getItem('guestQuizSessionId') || null;
      if (!state.sessionId && sid) {
        set({ sessionId: sid });
      }
      if (sid) {
        try {
          const results = await guestQuizService.submitGuestQuiz(sid, email);
          set({ guestResults: results });
        } catch {
          // ignore submit failure here; component can handle retry
        }
      }
    }
    set((state) => {
      const score = calculateScore(state.currentQuestions, state.selectedAnswers);
      const quizResult = {
        quizId: state.currentQuiz?.quizId || 0,
        score,
        totalQuestions: state.currentQuestions.length,
        completedAt: new Date().toISOString(),
      };

      // Save to local storage
      const existingResults = JSON.parse(localStorage.getItem('publicQuizResults') || '{}');
      existingResults[quizResult.quizId] = quizResult;
      localStorage.setItem('publicQuizResults', JSON.stringify(existingResults));

      return {
        quizCompleted: true,
        quizScore: score,
        quizResults: existingResults,
      };
    });
  },

  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      selectedAnswers: {},
      quizStarted: false,
      quizCompleted: false,
      quizScore: 0,
      sessionId: null,
      guestResults: null,
    });
  },

  getQuizPhoto: async (quizId: number) => {
    try {
      const photoUrl = await publicQuizService.getPublicQuizPhoto(quizId);
      return photoUrl;
    } catch {
      set({
        error: 'Failed to get quiz photo',
      });
      return '';
    }
  },

  getQuestionPhoto: async (questionId: number) => {
    try {
      const photoUrl = await publicQuizService.getPublicQuestionPhoto(questionId);
      return photoUrl;
    } catch {
      set({
        error: 'Failed to get question photo',
      });
      return '';
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentQuiz: () => set({ currentQuiz: null }),
  clearCurrentQuestions: () => set({ currentQuestions: [] }),
}));
