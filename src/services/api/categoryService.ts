import apiClient from './client';
import type { CategoryResponse, CategoryRequest } from '../../types';

// Legacy category interface for backward compatibility
export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  quizCount: number;
  questionCount: number;
  prize: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Default category images for visual appeal
const defaultCategoryImages = [
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519500099198-fd81846b8f03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

// Convert backend CategoryResponse to frontend Category format
const convertToLegacyCategory = (categoryResponse: CategoryResponse, index: number): Category => {
  // Generate consistent random values based on category ID for demo purposes
  const seed = categoryResponse.categoryId;
  const quizCount = Math.floor((seed * 17) % 50) + 10;
  const questionCount = Math.floor((seed * 23) % 2000) + 500;
  const prize = Math.floor((seed * 31) % 500) + 100;
  const difficultyIndex = seed % 3;

  return {
    id: categoryResponse.categoryId.toString(),
    title: categoryResponse.categoryName,
    description: `ქვიზები ${categoryResponse.categoryName} კატეგორიაში`,
    image: defaultCategoryImages[index % defaultCategoryImages.length],
    quizCount,
    questionCount,
    prize,
    difficulty: ['easy', 'medium', 'hard'][difficultyIndex] as 'easy' | 'medium' | 'hard',
  };
};

const categoryService = {
  // Public methods that use real API data
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<CategoryResponse[]>('/admin/category');
      return response.data.map((category, index) => convertToLegacyCategory(category, index));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return empty array if API fails to avoid breaking the UI
      return [];
    }
  },

  getCategoryById: async (id: string): Promise<Category> => {
    try {
      const categories = await categoryService.getCategories();
      const category = categories.find((c) => c.id === id);
      if (!category) {
        throw new Error('კატეგორია ვერ მოიძებნა');
      }
      return category;
    } catch (error) {
      console.error('Failed to fetch category by id:', error);
      throw new Error('კატეგორია ვერ მოიძებნა');
    }
  },

  // Admin methods based on swagger documentation
  admin: {
    getCategories: async (): Promise<CategoryResponse[]> => {
      const response = await apiClient.get<CategoryResponse[]>('/admin/category');
      return response.data;
    },

    createCategory: async (categoryData: CategoryRequest): Promise<CategoryResponse> => {
      const response = await apiClient.post<CategoryResponse>('/admin/category', categoryData);
      return response.data;
    },
  },
};

export default categoryService;
