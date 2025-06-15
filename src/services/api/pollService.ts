import apiClient from './client';

export interface PollOption {
  id: number;
  name: string;
  photoUrl?: string;
  result: number;
}

export interface Poll {
  id: number;
  title: string;
  options: PollOption[];
}

export interface CreatePollRequest {
  name: string;
  options: {
    name: string;
  }[];
}

export interface PollsResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: Poll[];
  number: number;
  sort: {
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
  }[];
  pageable: {
    offset: number;
    sort: {
      direction: string;
      nullHandling: string;
      ascending: boolean;
      property: string;
      ignoreCase: boolean;
    }[];
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
    paged: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

const pollService = {
  getAdminPolls: async (page: number, size: number): Promise<PollsResponse> => {
    const response = await apiClient.get<PollsResponse>(`/admin/polls?page=${page}&size=${size}`);
    return response.data;
  },

  getPolls: async (page: number, size: number): Promise<PollsResponse> => {
    const response = await apiClient.get<PollsResponse>(`/app/polls?page=${page}&size=${size}`);
    return response.data;
  },

  createPoll: async (data: CreatePollRequest): Promise<Poll> => {
    const response = await apiClient.post<Poll>('/admin/polls', data);
    return response.data;
  },

  getPoll: async (id: number): Promise<Poll> => {
    const response = await apiClient.get<Poll>(`/admin/polls/${id}`);
    return response.data;
  },

  deletePoll: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/polls/${id}`);
  },

  updatePoll: async (id: number, data: CreatePollRequest): Promise<void> => {
    await apiClient.put(`/admin/polls/${id}`, data);
  },

  vote: async (pollId: number, pollOptionId: number): Promise<void> => {
    await apiClient.post(`/app/polls?pollId=${pollId}&pollOptionId=${pollOptionId}`);
  },
};

export default pollService;
