import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../services';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    name: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getCurrentUser: () => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initialize: async () => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        const currentUser = await authService.getCurrentUser();

        if (token && refreshToken && currentUser) {
          try {
            set({
              user: currentUser,
              token,
              refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Error parsing user data:', error);
            get().logout();
          }
        }
      },

      login: async (email: string, password: string): Promise<User | null> => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login({ mail: email, password });

          // Store tokens
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);

          // Fetch user data
          const userData = await authService.getCurrentUser();

          set({
            user: userData,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return userData;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'შეცდომა ავტორიზაციისას',
          });
          return null;
        }
      },

      register: async (
        name: string,
        lastname: string,
        username: string,
        email: string,
        password: string,
      ) => {
        try {
          set({ isLoading: true, error: null });
          await authService.register({ name, lastname, username, email, password });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'შეცდომა რეგისტრაციისას',
          });
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true });
        const user = await authService.getCurrentUser();
        set({ user, isLoading: false });
        return user;
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
