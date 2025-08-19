import { create } from 'zustand';
import quizService, {
  type Quiz,
  type QuizQuestion,
  type QuizResponse,
  type QuestionsResponse,
  type CreateQuizRequest,
  type CreateQuestionRequest,
} from '../services/api/quizService';

interface QuizState {
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

  // Fetch quizzes
  fetchUserQuizzes: (page?: number, size?: number) => Promise<void>;
  fetchAdminQuizzes: (page?: number, size?: number) => Promise<void>;
  fetchQuiz: (quizId: number) => Promise<void>;
  fetchUserQuiz: (quizId: number) => Promise<void>;
  fetchQuizQuestions: (quizId: number, page?: number, size?: number) => Promise<void>;
  fetchAdminQuizQuestions: (quizId: number, page?: number, size?: number) => Promise<void>;
  fetchQuizzesByCategory: (categoryId: number, page?: number, size?: number) => Promise<void>;

  // Quiz playing actions
  startQuiz: (quizId: number) => Promise<void>;
  selectAnswer: (questionId: number, answerIndex: number) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;

  // Create operations
  createQuiz: (data: CreateQuizRequest) => Promise<Quiz>;
  createQuestion: (quizId: number, data: CreateQuestionRequest) => Promise<QuizQuestion>;
  deleteQuestion: (questionId: number) => Promise<void>;
  addQuizPhoto: (quizId: number, photo: File) => Promise<void>;
  addQuestionPhoto: (questionId: number, photo: File) => Promise<void>;

  // Photo operations
  getQuizPhoto: (quizId: number) => Promise<string>;
  getQuestionPhoto: (questionId: number) => Promise<string>;

  // Utility
  clearError: () => void;
  clearCurrentQuiz: () => void;
  clearCurrentQuestions: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
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

  fetchUserQuizzes: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response: QuizResponse = await quizService.getUserQuizzes(page, size);
      set({
        quizzes: response.content,
        totalQuizzes: response.totalElements,
        loading: false,
      });

