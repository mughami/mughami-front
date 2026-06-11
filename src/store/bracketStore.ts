import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorMessages';
import bracketService, {
  isBracketFavorite,
  type AdminBracketQueryParams,
  type Bracket,
  type BracketMatchup,
  type BracketQueryParams,
  type BracketWinner,
  type CreateBracketRequest,
  type SuggestedBracket,
  type UpdateBracketRequest,
} from '../services/api/bracketService';

// Favorite brackets surface first; order is otherwise preserved (stable sort).
const sortFavoritesFirst = (brackets: Bracket[]): Bracket[] =>
  [...brackets].sort((a, b) => Number(isBracketFavorite(b)) - Number(isBracketFavorite(a)));

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
  suggestions: SuggestedBracket[];
  suggestionsLoading: boolean;
  playerSuggestions: SuggestedBracket[];
  sessionId: string | null;
  activeBracketId: number | null;
  activeBracketName: string | null;
  matchup: BracketMatchup | null;
  winner: BracketWinner | null;
  loading: boolean;
  voting: boolean;
  error: string | null;
  // Last admin query, reused when a mutation triggers a refresh so active
  // filters/pagination are preserved.
  adminQuery: AdminBracketQueryParams;

  fetchBrackets: (params?: BracketQueryParams) => Promise<void>;
  fetchAdminBrackets: (params?: AdminBracketQueryParams) => Promise<void>;
  fetchAdminBracket: (id: number) => Promise<Bracket | null>;
  createBracket: (data: CreateBracketRequest) => Promise<void>;
  updateBracket: (id: number, data: UpdateBracketRequest) => Promise<void>;
  deleteBracket: (id: number) => Promise<void>;
  addBracketOption: (bracketId: number, photo: File) => Promise<void>;
  deleteBracketOption: (bracketId: number, optionId: number) => Promise<void>;
  fetchSuggestions: (bracketId: number) => Promise<void>;
  addSuggestions: (bracketId: number, suggestedBracketIds: number[]) => Promise<void>;
  removeSuggestion: (bracketId: number, suggestedBracketId: number) => Promise<void>;
  clearSuggestions: () => void;
  fetchPlayerSuggestions: (bracketId: number) => Promise<void>;

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
  suggestions: [],
  suggestionsLoading: false,
  playerSuggestions: [],
  sessionId: null,
  activeBracketId: null,
  activeBracketName: null,
  matchup: null,
  winner: null,
  loading: false,
  voting: false,
  error: null,
  adminQuery: { page: 0, size: DEFAULT_PAGE_SIZE },

  fetchBrackets: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await bracketService.getBrackets({ size: DEFAULT_PAGE_SIZE, ...params });
      set({
        brackets: sortFavoritesFirst(response.content),
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

  fetchAdminBrackets: async (params = {}) => {
    const query: AdminBracketQueryParams = { size: DEFAULT_PAGE_SIZE, ...params };
    try {
      set({ loading: true, error: null, adminQuery: query });
      const response = await bracketService.getAdminBrackets(query);
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

  createBracket: async (data: CreateBracketRequest) => {
    try {
      set({ loading: true, error: null });
      await bracketService.createBracket(data);
      const response = await bracketService.getAdminBrackets(get().adminQuery);
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

  updateBracket: async (id: number, data: UpdateBracketRequest) => {
    try {
      set({ loading: true, error: null });
      await bracketService.updateBracket(id, data);
      const response = await bracketService.getAdminBrackets(get().adminQuery);
      set({
        adminBrackets: response.content,
        adminBracketsTotal: response.totalElements,
        loading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'თამაშის განახლება ვერ მოხერხდა'),
        loading: false,
      });
      throw error;
    }
  },

  deleteBracket: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await bracketService.deleteBracket(id);
      const response = await bracketService.getAdminBrackets(get().adminQuery);
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

  fetchSuggestions: async (bracketId: number) => {
    try {
      set({ suggestionsLoading: true, error: null });
      const suggestions = await bracketService.getBracketSuggestions(bracketId);
      set({ suggestions, suggestionsLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'შეთავაზებების ჩატვირთვა ვერ მოხერხდა'),
        suggestionsLoading: false,
      });
    }
  },

  addSuggestions: async (bracketId: number, suggestedBracketIds: number[]) => {
    try {
      set({ suggestionsLoading: true, error: null });
      const suggestions = await bracketService.addBracketSuggestions(
        bracketId,
        suggestedBracketIds,
      );
      set({ suggestions, suggestionsLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'შეთავაზების დამატება ვერ მოხერხდა'),
        suggestionsLoading: false,
      });
      throw error;
    }
  },

  removeSuggestion: async (bracketId: number, suggestedBracketId: number) => {
    try {
      set({ suggestionsLoading: true, error: null });
      await bracketService.removeBracketSuggestions(bracketId, [suggestedBracketId]);
      set((state) => ({
        suggestions: state.suggestions.filter((s) => s.id !== suggestedBracketId),
        suggestionsLoading: false,
      }));
    } catch (error) {
      set({
        error: getErrorMessage(error, 'შეთავაზების წაშლა ვერ მოხერხდა'),
        suggestionsLoading: false,
      });
      throw error;
    }
  },

  clearSuggestions: () => set({ suggestions: [] }),

  fetchPlayerSuggestions: async (bracketId: number) => {
    try {
      const playerSuggestions = await bracketService.getSuggestionsForBracket(bracketId);
      set({ playerSuggestions });
    } catch {
      // Suggestions are a non-critical enhancement on the finish screen.
      set({ playerSuggestions: [] });
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
      playerSuggestions: [],
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
