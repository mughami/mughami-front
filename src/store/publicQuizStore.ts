import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorMessages';
import publicQuizService, {
  guestQuizService,
  type GuestQuizStartResponse,
  type GuestQuizResultsResponse,
  type AuthQuizSubmitResponse,
  type PublicQuizFilters,
} from '../services/api/publicQuizService';

// The guest /available endpoint has no query filters, so apply them client-side
// to keep the public list filterable for signed-out visitors too.
const applyClientFilters = (list: Quiz[], filters: PublicQuizFilters): Quiz[] => {
  let out = [...list];
  if (filters.quizName) {
    const needle = filters.quizName.toLowerCase();
    out = out.filter((q) => q.quizName.toLowerCase().includes(needle));
  }
  if (filters.categoryId != null) out = out.filter((q) => q.categoryId === filters.categoryId);
  if (filters.subCategoryId != null) {
    out = out.filter(
      (q) =>
        ((q as { subCategoryId?: number }).subCategoryId ??
          (q as { subcategoryId?: number }).subcategoryId) === filters.subCategoryId,
    );
  }
  if (filters.sortBy === 'NAME') {
    out.sort((a, b) => a.quizName.localeCompare(b.quizName));
    if (filters.sortDirection === 'DESC') out.reverse();
  }
  return out;
};
import { useAuthStore } from './authStore';
import quizService from '../services/api/quizService';
import type { Quiz, QuizQuestion, QuizResponse, QuestionsResponse } from '../services/api/quizService';

