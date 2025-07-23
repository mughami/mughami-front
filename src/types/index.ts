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
