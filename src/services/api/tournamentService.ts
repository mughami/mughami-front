import apiClient from './client';
import type {
  Tournament,
  TournamentResponse,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentStatus,
} from '../../types';

const tournamentService = {
  // ─── Admin Endpoints ───────────────────────────────────────────────

  getAdminTournaments: async (
    page: number = 0,
    size: number = 10,
    status?: TournamentStatus,
  ): Promise<TournamentResponse> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.append('status', status);
    const response = await apiClient.get<TournamentResponse>(`/admin/tournament?${params}`);
    return response.data;
  },

  getAdminTournament: async (tournamentId: number): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/admin/tournament/${tournamentId}`);
    return response.data;
  },

  createTournament: async (data: CreateTournamentRequest): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>('/admin/tournament', data);
    return response.data;
  },

  updateTournament: async (
    tournamentId: number,
    data: UpdateTournamentRequest,
  ): Promise<Tournament> => {
    const response = await apiClient.put<Tournament>(`/admin/tournament/${tournamentId}`, data);
    return response.data;
  },

  deleteTournament: async (tournamentId: number): Promise<void> => {
    await apiClient.delete(`/admin/tournament/${tournamentId}`);
  },

  getAdminTournamentsByQuiz: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/admin/tournament/tournament-by-quiz/${quizId}?page=${page}&size=${size}`,
    );
    return response.data;
  },

  // ─── User (App) Endpoints ─────────────────────────────────────────

  getUserTournaments: async (page: number = 0, size: number = 10): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/app/tournament?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getUserTournament: async (tournamentId: number): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/app/tournament/${tournamentId}`);
    return response.data;
  },

  getUpcomingTournaments: async (page: number = 0, size: number = 10): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/app/tournament/upcoming?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getStartedTournaments: async (page: number = 0, size: number = 10): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/app/tournament/started?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getFinishedTournaments: async (page: number = 0, size: number = 10): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/app/tournament/finished?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getActiveTournaments: async (page: number = 0, size: number = 10): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/app/tournament/active?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getTournamentsByQuiz: async (
    quizId: number,
    page: number = 0,
    size: number = 10,
  ): Promise<TournamentResponse> => {
    const response = await apiClient.get<TournamentResponse>(
      `/app/tournament/by-quiz/${quizId}?page=${page}&size=${size}`,
    );
    return response.data;
  },
};

export default tournamentService;
