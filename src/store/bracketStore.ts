import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorMessages';
import bracketService, {
  type Bracket,
  type BracketMatchup,
  type BracketWinner,
} from '../services/api/bracketService';

const DEFAULT_PAGE_SIZE = 50;

const SESSION_STORAGE_KEY = 'bracket_session';

interface PersistedSession {
  sessionId: string;
  bracketId: number;
  bracketName: string;
}

const loadPersistedSession = (): PersistedSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
};

const persistSession = (session: PersistedSession | null) => {
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

interface BracketStore {
  brackets: Bracket[];
  bracketsTotal: number;
  adminBrackets: Bracket[];
  adminBracketsTotal: number;
  currentBracketDetails: Bracket | null;
  sessionId: string | null;
  activeBracketId: number | null;
  activeBracketName: string | null;
  matchup: BracketMatchup | null;
  winner: BracketWinner | null;
  loading: boolean;
  voting: boolean;
  error: string | null;

  fetchBrackets: (page?: number, size?: number) => Promise<void>;
  fetchAdminBrackets: (page?: number, size?: number) => Promise<void>;
  fetchAdminBracket: (id: number) => Promise<Bracket | null>;
  createBracket: (name: string) => Promise<void>;
  deleteBracket: (id: number) => Promise<void>;
  addBracketOption: (bracketId: number, photo: File) => Promise<void>;
  deleteBracketOption: (bracketId: number, optionId: number) => Promise<void>;

  startSession: (bracketId: number, bracketName: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  submitVote: (winnerId: number) => Promise<void>;
  finishSession: () => Promise<void>;
  resetSession: () => void;
  clearError: () => void;
}

export const useBracketStore = create<BracketStore>((set, get) => ({
  brackets: [],
  bracketsTotal: 0,
  adminBrackets: [],
  adminBracketsTotal: 0,
  currentBracketDetails: null,
  sessionId: null,
  activeBracketId: null,
  activeBracketName: null,
  matchup: null,
  winner: null,
  loading: false,
  voting: false,
  error: null,

  fetchBrackets: async (page = 0, size = DEFAULT_PAGE_SIZE) => {
    try {
      set({ loading: true, error: null });
      const response = await bracketService.getBrackets(page, size);
      set({
        brackets: response.content,
        bracketsTotal: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'თამაშების ჩატვირთვა ვერ მოხერხდა'),
        loading: false,
      });
    }
  },

  fetchAdminBrackets: async (page = 0, size = DEFAULT_PAGE_SIZE) => {
    try {
      set({ loading: true, error: null });
      const response = await bracketService.getAdminBrackets(page, size);
      set({
        adminBrackets: response.content,
        adminBracketsTotal: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'თამაშების ჩატვირთვა ვერ მოხერხდა'),
        loading: false,
      });
    }
  },

  fetchAdminBracket: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const data = await bracketService.getAdminBracket(id);
      set({ currentBracketDetails: data, loading: false });
      return data;
    } catch (error) {
      set({
        error: getErrorMessage(error, 'თამაშის დეტალების ჩატვირთვა ვერ მოხერხდა'),
        loading: false,
      });
      return null;
    }
  },

  createBracket: async (name: string) => {
    try {
      set({ loading: true, error: null });
      await bracketService.createBracket(name);
      const response = await bracketService.getAdminBrackets(0, DEFAULT_PAGE_SIZE);
      set({
        adminBrackets: response.content,
        adminBracketsTotal: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'თამაშის შექმნა ვერ მოხერხდა'),
        loading: false,
      });
      throw error;
    }
  },

  deleteBracket: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await bracketService.deleteBracket(id);
      const response = await bracketService.getAdminBrackets(0, DEFAULT_PAGE_SIZE);
      set({
        adminBrackets: response.content,
        adminBracketsTotal: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'თამაშის წაშლა ვერ მოხერხდა'),
        loading: false,
      });
      throw error;
    }
  },

  addBracketOption: async (bracketId: number, photo: File) => {
    try {
      set({ loading: true, error: null });
      await bracketService.addBracketOption(bracketId, photo);
      const refreshed = await bracketService.getAdminBracket(bracketId);
      set({ currentBracketDetails: refreshed, loading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ვარიანტის დამატება ვერ მოხერხდა'),
        loading: false,
      });
      throw error;
    }
  },

  deleteBracketOption: async (bracketId: number, optionId: number) => {
    try {
      set({ loading: true, error: null });
      await bracketService.deleteBracketOption(optionId);
      const refreshed = await bracketService.getAdminBracket(bracketId);
      set({ currentBracketDetails: refreshed, loading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ვარიანტის წაშლა ვერ მოხერხდა'),
        loading: false,
      });
      throw error;
    }
  },

  startSession: async (bracketId: number, bracketName: string) => {
    try {
      set({
        loading: true,
        error: null,
        winner: null,
        matchup: null,
      });
      const data = await bracketService.startSession(bracketId);
      persistSession({ sessionId: data.sessionId, bracketId, bracketName });
      set({
        sessionId: data.sessionId,
        activeBracketId: bracketId,
        activeBracketName: bracketName,
        matchup: data.currentMatchup,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'სესიის დაწყება ვერ მოხერხდა'),
        loading: false,
      });
      throw error;
    }
  },

  resumeSession: async () => {
    const persisted = loadPersistedSession();
    if (!persisted) return;
    try {
      set({ loading: true, error: null });
      const matchup = await bracketService.getCurrentMatchup(persisted.sessionId);
      set({
        sessionId: persisted.sessionId,
        activeBracketId: persisted.bracketId,
        activeBracketName: persisted.bracketName,
        matchup,
        loading: false,
      });
    } catch {
      persistSession(null);
      set({
        sessionId: null,
        activeBracketId: null,
        activeBracketName: null,
        matchup: null,
        loading: false,
      });
    }
  },

  submitVote: async (winnerId: number) => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      set({ voting: true, error: null });
      const result = await bracketService.submitVote(sessionId, winnerId);
      if (result.winner) {
        try {
          await bracketService.finishSession(sessionId);
        } catch {
          // Non-fatal: winner is already known from the vote response;
          // only the backend totalWinnings counter is at risk.
        }
        persistSession(null);
        set({
          winner: result.winner,
          matchup: null,
          sessionId: null,
          voting: false,
        });
      } else if (result.nextMatchup) {
        set({ matchup: result.nextMatchup, voting: false });
      } else {
        set({ voting: false });
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, 'ხმის ჩაწერა ვერ მოხერხდა'),
        voting: false,
      });
    }
  },

  finishSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      set({ loading: true, error: null });
      const winner = await bracketService.finishSession(sessionId);
      persistSession(null);
      set({
        winner,
        matchup: null,
        sessionId: null,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'სესიის დასრულება ვერ მოხერხდა'),
        loading: false,
      });
    }
  },

  resetSession: () => {
    persistSession(null);
    set({
      sessionId: null,
      activeBracketId: null,
      activeBracketName: null,
      matchup: null,
      winner: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
