import apiClient from './client';
import type { User } from './authService';
import { UserRole } from '../../types';

export type UserResponse = User[];

export interface CreateUserRequest {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
}

export interface UpdateUserRequest {
  name: string;
  lastname: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface UserFilters {
  createdFrom?: string;
  createdTo?: string;
  verifiedFrom?: string;
  verifiedTo?: string;
}

const userService = {
  getAllUsers: async (filters: UserFilters = {}): Promise<UserResponse> => {
    const params = new URLSearchParams();
    if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
    if (filters.createdTo) params.set('createdTo', filters.createdTo);
    if (filters.verifiedFrom) params.set('verifiedFrom', filters.verifiedFrom);
    if (filters.verifiedTo) params.set('verifiedTo', filters.verifiedTo);
    const query = params.toString();
    const response = await apiClient.get<UserResponse>(
      `/admin/user/get-all${query ? `?${query}` : ''}`,
    );
    return response.data;
  },

  getDeletedUsers: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/admin/user/get-deleted`);
    return response.data;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/admin/user/add_user', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/admin/user/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/user/delete-user/${userId}`);
  },
};

export default userService;
