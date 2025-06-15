import { create } from 'zustand';
import userService, {
  type CreateUserRequest,
  type UpdateUserRequest,
} from '../services/api/userService';
import type { User } from '../services/api/authService';

interface UserStore {
  users: User[];
  deletedUsers: User[];
  totalUsers: number;
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchDeletedUsers: () => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userId: string, userData: UpdateUserRequest) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: [],
  deletedUsers: [],
  totalUsers: 0,
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await userService.getAllUsers();
      console.log('response', response);
      set({
        users: response,
        totalUsers: response.length,
        loading: false,
      });
    } catch {
      set({ error: 'Failed to fetch users', loading: false });
    }
  },

  fetchDeletedUsers: async () => {
    set({ loading: true, error: null });
    try {
      const deletedUsers = await userService.getDeletedUsers();
      set({ deletedUsers, loading: false });
    } catch {
      set({ error: 'Failed to fetch deleted users', loading: false });
    }
  },

  createUser: async (userData: CreateUserRequest) => {
    set({ loading: true, error: null });
    try {
      const newUser = await userService.createUser(userData);
      set((state) => ({
        users: [...state.users, newUser],
        totalUsers: state.totalUsers + 1,
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to create user', loading: false });
    }
  },

  updateUser: async (userId: string, userData: UpdateUserRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(userId, userData);
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? updatedUser : user)),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to update user', loading: false });
    }
  },

  deleteUser: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      await userService.deleteUser(userId);
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        totalUsers: state.totalUsers - 1,
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to delete user', loading: false });
    }
  },
}));

export default useUserStore;
