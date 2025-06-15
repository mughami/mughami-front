import apiClient from './client';

export interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  maxPollsPerUser: number;
  maxOptionsPerPoll: number;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
}

const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const response = await apiClient.get<Settings>('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await apiClient.put<Settings>('/admin/settings', settings);
    return response.data;
  },
};

export default settingsService;
