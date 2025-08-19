import { create } from 'zustand';
import { categoryService, type Category } from '../services';
import { useAuthStore } from './authStore';
import type { CategoryResponse, CategoryRequest } from '../types';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  adminCategories: CategoryResponse[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  fetchAdminCategories: () => Promise<void>;
  createAdminCategory: (categoryData: CategoryRequest) => Promise<void>;
  searchCategories: (term: string) => Category[];
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  adminCategories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const currentUser = await useAuthStore.getState().getCurrentUser();
      const isAdmin = currentUser?.userRole === 'ADMIN';
      const categories = await categoryService.getCategories(isAdmin);
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა კატეგორიების ჩატვირთვისას',
      });
    }
  },

  fetchCategoryById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const category = await categoryService.getCategoryById(id);
      set({ selectedCategory: category, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა კატეგორიის ჩატვირთვისას',
      });
    }
  },

  fetchAdminCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const adminCategories = await categoryService.admin.getCategories();
      set({ adminCategories, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა კატეგორიების ჩატვირთვისას',
      });
    }
  },

  createAdminCategory: async (categoryData: CategoryRequest) => {
    try {
      set({ isLoading: true, error: null });
      const newCategory = await categoryService.admin.createCategory(categoryData);
      const currentCategories = get().adminCategories;
      set({
        adminCategories: [...currentCategories, newCategory],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა კატეგორიის შექმნისას',
      });
      throw error; // Re-throw so component can handle it
    }
  },

  searchCategories: (term: string) => {
    const { categories } = get();
    if (!term.trim()) return categories;

    const lowerTerm = term.toLowerCase();
    return categories.filter(
      (category) =>
        category.title.toLowerCase().includes(lowerTerm) ||
        category.description.toLowerCase().includes(lowerTerm),
    );
  },

  clearError: () => set({ error: null }),
}));