      // Store quizzes in localStorage for results page
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const newQuizzes = response.content.filter(
        (quiz: Quiz) => !existingQuizzes.find((existing: Quiz) => existing.quizId === quiz.quizId),
      );
      localStorage.setItem('quizzes', JSON.stringify([...existingQuizzes, ...newQuizzes]));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch quizzes',
        loading: false,
      });
    }
  },

  fetchAdminQuizzes: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response: QuizResponse = await quizService.getAdminQuizzes(page, size);
      set({
        quizzes: response.content,
        totalQuizzes: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch admin quizzes',
        loading: false,
      });
    }
  },

  fetchQuiz: async (quizId: number) => {
    set({ loading: true, error: null });
    try {
      const quiz = await quizService.getAdminQuiz(quizId);
      set({
        currentQuiz: quiz,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch quiz',
        loading: false,
      });
    }
  },

  fetchUserQuiz: async (quizId: number) => {
    set({ loading: true, error: null });
    try {
      // Since there's no /app/quiz/{quizId} endpoint, we need to get the quiz from the quizzes list
      // First, make sure we have the quizzes loaded
      const currentState = useQuizStore.getState();
      if (currentState.quizzes.length === 0) {
        const response = await quizService.getUserQuizzes(0, 50); // Load more quizzes to find the one we need
        set({ quizzes: response.content });
      }

      // Find the quiz in the current quizzes list
      const updatedState = useQuizStore.getState();
      const quiz = updatedState.quizzes.find((q: Quiz) => q.quizId === quizId);
      if (quiz) {
        set({
          currentQuiz: quiz,
          loading: false,
        });
      } else {
        // If not found in current list, try to fetch more quizzes
        const response = await quizService.getUserQuizzes(0, 100);
        const foundQuiz = response.content.find((q: Quiz) => q.quizId === quizId);
        if (foundQuiz) {
          set({
            currentQuiz: foundQuiz,
            loading: false,
          });
        } else {
          throw new Error('Quiz not found');
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user quiz',
        loading: false,
      });
    }
  },

  fetchQuizQuestions: async (quizId: number, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response: QuestionsResponse = await quizService.getUserQuizQuestions(quizId, page, size);
      set({
        currentQuestions: response.content,
        totalQuestions: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch quiz questions',
        loading: false,
      });
    }
  },

  fetchAdminQuizQuestions: async (quizId: number, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response: QuestionsResponse = await quizService.getAdminQuizQuestions(quizId, page, size);
      set({
        currentQuestions: response.content,
        totalQuestions: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch admin quiz questions',
        loading: false,
      });
    }
  },

  fetchQuizzesByCategory: async (categoryId: number, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response: QuizResponse = await quizService.getQuizzesByCategoryUser(
        categoryId,
        page,
        size,
      );
      set({
        quizzes: response.content,
        totalQuizzes: response.totalElements,
        loading: false,
      });
    } catch {
      // Handle 404 or other errors gracefully - just show empty state
      // Don't set error state for missing quizzes, as this is expected
      set({
        quizzes: [],
        totalQuizzes: 0,
        loading: false,
      });
    }
  },

  createQuiz: async (data: CreateQuizRequest) => {
    set({ loading: true, error: null });
    try {
      const newQuiz = await quizService.createQuiz(data);
      set((state) => ({
        quizzes: [newQuiz, ...state.quizzes],
        totalQuizzes: state.totalQuizzes + 1,
        loading: false,
      }));
      return newQuiz;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create quiz',
        loading: false,
      });
      throw error;
    }
  },

  createQuestion: async (quizId: number, data: CreateQuestionRequest) => {
    set({ loading: true, error: null });
    try {
      const result = await quizService.createQuestion(quizId, data);
      console.log('Store: Question created successfully:', result);
      // Refresh questions after creating new one
      const response: QuestionsResponse = await quizService.getAdminQuizQuestions(quizId, 0, 50);
      set({
        currentQuestions: response.content,
        totalQuestions: response.totalElements,
        loading: false,
      });
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create question',
        loading: false,
      });
      throw error;
    }
  },

  deleteQuestion: async (questionId: number) => {
    set({ loading: true, error: null });
    try {
      await quizService.deleteQuestion(questionId);
      // Note: We need to refresh questions for the specific quiz
      // This will be handled by the component calling this function
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete question',
        loading: false,
      });
      throw error;
    }
  },

  addQuizPhoto: async (quizId: number, photo: File) => {
    set({ loading: true, error: null });
    try {
      await quizService.addQuizPhoto(quizId, photo);
      // Update the quiz in the store to reflect it now has a photo
      set((state) => ({
        quizzes: state.quizzes.map((quiz) =>
          quiz.quizId === quizId ? { ...quiz, hasPhoto: true } : quiz,
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add quiz photo',
        loading: false,
      });
      throw error;
    }
  },

  addQuestionPhoto: async (questionId: number, photo: File) => {
    set({ loading: true, error: null });
    try {
      await quizService.addQuestionPhoto(questionId, photo);
      // Update the question in the store to reflect it now has a photo
      set((state) => ({
        currentQuestions: state.currentQuestions.map((question) =>
          question.id === questionId ? { ...question, hasPhoto: true } : question,
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add question photo',
        loading: false,
      });
      throw error;
    }
  },

  getQuizPhoto: async (quizId: number) => {
    try {
      const photoUrl = await quizService.getUserQuizPhoto(quizId);
      return photoUrl;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get quiz photo',
      });
      return '';
    }
  },

  getQuestionPhoto: async (questionId: number) => {
    try {
      const photoUrl = await quizService.getUserQuestionPhoto(questionId);
      return photoUrl;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get question photo',
      });
      return '';
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentQuiz: () => set({ currentQuiz: null }),
  clearCurrentQuestions: () => set({ currentQuestions: [] }),

  // Quiz playing actions
  startQuiz: async (quizId: number) => {
    set({ loading: true, error: null });
    try {
      await quizService.getUserQuizQuestions(quizId, 0, 50);
      set({
        quizStarted: true,
        currentQuestionIndex: 0,
        selectedAnswers: {},
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start quiz',
        loading: false,
      });
    }
  },

  selectAnswer: async (questionId: number, answerIndex: number) => {
    try {
      const state = useQuizStore.getState();
      const currentQuestion = state.currentQuestions.find((q) => q.id === questionId);
      if (!currentQuestion || !state.currentQuiz) {
        throw new Error('Quiz or question not found');
      }
      const selectedAnswer = currentQuestion.answers[answerIndex];
      if (!selectedAnswer) {
        throw new Error('Answer not found');
      }
      await quizService.fillQuizAnswer(state.currentQuiz.quizId, questionId, selectedAnswer.id);
      set((prev) => ({
        selectedAnswers: {
          ...prev.selectedAnswers,
          [questionId]: answerIndex,
        },
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit answer',
      });
      throw error;
    }
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
      const existingResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
      existingResults[quizResult.quizId] = quizResult;
      localStorage.setItem('quizResults', JSON.stringify(existingResults));

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
}));

// Helper function to calculate quiz score
const calculateScore = (
  questions: QuizQuestion[],
  selectedAnswers: Record<number, number>,
): number => {
  let correctAnswers = 0;

  questions.forEach((question) => {
    const selectedAnswerIndex = selectedAnswers[question.id];
    if (selectedAnswerIndex !== undefined) {
      const selectedAnswer = question.answers[selectedAnswerIndex];
      if (selectedAnswer && selectedAnswer.isCorrect) {
        correctAnswers++;
      }
    }
  });

  return correctAnswers;
};

// Helper function to clean up blob URLs
export const cleanupBlobUrl = (url: string) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
