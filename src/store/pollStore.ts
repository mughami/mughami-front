import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorMessages';
import pollService, { type Poll, type CreatePollRequest } from '../services/api/pollService';

interface PollStore {
  polls: Poll[];
  loading: boolean;
  error: string | null;
  fetchAdminPolls: (page: number, size: number) => Promise<void>;
  fetchPolls: (page: number, size: number) => Promise<void>;
  createPoll: (data: CreatePollRequest) => Promise<void>;
  deletePoll: (id: number) => Promise<void>;
  updatePoll: (id: number, data: CreatePollRequest) => Promise<void>;
  vote: (pollId: number, pollOptionId: number) => Promise<void>;
}

export const usePollStore = create<PollStore>((set) => ({
  polls: [],
  loading: false,
  error: null,

  fetchAdminPolls: async (page: number, size: number) => {
    try {
      set({ loading: true, error: null });
      const response = await pollService.getAdminPolls(page, size);
      set({ polls: response.content, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'გამოკითხვების ჩატვირთვა ვერ მოხერხდა'), loading: false });
    }
  },

  fetchPolls: async (page: number, size: number) => {
    try {
      set({ loading: true, error: null });
      const response = await pollService.getPolls(page, size);
      set({ polls: response.content, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'გამოკითხვების ჩატვირთვა ვერ მოხერხდა'), loading: false });
    }
  },

  createPoll: async (data: CreatePollRequest) => {
    try {
      set({ loading: true, error: null });
      await pollService.createPoll(data);
      set({ loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'გამოკითხვის შექმნა ვერ მოხერხდა'), loading: false });
    }
  },

  deletePoll: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await pollService.deletePoll(id);
      set({ loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'გამოკითხვის წაშლა ვერ მოხერხდა'), loading: false });
    }
  },

  updatePoll: async (id: number, data: CreatePollRequest) => {
    try {
      set({ loading: true, error: null });
      await pollService.updatePoll(id, data);
      set({ loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'გამოკითხვის განახლება ვერ მოხერხდა'), loading: false });
    }
  },

  vote: async (pollId: number, pollOptionId: number) => {
    try {
      set({ loading: true, error: null });
      await pollService.vote(pollId, pollOptionId);
      // Refresh polls to get updated results
      const response = await pollService.getPolls(0, 10);
      set({ polls: response.content, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'ხმის მიცემა ვერ მოხერხდა'), loading: false });
    }
  },
}));
