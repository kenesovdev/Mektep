export interface Diploma {
  id: number;
  year: number;
  month: number;
  institution: string;
  file: string;
}

export interface Certificate {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  file: string;
}

export interface Qualification {
  id: number;
  category: string;
  awarded_date: string;
}

import type { Achievement } from './achievement';

export type TeacherAchievement = Achievement;
export type StudentAchievement = Achievement;

export interface TeacherProfile {
  id: number;
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
  teacher_achievements: TeacherAchievement[];
  student_achievements: StudentAchievement[];
}

export interface TeacherProfileListItem {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  user_email: string;
  school_name: string;
  experience_years: number;
}
