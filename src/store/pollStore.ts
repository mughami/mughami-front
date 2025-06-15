import { create } from 'zustand';
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
    } catch {
      set({ error: 'Failed to fetch polls', loading: false });
    }
  },

  fetchPolls: async (page: number, size: number) => {
    try {
      set({ loading: true, error: null });
      const response = await pollService.getPolls(page, size);
      set({ polls: response.content, loading: false });
    } catch {
      set({ error: 'Failed to fetch polls', loading: false });
    }
  },

  createPoll: async (data: CreatePollRequest) => {
    try {
      set({ loading: true, error: null });
      await pollService.createPoll(data);
      set({ loading: false });
    } catch {
      set({ error: 'Failed to create poll', loading: false });
    }
  },

  deletePoll: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await pollService.deletePoll(id);
      set({ loading: false });
    } catch {
      set({ error: 'Failed to delete poll', loading: false });
    }
  },

  updatePoll: async (id: number, data: CreatePollRequest) => {
    try {
      set({ loading: true, error: null });
      await pollService.updatePoll(id, data);
      set({ loading: false });
    } catch {
      set({ error: 'Failed to update poll', loading: false });
    }
  },

  vote: async (pollId: number, pollOptionId: number) => {
    try {
      set({ loading: true, error: null });
      await pollService.vote(pollId, pollOptionId);
      // Refresh polls to get updated results
      const response = await pollService.getPolls(0, 10);
      set({ polls: response.content, loading: false });
    } catch {
      set({ error: 'Failed to submit vote', loading: false });
    }
  },
}));
