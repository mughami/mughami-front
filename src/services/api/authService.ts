import apiClient from './client';
import { UserRole } from '../../types';

export interface LoginCredentials {
  mail: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  lastname: string;
  username: string;
}

export interface User {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/authentication/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/app/user/register', data);
    return response.data;
  },

  verifyAccount: async (email: string, otp: string): Promise<void> => {
    const response = await apiClient.put(`/app/user/verify-account?email=${email}&otp=${otp}`);
    return response.data;
  },

  resendOTP: async (email: string): Promise<void> => {
    const response = await apiClient.get(`/app/otp?email=${email}`);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/app/user/');
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
