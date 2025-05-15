import { create } from 'zustand';
import { categoryService, type Category } from '../services';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  searchCategories: (term: string) => Category[];
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const categories = await categoryService.getCategories();
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
