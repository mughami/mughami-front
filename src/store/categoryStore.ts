import { create } from 'zustand';
import { categoryService, type Category } from '../services';
import { useAuthStore } from './authStore';
import type { CategoryResponse, CategoryRequest, SubCategoryResponse } from '../types';

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
  updateAdminCategory: (categoryId: number, data: CategoryRequest) => Promise<void>;
  deleteAdminCategory: (categoryId: number) => Promise<void>;
  fetchAdminSubcategories: (categoryId: number) => Promise<SubCategoryResponse[]>;
  createAdminSubcategory: (
    categoryId: number,
    data: { subCategoryName: string },
  ) => Promise<SubCategoryResponse>;
  updateAdminSubcategory: (
    subCategoryId: number,
    data: { subCategoryName: string },
  ) => Promise<SubCategoryResponse>;
  deleteAdminSubcategory: (subCategoryId: number) => Promise<void>;
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

  updateAdminCategory: async (categoryId: number, data: CategoryRequest) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await categoryService.admin.updateCategory(categoryId, data);
      const current = get().adminCategories;
      const next = current.map((c) => (c.categoryId === categoryId ? updated : c));
      set({ adminCategories: next, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა კატეგორიის განახლებისას',
      });
      throw error;
    }
  },

  deleteAdminCategory: async (categoryId: number) => {
    try {
      set({ isLoading: true, error: null });
      await categoryService.admin.deleteCategory(categoryId);
      const current = get().adminCategories;
      set({
        adminCategories: current.filter((c) => c.categoryId !== categoryId),
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა კატეგორიის წაშლისას',
      });
      throw error;
    }
  },

  fetchAdminSubcategories: async (categoryId: number) => {
    try {
      set({ isLoading: true, error: null });
      const list = await categoryService.admin.getSubcategories(categoryId);
      // also update category in store for consistency if present
      const currentCategories = get().adminCategories;
      const idx = currentCategories.findIndex((c) => c.categoryId === categoryId);
      if (idx !== -1) {
        const category = await categoryService.admin.getCategory(categoryId);
        const next = [...currentCategories];
        next[idx] = category;
        set({ adminCategories: next });
      }
      set({ isLoading: false });
      return list as SubCategoryResponse[];
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ქვეკატეგორიების ჩატვირთვისას',
      });
      throw error;
    }
  },

  createAdminSubcategory: async (categoryId: number, data: { subCategoryName: string }) => {
    try {
      set({ isLoading: true, error: null });
      const created = await categoryService.admin.createSubcategory(categoryId, data);
      // refresh the category entry
      const category = await categoryService.admin.getCategory(categoryId);
      const current = get().adminCategories;
      const next = current.map((c) => (c.categoryId === categoryId ? category : c));
      set({ adminCategories: next, isLoading: false });
      return created as SubCategoryResponse;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ქვეკატეგორიის შექმნისას',
      });
      throw error;
    }
  },

  updateAdminSubcategory: async (subCategoryId: number, data: { subCategoryName: string }) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await categoryService.admin.updateSubcategory(subCategoryId, data);
      // find parent category and refresh it
      const current = get().adminCategories;
      const parent = current.find((c) =>
        c.subCategoryResponseList.some((s) => s.subCategoryId === subCategoryId),
      );
      if (parent) {
        const refreshed = await categoryService.admin.getCategory(parent.categoryId);
        const next = current.map((c) => (c.categoryId === parent.categoryId ? refreshed : c));
        set({ adminCategories: next });
      }
      set({ isLoading: false });
      return updated as SubCategoryResponse;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ქვეკატეგორიის განახლებისას',
      });
      throw error;
    }
  },

  deleteAdminSubcategory: async (subCategoryId: number) => {
    try {
      set({ isLoading: true, error: null });
      // find parent before delete
      const current = get().adminCategories;
      const parent = current.find((c) =>
        c.subCategoryResponseList.some((s) => s.subCategoryId === subCategoryId),
      );
      await categoryService.admin.deleteSubcategory(subCategoryId);
      if (parent) {
        const refreshed = await categoryService.admin.getCategory(parent.categoryId);
        const next = current.map((c) => (c.categoryId === parent.categoryId ? refreshed : c));
        set({ adminCategories: next, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა ქვეკატეგორიის წაშლისას',
      });
      throw error;
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
