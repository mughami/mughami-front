import { create } from 'zustand';
import dashboardService, { type DashboardStats } from '../services/api/dashboardService';

interface DashboardStore {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  loading: false,
  error: null,
  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await dashboardService.getStats();
      set({ stats, loading: false });
    } catch {
      set({ error: 'Failed to fetch dashboard statistics', loading: false });
    }
  },
}));

export default useDashboardStore;
