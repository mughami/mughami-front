import { create } from 'zustand';
import settingsService, { type Settings } from '../services/api/settingsService';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.getSettings();
      set({ settings, loading: false });
    } catch {
      set({ error: 'Failed to fetch settings', loading: false });
    }
  },

  updateSettings: async (newSettings: Partial<Settings>) => {
    set({ loading: true, error: null });
    try {
      const updatedSettings = await settingsService.updateSettings(newSettings);
      set({ settings: updatedSettings, loading: false });
    } catch {
      set({ error: 'Failed to update settings', loading: false });
    }
  },
}));

export default useSettingsStore;
