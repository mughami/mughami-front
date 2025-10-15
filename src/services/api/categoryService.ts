import apiClient from './client';
import type { CategoryResponse, CategoryRequest } from '../../types';
import quizService, { type QuizResponse } from './quizService';

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

// Map well-known categories to themed images (en + ka keywords)
const getCategoryImage = (name: string, index: number): string => {
  const n = (name || '').toLowerCase();
  const contains = (keywords: string[]) => keywords.some((k) => n.includes(k));

  // Movies / Cinema
  if (contains(['movie', 'movies', 'film', 'cinema', 'hollywood', 'ფილმ', 'კინო'])) {
    return 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }

  // Sports
  if (contains(['sport', 'sports', 'football', 'soccer', 'basketball', 'სპორტ'])) {
    return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }

  // Literature / Books
  if (contains(['literature', 'book', 'books', 'reading', 'ლიტერატურ', 'წიგნ'])) {
    return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }

  // History
  if (contains(['history', 'historic', 'ancient', 'ისტორი'])) {
    return 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }

  // Fallback to aesthetic defaults
  return defaultCategoryImages[index % defaultCategoryImages.length];
};

// Convert backend CategoryResponse to frontend Category format
const convertToLegacyCategory = (
  categoryResponse: CategoryResponse,
  index: number,
  quizCountOverride?: number,
): Category => {
  // Generate consistent random values based on category ID for demo purposes
  const seed = categoryResponse.categoryId;
  const quizCount = quizCountOverride ?? Math.floor((seed * 17) % 50) + 10;
  const questionCount = Math.floor((seed * 23) % 2000) + 500;
  const prize = Math.floor((seed * 31) % 500) + 100;
  const difficultyIndex = seed % 3;

  return {
    id: categoryResponse.categoryId.toString(),
    title: categoryResponse.categoryName,
    description: `ქვიზები ${categoryResponse.categoryName} კატეგორიაში`,
    image: getCategoryImage(categoryResponse.categoryName, index),
    quizCount,
    questionCount,
    prize,
    difficulty: ['easy', 'medium', 'hard'][difficultyIndex] as 'easy' | 'medium' | 'hard',
  };
};

const categoryService = {
  // Public methods that use real API data
  getCategories: async (useAdmin: boolean = false): Promise<Category[]> => {
    try {
      const endpoint = useAdmin ? '/admin/category' : '/app/category';
      const response = await apiClient.get<CategoryResponse[]>(endpoint);
      // Fetch real quiz counts per category in parallel (filter VERIFIED for non-admin)
      const counts: number[] = await Promise.all(
        response.data.map(async (category) => {
          try {
            if (useAdmin) {
              const res: QuizResponse = await quizService.getQuizzesByCategoryAdmin(
                category.categoryId,
                0,
                1,
              );
              return res.totalElements;
            }
            const res: QuizResponse = await quizService.getQuizzesByCategoryUser(
              category.categoryId,
              0,
              100,
            );
            // Only count VERIFIED for public website
            const verified = res.content.filter((q) => q.quizStatus === 'VERIFIED');
            return verified.length;
          } catch {
            return 0;
          }
        }),
      );

      return response.data.map((category, index) =>
        convertToLegacyCategory(category, index, counts[index]),
      );
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

    // GET /admin/category/{categoryId}
    getCategory: async (categoryId: number): Promise<CategoryResponse> => {
      const response = await apiClient.get<CategoryResponse>(`/admin/category/${categoryId}`);
      return response.data;
    },

    // PUT /admin/category/{categoryId}
    updateCategory: async (
      categoryId: number,
      categoryData: CategoryRequest,
    ): Promise<CategoryResponse> => {
      const response = await apiClient.put<CategoryResponse>(
        `/admin/category/${categoryId}`,
        categoryData,
      );
      return response.data;
    },

    // DELETE /admin/category/{categoryId}
    deleteCategory: async (categoryId: number): Promise<void> => {
      await apiClient.delete(`/admin/category/${categoryId}`);
    },

    // GET /admin/category/{categoryId}/subcategory
    getSubcategories: async (categoryId: number) => {
      const response = await apiClient.get(`/admin/category/${categoryId}/subcategory`);
      return response.data;
    },

    // POST /admin/category/{categoryId}/subcategory
    createSubcategory: async (categoryId: number, data: { subCategoryName: string }) => {
      const response = await apiClient.post(`/admin/category/${categoryId}/subcategory`, data);
      return response.data;
    },

    // PUT /admin/category/subcategory/{subCategoryId}
    updateSubcategory: async (subCategoryId: number, data: { subCategoryName: string }) => {
      const response = await apiClient.put(`/admin/category/subcategory/${subCategoryId}`, data);
      return response.data;
    },

    // DELETE /admin/category/subcategory/{subCategoryId}
    deleteSubcategory: async (subCategoryId: number): Promise<void> => {
      await apiClient.delete(`/admin/category/subcategory/${subCategoryId}`);
    },
  },
};

export default categoryService;
