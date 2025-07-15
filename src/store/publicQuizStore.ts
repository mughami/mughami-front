import { create } from 'zustand';
import publicQuizService from '../services/api/publicQuizService';
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

  // Fetch operations
  fetchPublicQuizzes: (page?: number, size?: number) => Promise<void>;
  fetchPublicQuiz: (quizId: number) => Promise<void>;
  fetchPublicQuizQuestions: (quizId: number, page?: number, size?: number) => Promise<void>;

  // Quiz playing actions
  startQuiz: (quizId: number) => Promise<void>;
  selectAnswer: (questionId: number, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: () => void;
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

  fetchPublicQuizzes: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response: QuizResponse = await publicQuizService.getPublicQuizzes(page, size);
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
        // If not found, try to fetch it directly
        const fetchedQuiz = await publicQuizService.getPublicQuiz(quizId);
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
      const response: QuestionsResponse = await publicQuizService.getPublicQuizQuestions(
        quizId,
        page,
        size,
      );
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
      await publicQuizService.getPublicQuizQuestions(quizId, 0, 50);
      set({
        quizStarted: true,
        currentQuestionIndex: 0,
        selectedAnswers: {},
        loading: false,
      });
    } catch {
      set({
        error: 'Failed to start quiz',
        loading: false,
      });
    }
  },

  selectAnswer: (questionId: number, answerIndex: number) => {
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

  completeQuiz: () => {
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
