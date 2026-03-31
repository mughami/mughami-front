import { create } from 'zustand';
import { getErrorMessage } from '../utils/errorMessages';
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
    } catch (error) {
      set({ error: getErrorMessage(error, 'მომხმარებლების ჩატვირთვა ვერ მოხერხდა'), loading: false });
    }
  },

  fetchDeletedUsers: async () => {
    set({ loading: true, error: null });
    try {
      const deletedUsers = await userService.getDeletedUsers();
      set({ deletedUsers, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'წაშლილი მომხმარებლების ჩატვირთვა ვერ მოხერხდა'), loading: false });
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
    } catch (error) {
      set({ error: getErrorMessage(error, 'მომხმარებლის შექმნა ვერ მოხერხდა'), loading: false });
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
    } catch (error) {
      set({ error: getErrorMessage(error, 'მომხმარებლის განახლება ვერ მოხერხდა'), loading: false });
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
    } catch (error) {
      set({ error: getErrorMessage(error, 'მომხმარებლის წაშლა ვერ მოხერხდა'), loading: false });
    }
  },
}));

export default useUserStore;