// Helper function to calculate quiz score
const calculateScore = (
  questions: QuizQuestion[],
  selectedAnswers: Record<number, number>,
): number => {
  let score = 0;
  questions.forEach((question) => {
    const selectedAnswerIndex = selectedAnswers[question.id];
    if (selectedAnswerIndex !== undefined && question.answers?.[selectedAnswerIndex]?.isCorrect) {
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
  // Authenticated submit result (rank / score / percentage)
  authResult: AuthQuizSubmitResponse | null;
  // Per-question correctness as reported by the backend answer endpoints
  answerResults: Record<number, boolean>;

  // Fetch operations
  fetchPublicQuizzes: (page?: number, size?: number, filters?: PublicQuizFilters) => Promise<void>;
  fetchPublicQuiz: (quizId: number) => Promise<void>;
  fetchPublicQuizQuestions: (quizId: number, page?: number, size?: number) => Promise<void>;

  // Quiz playing actions
  startQuiz: (quizId: number) => Promise<void>;
  selectAnswer: (questionId: number, answerIndex: number) => Promise<void> | void;
  submitAnswer: (questionId: number) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: (email?: string) => Promise<void> | void;
  resetQuiz: () => void;

  // Photo operations
  getQuizPhoto: (quizId: number) => Promise<string>;
  getQuestionPhoto: (questionId: number) => Promise<string>;

  // Suggestions
  suggestions: Quiz[];
  suggestionsLoading: boolean;
  fetchSuggestions: (subcategoryId: number) => Promise<void>;

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
  authResult: null,
  answerResults: {},

  fetchPublicQuizzes: async (page = 0, size = 10, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      // Authenticated /app/quiz filters server-side; guest /available cannot, so
      // fetch then filter client-side to keep the UX consistent for everyone.
      const response: QuizResponse = isAuthenticated
        ? await publicQuizService.getPublicQuizzes(page, size, filters)
        : await guestQuizService.getAvailableQuizzes(page, size);
      let verified = (response.content || []).filter((q: Quiz) => q.quizStatus === 'VERIFIED');
      if (!isAuthenticated) verified = applyClientFilters(verified, filters);
      set({
        quizzes: verified,
        // Server total drives pagination; fall back to the page length only when
        // the response omits it.
        totalQuizzes: response.totalElements ?? verified.length,
        loading: false,
      });

      // Do not persist quizzes in localStorage
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ქვიზების ჩატვირთვა ვერ მოხერხდა'),
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

      if (quiz && quiz.quizStatus === 'VERIFIED') {
        set({
          currentQuiz: quiz,
          loading: false,
        });
      } else {
        throw new Error('Quiz not available');
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ქვიზის ჩატვირთვა ვერ მოხერხდა'),
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
        currentQuestions: response.content ?? [],
        totalQuestions: response.totalElements ?? 0,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'კითხვების ჩატვირთვა ვერ მოხერხდა'),
        loading: false,
      });
    }
  },

  // Quiz playing actions
  startQuiz: async (quizId: number) => {
    set({ loading: true, error: null, answerResults: {}, authResult: null });
    try {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      if (isAuthenticated) {
        // Record the attempt on the backend, then load the questions. The
        // authenticated list omits answers, so hydrate each question's answers
        // from the single-question endpoint.
        await publicQuizService.startPublicQuiz(quizId);
        const q = await publicQuizService.getPublicQuizQuestions(quizId, 0, 50);
        // The authenticated list returns only stubs (id/hasPhoto), so pull the
        // full question — text + answers — from the single-question endpoint.
        const questions = await Promise.all(
          (q.content ?? []).map(async (question) => {
            if (question.question && question.answers && question.answers.length) return question;
            try {
              return await publicQuizService.getPublicQuestion(question.id);
            } catch {
              return { ...question, answers: question.answers ?? [] };
            }
          }),
        );
        set({
          currentQuestions: questions,
          totalQuestions: q.totalElements ?? questions.length,
          quizStarted: true,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          loading: false,
        });
      } else {
        const existingQuiz = get().currentQuiz;
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
            subCategoryId: start.quizResponse.subCategoryId ?? existingQuiz?.subCategoryId,
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
          set({ currentQuestions: q.content ?? [], totalQuestions: q.totalElements ?? 0 });
        } catch {
          // ignore prefetch failure
        }
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ქვიზის დაწყება ვერ მოხერხდა'),
        loading: false,
      });
    }
  },

  selectAnswer: async (questionId: number, answerIndex: number) => {
    // For both guest and logged-in public flow, only mark selection.
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: answerIndex,
      },
    }));
  },

  // Submit a single answer to the backend. Both flows return whether the
  // selected answer was correct; store it so the UI can rely on backend truth.
  submitAnswer: async (questionId: number) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const state = get();
    const selectedIndex = state.selectedAnswers[questionId];
    const question = state.currentQuestions.find((q) => q.id === questionId);
    const selected = selectedIndex !== undefined ? question?.answers?.[selectedIndex] : undefined;
    if (!state.currentQuiz || !selected) {
      throw new Error('Missing selection');
    }

    let correct = false;
    if (isAuthenticated) {
      correct = await publicQuizService.fillPublicQuizAnswer(
        state.currentQuiz.quizId,
        questionId,
        selected.id,
      );
    } else {
      const sid = state.sessionId || localStorage.getItem('guestQuizSessionId') || null;
      if (!sid) throw new Error('Missing session');
      if (!state.sessionId) set({ sessionId: sid });
      correct = await guestQuizService.submitGuestQuizAnswer(
        sid,
        state.currentQuiz.quizId,
        questionId,
        selected.id,
      );
    }

    set((s) => ({ answerResults: { ...s.answerResults, [questionId]: correct } }));
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
    const state = get();

    // Score comes from the backend when possible; fall back to a local count
    // (using per-answer isCorrect) only if the submit request fails.
    let score = calculateScore(state.currentQuestions, state.selectedAnswers);
    let totalQuestions = state.currentQuestions.length;

    if (isAuthenticated) {
      if (state.currentQuiz) {
        try {
          const result = await publicQuizService.submitPublicQuiz(state.currentQuiz.quizId);
          set({ authResult: result });
          score = result.correctAnswers;
          totalQuestions = result.totalQuestions || totalQuestions;
        } catch {
          // ignore; keep locally-computed score as fallback
        }
      }
    } else {
      const sid = state.sessionId || localStorage.getItem('guestQuizSessionId') || null;
      if (!state.sessionId && sid) set({ sessionId: sid });
      if (sid) {
        try {
          const results = await guestQuizService.submitGuestQuiz(sid, email);
          const stats = results.quizStatsResponse || [];
          set({ guestResults: results });
          // Correct when the picked answer matches the correct answer id.
          score = stats.filter(
            (s) =>
              s.selectedAnswer != null &&
              s.questionAnswerResponse != null &&
              s.selectedAnswer.id === s.questionAnswerResponse.id,
          ).length;
          if (stats.length) totalQuestions = stats.length;
        } catch {
          // ignore submit failure here; component can handle retry
        }
      }
    }

    set((s) => {
      const quizResult = {
        quizId: s.currentQuiz?.quizId || 0,
        score,
        totalQuestions,
        completedAt: new Date().toISOString(),
      };
      return {
        quizCompleted: true,
        quizScore: score,
        quizResults: { ...s.quizResults, [quizResult.quizId]: quizResult },
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
      authResult: null,
      answerResults: {},
      suggestions: [],
    });
  },

  getQuizPhoto: async (quizId: number) => {
    try {
      const photoUrl = await publicQuizService.getPublicQuizPhoto(quizId);
      return photoUrl;
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ქვიზის ფოტოს ჩატვირთვა ვერ მოხერხდა'),
      });
      return '';
    }
  },

  getQuestionPhoto: async (questionId: number) => {
    try {
      const photoUrl = await publicQuizService.getPublicQuestionPhoto(questionId);
      return photoUrl;
    } catch (error) {
      set({
        error: getErrorMessage(error, 'კითხვის ფოტოს ჩატვირთვა ვერ მოხერხდა'),
      });
      return '';
    }
  },

  suggestions: [],
  suggestionsLoading: false,
  fetchSuggestions: async (subcategoryId: number) => {
    set({ suggestionsLoading: true });
    try {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const data = isAuthenticated
        ? await quizService.getQuizSuggestions(subcategoryId)
        : await guestQuizService.getGuestQuizSuggestions(subcategoryId);
      set({ suggestions: data, suggestionsLoading: false });
    } catch {
      set({ suggestions: [], suggestionsLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentQuiz: () => set({ currentQuiz: null }),
  clearCurrentQuestions: () => set({ currentQuestions: [] }),
}));
