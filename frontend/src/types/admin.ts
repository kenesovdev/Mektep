import type { UserRole } from './auth';

export interface AdminUser {
  id: number;
  email: string;
  role: UserRole;
  school_id: number | null;
  school_name: string | null;
}

export interface AdminSchool {
  id: number;
  name: string;
  city: string;
  is_active: boolean;
  teacher_count: number;
  manager_count: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type CreateUserForm = {
  email: string;
  password: string;
  role: UserRole;
  school_id: number | null;
};

export type UpdateUserForm = {
  role: UserRole;
  school_id: number | null;
};

export type SchoolForm = {
  name: string;
  city: string;
};
