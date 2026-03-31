import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorMessages';
import dashboardService, {
  type DashboardStats,
  type QuizStatsResponse,
} from '../services/api/dashboardService';

interface DashboardStore {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  // quiz stats
  quizStats: QuizStatsResponse | null;
  quizStatsLoading: boolean;
  fetchQuizStats: (page?: number, size?: number) => Promise<void>;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  loading: false,
  error: null,
  quizStats: null,
  quizStatsLoading: false,
  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await dashboardService.getStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'სტატისტიკის ჩატვირთვა ვერ მოხერხდა'), loading: false });
    }
  },
  fetchQuizStats: async (page = 1, size = 10) => {
    try {
      set({ quizStatsLoading: true, error: null });
      const data = await dashboardService.getQuizStats(page, size);
      set({ quizStats: data, quizStatsLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'ვიქტორინის სტატისტიკის ჩატვირთვა ვერ მოხერხდა'), quizStatsLoading: false });
    }
  },
}));

export default useDashboardStore;
