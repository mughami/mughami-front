import { create } from 'zustand';
import { quizService, type Quiz, type QuizResult } from '../services';

interface QuizState {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  selectedOptions: Record<string, number | null>;
  timeLeft: number;
  score: number;
  quizResult: QuizResult | null;
  isLoading: boolean;
  error: string | null;
  quizCompleted: boolean;
  paymentConfirmed: boolean;

  fetchQuizByCategory: (categoryId: string) => Promise<void>;
  startQuiz: (categoryId: string) => Promise<void>;
  selectOption: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
  setTimeLeft: (time: number) => void;
  confirmPayment: () => void;
  clearError: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quiz: null,
  currentQuestionIndex: 0,
  selectedOptions: {},
  timeLeft: 0,
  score: 0,
  quizResult: null,
  isLoading: false,
  error: null,
  quizCompleted: false,
  paymentConfirmed: false,

  fetchQuizByCategory: async (categoryId: string) => {
    try {
      set({ isLoading: true, error: null });
      const quiz = await quizService.getQuizByCategoryId(categoryId);
      set({
        quiz,
        isLoading: false,
        timeLeft: quiz.timePerQuestion,
        selectedOptions: quiz.questions.reduce((acc, q) => ({ ...acc, [q.id]: null }), {}),
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ვიქტორინის ჩატვირთვისას',
      });
    }
  },

  startQuiz: async (categoryId: string) => {
    try {
      set({ isLoading: true, error: null });
      await quizService.startQuiz(categoryId);
      set({
        currentQuestionIndex: 0,
        score: 0,
        quizResult: null,
        quizCompleted: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ვიქტორინის დაწყებისას',
      });
    }
  },

  selectOption: (questionId: string, optionIndex: number) => {
    const { quiz, selectedOptions, currentQuestionIndex } = get();
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    set({
      selectedOptions: { ...selectedOptions, [questionId]: optionIndex },
      score: optionIndex === currentQuestion.correctAnswer ? get().score + 1 : get().score,
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, quiz } = get();
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        timeLeft: quiz.timePerQuestion,
      });
    } else {
      set({ quizCompleted: true });
    }
  },

  submitQuiz: async () => {
    try {
      const { quiz, selectedOptions } = get();
      if (!quiz) return;

      set({ isLoading: true, error: null });

      const answers = Object.entries(selectedOptions).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption: selectedOption !== null ? selectedOption : -1,
      }));

      const result = await quizService.submitQuiz({
        quizId: quiz.id,
        answers,
      });

      set({
        quizResult: result,
        quizCompleted: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ვიქტორინის დასრულებისას',
      });
    }
  },

  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      selectedOptions: {},
      score: 0,
      quizResult: null,
      quizCompleted: false,
      paymentConfirmed: false,
    });
  },

  setTimeLeft: (time: number) => {
    set({ timeLeft: time });
  },

  confirmPayment: () => {
    set({ paymentConfirmed: true });
  },

  clearError: () => set({ error: null }),
}));
