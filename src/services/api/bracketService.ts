import apiClient from './client';
import type { CategoryResponse, SubCategoryResponse } from '../../types';

export interface BracketOption {
  id: number;
  photoUrl: string;
  totalWinnings: number;
}

export type BracketStatus = 'ACTIVE' | 'PENDING';

export type BracketType = 'FAVORITE' | 'NOT_FAVORITE';

export interface Bracket {
  id: number;
  name: string;
  createdAt?: string;
  status: BracketStatus;
  // Favorite state on GET responses (admin + public) is carried by `type`.
  type?: BracketType;
  // GET responses carry nested category objects (with names); the create/update
  // request bodies still use the flat categoryId/subcategoryId fields.
  categoryResponse?: CategoryResponse;
  subCategoryResponse?: SubCategoryResponse;
  options: BracketOption[];
}

// Single source of truth for "is this bracket a favorite" from a GET response.
export const isBracketFavorite = (bracket: Pick<Bracket, 'type'>): boolean =>
  bracket.type === 'FAVORITE';

export interface CreateBracketRequest {
  name: string;
  status: BracketStatus;
  isFavorite?: boolean;
  categoryId?: number;
  subcategoryId?: number;
}

export interface UpdateBracketRequest {
  name: string;
  status: BracketStatus;
  isFavorite?: boolean;
  categoryId?: number;
  subcategoryId?: number;
}

export interface SuggestedBracketOption {
  id: number;
  photoUrl: string;
  name: string;
  totalWinnings: number;
}

export interface SuggestedBracket {
  id: number;
  name: string;
  createdAt?: string;
  status: BracketStatus;
  type: BracketType;
  options: SuggestedBracketOption[];
}

export interface BracketPageResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  content: Bracket[];
  numberOfElements: number;
  empty: boolean;
}

export type SortDir = 'ASC' | 'DESC';

export interface BracketQueryParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  categoryId?: number;
  subcategoryId?: number;
  sortDir?: SortDir;
}

// Admin listing additionally supports filtering by status.
export interface AdminBracketQueryParams extends BracketQueryParams {
  status?: BracketStatus;
}

// Serialize params, skipping empty/undefined so the backend applies its defaults.
const buildBracketQuery = (params: Record<string, unknown>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  return search.toString();
};

export interface BracketMatchup {
  holderId: number;
  holderPhotoUrl: string;
  challengerId: number;
  challengerPhotoUrl: string;
  remaining: number;
}

export interface StartSessionResponse {
  sessionId: string;
  currentMatchup: BracketMatchup;
}

export interface BracketWinner {
  id: number;
  photoUrl: string;
}

export interface VoteResponse {
  message: string;
  nextMatchup: BracketMatchup | null;
  winner: BracketWinner | null;
}

const bracketService = {
  // ─── Admin Endpoints ───────────────────────────────────────────────

  getAdminBrackets: async (params: AdminBracketQueryParams = {}): Promise<BracketPageResponse> => {
    const { page = 0, size = 50, sortDir = 'DESC', ...rest } = params;
    const query = buildBracketQuery({ page, size, sortDir, ...rest });
    const response = await apiClient.get<BracketPageResponse>(`/admin/bracket?${query}`);
    return response.data;
  },

  getAdminBracket: async (id: number): Promise<Bracket> => {
    const response = await apiClient.get<Bracket>(`/admin/bracket/${id}`);
    return response.data;
  },

  createBracket: async (data: CreateBracketRequest): Promise<Bracket> => {
    const response = await apiClient.post<Bracket>('/admin/bracket', data);
    return response.data;
  },

  updateBracket: async (id: number, data: UpdateBracketRequest): Promise<Bracket> => {
    const response = await apiClient.put<Bracket>(`/admin/bracket/${id}`, data);
    return response.data;
  },

  deleteBracket: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/bracket/brackets/${id}`);
  },

  addBracketOption: async (bracketId: number, photo: File): Promise<BracketOption> => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await apiClient.post<BracketOption>(
      `/admin/bracket/option/${bracketId}`,
      formData,
    );
    return response.data;
  },

  deleteBracketOption: async (optionId: number): Promise<void> => {
    await apiClient.delete(`/admin/bracket/bracketOption/${optionId}`);
  },

  updateBracketOptionPhoto: async (optionId: number, photo: File): Promise<BracketOption> => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await apiClient.put<BracketOption>(
      `/admin/bracket/add-photo/${optionId}`,
      formData,
    );
    return response.data;
  },

  // ─── Admin: Bracket Suggestions ───────────────────────────────────

  getBracketSuggestions: async (bracketId: number): Promise<SuggestedBracket[]> => {
    const response = await apiClient.get<SuggestedBracket[]>(
      `/admin/brackets/${bracketId}/suggestions`,
    );
    return response.data;
  },

  addBracketSuggestions: async (
    bracketId: number,
    suggestedBracketIds: number[],
  ): Promise<SuggestedBracket[]> => {
    const response = await apiClient.post<SuggestedBracket[]>(
      `/admin/brackets/${bracketId}/suggestions`,
      { suggestedBracketIds },
    );
    return response.data;
  },

  removeBracketSuggestions: async (
    bracketId: number,
    suggestedBracketIds: number[],
  ): Promise<void> => {
    await apiClient.delete(`/admin/brackets/${bracketId}/suggestions`, {
      data: { suggestedBracketIds },
    });
  },

  // ─── Customer (App) Endpoints ─────────────────────────────────────

  getBrackets: async (params: BracketQueryParams = {}): Promise<BracketPageResponse> => {
    const { page = 0, size = 50, sortDir = 'DESC', ...rest } = params;
    const query = buildBracketQuery({ page, size, sortDir, ...rest });
    const response = await apiClient.get<BracketPageResponse>(`/app/bracket?${query}`);
    return response.data;
  },

  getSuggestionsForBracket: async (bracketId: number): Promise<SuggestedBracket[]> => {
    const response = await apiClient.get<SuggestedBracket[]>(
      `/app/bracket/suggestion/${bracketId}`,
    );
    return response.data;
  },

  startSession: async (bracketId: number): Promise<StartSessionResponse> => {
    const response = await apiClient.post<StartSessionResponse>(
      `/app/bracket/brackets/${bracketId}/start`,
    );
    return response.data;
  },

  getCurrentMatchup: async (sessionId: string): Promise<BracketMatchup> => {
    const response = await apiClient.get<BracketMatchup>(
      `/app/bracket/sessions/${sessionId}/matchup`,
    );
    return response.data;
  },

  submitVote: async (sessionId: string, winnerId: number): Promise<VoteResponse> => {
    const response = await apiClient.post<VoteResponse>(
      `/app/bracket/sessions/${sessionId}/vote`,
      { winnerId },
    );
    return response.data;
  },

  finishSession: async (sessionId: string): Promise<BracketWinner> => {
    const response = await apiClient.post<BracketWinner>(
      `/app/bracket/sessions/${sessionId}/finish`,
    );
    return response.data;
  },

  getOptionPhoto: async (optionId: number): Promise<string> => {
    const response = await apiClient.get(`/app/bracket/${optionId}/bracket-option-photo`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  },

  getAdminOptionPhoto: async (optionId: number): Promise<string> => {
    const response = await apiClient.get(`/admin/bracket/${optionId}/bracket-option-photo`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  },
};

export default bracketService;
