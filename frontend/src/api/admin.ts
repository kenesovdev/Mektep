import api from './axios';
import type {
  AdminSchool,
  AdminUser,
  PaginatedResponse,
  SchoolForm,
} from '@/types/admin';
import type { UserRole } from '@/types/auth';

function unwrapList<T>(data: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}

export async function fetchAdminUsers(params?: {
  search?: string;
  role?: UserRole | '';
}): Promise<AdminUser[]> {
  const { data } = await api.get<PaginatedResponse<AdminUser> | AdminUser[]>(
    '/api/admin/users/',
    {
      params: {
        search: params?.search || undefined,
        role: params?.role || undefined,
      },
    },
  );
  return unwrapList(data);
}

export async function createAdminUser(payload: {
  email: string;
  password: string;
  role: UserRole;
  school_id: number | null;
}): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>('/api/admin/users/', {
    ...payload,
    school_id: payload.school_id ?? undefined,
  });
  return data;
}

export async function updateAdminUser(
  id: number,
  payload: { role: UserRole; school_id: number | null },
): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/admin/users/${id}/`, {
    ...payload,
    school_id: payload.school_id ?? null,
  });
  return data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await api.delete(`/api/admin/users/${id}/`);
}

export async function resetAdminUserPassword(id: number, newPassword: string): Promise<void> {
  await api.post(`/api/admin/users/${id}/reset-password/`, { new_password: newPassword });
}

export async function fetchAdminSchools(activeOnly = false): Promise<AdminSchool[]> {
  const { data } = await api.get<PaginatedResponse<AdminSchool> | AdminSchool[]>(
    '/api/admin/schools/',
  );
  const schools = unwrapList(data);
  return activeOnly ? schools.filter((school) => school.is_active) : schools;
}

export async function createAdminSchool(payload: SchoolForm): Promise<AdminSchool> {
  const { data } = await api.post<AdminSchool>('/api/admin/schools/', payload);
  return data;
}

export async function updateAdminSchool(id: number, payload: SchoolForm): Promise<AdminSchool> {
  const { data } = await api.put<AdminSchool>(`/api/admin/schools/${id}/`, payload);
  return data;
}

export async function deactivateSchool(id: number): Promise<void> {
  await api.patch(`/api/admin/schools/${id}/deactivate/`);
}

export async function activateSchool(id: number): Promise<void> {
  await api.patch(`/api/admin/schools/${id}/activate/`);
}
