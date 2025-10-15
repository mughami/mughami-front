import { Status } from '../../types';
import type { User } from './authService';
import apiClient from './client';
import type { Poll, PollOption } from './pollService';

export interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalContests: number;
  totalPolls: number;
  activeUsers: number;
  totalVotes: number;
}

export interface QuizStatsItem {
  quizName: string;
  quizId: number;
  totalGuestUsers: number;
  completedGuestUsers: number;
  totalRegisteredUsers: number;
  completedRegisteredUsers: number;
}

export interface QuizStatsResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  content: QuizStatsItem[];
  number: number; // current page (1-based)
  numberOfElements: number;
  last: boolean;
  empty: boolean;
}

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const polls = await apiClient.get('/admin/polls?page=0&size=1000');
    const categories = await apiClient.get('/admin/category');
    const users = await apiClient.get('/admin/user/get-all');
    // const quizes = await apiClient.get('/admin/contest');

    return {
      totalPolls: polls.data.totalElements,
      totalCategories: categories.data.length,
      totalUsers: users.data.length,
      totalContests: 0,
      activeUsers: users.data.filter((user: User) => user.status === Status.ACTIVE).length,
      totalVotes: polls.data.content.reduce(
        (acc: number, poll: Poll) =>
          acc + poll.options.reduce((acc: number, option: PollOption) => acc + option.result, 0),
        0,
      ),
    };
  },
  getQuizStats: async (page: number = 1, size: number = 10): Promise<QuizStatsResponse> => {
    const response = await apiClient.get<QuizStatsResponse>(
      `/admin/stats/quiz-stats?page=${page}&size=${size}`,
    );
    return response.data;
  },
};

export default dashboardService;
