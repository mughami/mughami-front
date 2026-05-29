import apiClient from './client';

export interface BracketOption {
  id: number;
  photoUrl: string;
  totalWinnings: number;
}

export type BracketStatus = 'ACTIVE' | 'PENDING';

export interface Bracket {
  id: number;
  name: string;
  createdAt?: string;
  status: BracketStatus;
  options: BracketOption[];
}

export interface UpdateBracketRequest {
  name: string;
  status: BracketStatus;
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

  getAdminBrackets: async (page = 0, size = 50): Promise<BracketPageResponse> => {
    const response = await apiClient.get<BracketPageResponse>(
      `/admin/bracket?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getAdminBracket: async (id: number): Promise<Bracket> => {
    const response = await apiClient.get<Bracket>(`/admin/bracket/${id}`);
    return response.data;
  },

  createBracket: async (name: string, status: BracketStatus = 'PENDING'): Promise<Bracket> => {
    const response = await apiClient.post<Bracket>('/admin/bracket', { name, status });
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

  // ─── Customer (App) Endpoints ─────────────────────────────────────

  getBrackets: async (page = 0, size = 50): Promise<BracketPageResponse> => {
    const response = await apiClient.get<BracketPageResponse>(
      `/app/bracket?page=${page}&size=${size}`,
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
