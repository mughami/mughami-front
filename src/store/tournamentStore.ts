import { create } from 'zustand';
import type {
  Tournament,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentStatus,
} from '../types';
import tournamentService from '../services/api/tournamentService';

interface TournamentState {
  // Data
  tournaments: Tournament[];
  totalTournaments: number;
  currentTournament: Tournament | null;

  // User-facing lists
  upcomingTournaments: Tournament[];
  startedTournaments: Tournament[];
  finishedTournaments: Tournament[];
  activeTournaments: Tournament[];

  // Loading / error
  loading: boolean;
  error: string | null;

  // ─── Admin Actions ─────────────────────────────────────────────
  fetchAdminTournaments: (page?: number, size?: number, status?: TournamentStatus) => Promise<void>;
  fetchAdminTournament: (tournamentId: number) => Promise<void>;
  createTournament: (data: CreateTournamentRequest) => Promise<Tournament>;
  updateTournament: (tournamentId: number, data: UpdateTournamentRequest) => Promise<Tournament>;
  deleteTournament: (tournamentId: number) => Promise<void>;

  // ─── User Actions ──────────────────────────────────────────────
  fetchUserTournaments: (page?: number, size?: number) => Promise<void>;
  fetchUserTournament: (tournamentId: number) => Promise<void>;
  fetchUpcomingTournaments: (page?: number, size?: number) => Promise<void>;
  fetchStartedTournaments: (page?: number, size?: number) => Promise<void>;
  fetchFinishedTournaments: (page?: number, size?: number) => Promise<void>;
  fetchActiveTournaments: (page?: number, size?: number) => Promise<void>;

  // ─── Utility ───────────────────────────────────────────────────
  clearError: () => void;
  clearCurrentTournament: () => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  tournaments: [],
  totalTournaments: 0,
  currentTournament: null,

  upcomingTournaments: [],
  startedTournaments: [],
  finishedTournaments: [],
  activeTournaments: [],

  loading: false,
  error: null,

  // ─── Admin Actions ───────────────────────────────────────────────

  fetchAdminTournaments: async (page = 0, size = 10, status?: TournamentStatus) => {
    set({ loading: true, error: null });
    try {
      const response = await tournamentService.getAdminTournaments(page, size, status);
      set({
        tournaments: response.content,
        totalTournaments: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირების ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  fetchAdminTournament: async (tournamentId: number) => {
    set({ loading: true, error: null });
    try {
      const tournament = await tournamentService.getAdminTournament(tournamentId);
      set({ currentTournament: tournament, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირის ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  createTournament: async (data: CreateTournamentRequest) => {
    set({ loading: true, error: null });
    try {
      const newTournament = await tournamentService.createTournament(data);
      set((state) => ({
        tournaments: [newTournament, ...state.tournaments],
        totalTournaments: state.totalTournaments + 1,
        loading: false,
      }));
      return newTournament;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირის შექმნა ვერ მოხერხდა',
        loading: false,
      });
      throw error;
    }
  },

  updateTournament: async (tournamentId: number, data: UpdateTournamentRequest) => {
    set({ loading: true, error: null });
    try {
      const updated = await tournamentService.updateTournament(tournamentId, data);
      set((state) => ({
        tournaments: state.tournaments.map((t) => (t.id === tournamentId ? updated : t)),
        currentTournament:
          state.currentTournament?.id === tournamentId ? updated : state.currentTournament,
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირის განახლება ვერ მოხერხდა',
        loading: false,
      });
      throw error;
    }
  },

  deleteTournament: async (tournamentId: number) => {
    set({ loading: true, error: null });
    try {
      await tournamentService.deleteTournament(tournamentId);
      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== tournamentId),
        totalTournaments: state.totalTournaments - 1,
        currentTournament:
          state.currentTournament?.id === tournamentId ? null : state.currentTournament,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირის წაშლა ვერ მოხერხდა',
        loading: false,
      });
      throw error;
    }
  },

  // ─── User Actions ────────────────────────────────────────────────

  fetchUserTournaments: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tournamentService.getUserTournaments(page, size);
      set({
        tournaments: response.content,
        totalTournaments: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირების ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  fetchUserTournament: async (tournamentId: number) => {
    set({ loading: true, error: null });
    try {
      const tournament = await tournamentService.getUserTournament(tournamentId);
      set({ currentTournament: tournament, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'ტურნირის ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  fetchUpcomingTournaments: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tournamentService.getUpcomingTournaments(page, size);
      set({ upcomingTournaments: response.content, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'მომავალი ტურნირების ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  fetchStartedTournaments: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tournamentService.getStartedTournaments(page, size);
      set({ startedTournaments: response.content, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'მიმდინარე ტურნირების ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  fetchFinishedTournaments: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tournamentService.getFinishedTournaments(page, size);
      set({ finishedTournaments: response.content, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'დასრულებული ტურნირების ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  fetchActiveTournaments: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tournamentService.getActiveTournaments(page, size);
      set({ activeTournaments: response.content, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'აქტიური ტურნირების ჩატვირთვა ვერ მოხერხდა',
        loading: false,
      });
    }
  },

  // ─── Utility ─────────────────────────────────────────────────────

  clearError: () => set({ error: null }),
  clearCurrentTournament: () => set({ currentTournament: null }),
}));
