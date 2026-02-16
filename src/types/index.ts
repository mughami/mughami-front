export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  BLOCKED = 'BLOCKED',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

// Category types based on swagger documentation
export interface SubCategoryResponse {
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  createdAt: string;
}

export interface SubCategoryRequest {
  subCategoryName: string;
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  subCategoryResponseList: SubCategoryResponse[];
}

export interface CategoryRequest {
  categoryName: string;
  subCategoryRequestList: SubCategoryRequest[];
}

// Tournament types
export enum TournamentStatus {
  TO_START = 'TO_START',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
}

export interface TournamentQuiz {
  quizId: number;
  quizName: string;
  categoryId: number;
  subCategoryId: number;
  quizStatus: 'VERIFIED' | 'PENDING';
  hasPhoto: boolean;
}

export interface Tournament {
  id: number;
  description: string;
  quiz: TournamentQuiz;
  authorId: number;
  authorUsername: string;
  startDate: string;
  status: TournamentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: Tournament[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateTournamentRequest {
  description: string;
  quizId: number;
  startDate: string;
  status: TournamentStatus;
}

export interface UpdateTournamentRequest {
  description: string;
  quizId: number;
  startDate: string;
  status: TournamentStatus;
}
