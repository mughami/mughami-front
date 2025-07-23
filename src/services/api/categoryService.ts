import apiClient from './client';
import type { CategoryResponse, CategoryRequest } from '../../types';

export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  quizCount: number;
  playerCount: number;
  prize: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Dummy categories data for public use
const dummyCategories: Category[] = [
  {
    id: '1',
    title: 'სპორტი',
    description: 'კითხვები სპორტის შესახებ, ფეხბურთი, კალათბურთი და სხვა',
    image:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    quizCount: 25,
    playerCount: 1200,
    prize: 500,
    difficulty: 'medium',
  },
  {
    id: '2',
    title: 'ისტორია',
    description: 'კითხვები მსოფლიო და საქართველოს ისტორიის შესახებ',
    image:
      'https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80',
    quizCount: 30,
    playerCount: 850,
    prize: 300,
    difficulty: 'hard',
  },
  {
    id: '3',
    title: 'გეოგრაფია',
    description: 'კითხვები მსოფლიო გეოგრაფიის შესახებ',
    image:
      'https://images.unsplash.com/photo-1519500099198-fd81846b8f03?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    quizCount: 20,
    playerCount: 750,
    prize: 200,
    difficulty: 'easy',
  },
  {
    id: '4',
    title: 'ფილმები',
    description: 'კითხვები ფილმების, მსახიობების და რეჟისორების შესახებ',
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80',
    quizCount: 35,
    playerCount: 1500,
    prize: 600,
    difficulty: 'medium',
  },
  {
    id: '5',
    title: 'მუსიკა',
    description: 'კითხვები მუსიკის, მუსიკოსების და ბენდების შესახებ',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    quizCount: 28,
    playerCount: 950,
    prize: 350,
    difficulty: 'medium',
  },
  {
    id: '6',
    title: 'ლიტერატურა',
    description: 'კითხვები წიგნების, მწერლების და პოეტების შესახებ',
    image:
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    quizCount: 22,
    playerCount: 680,
    prize: 250,
    difficulty: 'hard',
  },
  {
    id: '7',
    title: 'მეცნიერება',
    description: 'კითხვები ფიზიკის, ქიმიის და ბიოლოგიის შესახებ',
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    quizCount: 40,
    playerCount: 720,
    prize: 400,
    difficulty: 'hard',
  },
  {
    id: '8',
    title: 'ტექნოლოგია',
    description: 'კითხვები ტექნოლოგიების, კომპიუტერების და ინტერნეტის შესახებ',
    image:
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1120&q=80',
    quizCount: 32,
    playerCount: 1100,
    prize: 450,
    difficulty: 'medium',
  },
];

const categoryService = {
  // Existing public methods for backward compatibility
  getCategories: async (): Promise<Category[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return dummyCategories;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const category = dummyCategories.find((c) => c.id === id);
    if (!category) {
      throw new Error('კატეგორია ვერ მოიძებნა');
    }
    return category;
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
