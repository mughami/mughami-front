import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../services';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login({ mail: email, password });

          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'შეცდომა ავტორიზაციისას',
          });
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

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
