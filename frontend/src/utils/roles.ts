import type { UserRole } from '@/types/auth';

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TEACHER: 'TEACHER',
} as const satisfies Record<string, UserRole>;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  TEACHER: 'Учитель',
};

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  ADMIN: '/admin/users',
  MANAGER: '/manager/dashboard',
  TEACHER: '/teacher/dashboard',
};

export function getDashboardPath(role: UserRole): string {
  return ROLE_DASHBOARD_PATHS[role] ?? '/login';
}
