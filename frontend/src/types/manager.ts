import type { Achievement } from './achievement';
import type { Certificate, Diploma, Qualification } from './profile';

export interface TeacherListItem {
  id: number;
  full_name: string;
  experience_years: number;
  email: string;
  phone: string;
  school_name: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ManagerTeacherDetail {
  id: number;
  full_name: string;
  school_name: string | null;
  first_name: string;
  last_name: string;
  middle_name: string;
  birth_date: string | null;
  experience_years: number;
  phone: string;
  email: string;
  diplomas: Diploma[];
  certificates: Certificate[];
  qualifications: Qualification[];
  teacher_achievements: Achievement[];
  student_achievements: Achievement[];
}

export type DownloadFileType =
  | 'diploma'
  | 'certificate'
  | 'teacher_achievement'
  | 'student_achievement';
