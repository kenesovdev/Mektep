import api from './axios';
import type { TeacherProfile, TeacherProfileListItem } from '@/types/profile';

export async function fetchMyProfile(): Promise<TeacherProfile> {
  const { data } = await api.get<TeacherProfile>('/api/profile/me/');
  return data;
}

export async function updateMyProfile(
  payload: Partial<Pick<TeacherProfile, 'first_name' | 'last_name' | 'middle_name' | 'birth_date' | 'experience_years' | 'phone' | 'email'>>,
): Promise<TeacherProfile> {
  const { data } = await api.patch<TeacherProfile>('/api/profile/me/', payload);
  return data;
}

export async function fetchProfiles(): Promise<TeacherProfileListItem[]> {
  const { data } = await api.get<TeacherProfileListItem[]>('/api/profiles/');
  return data;
}

export async function fetchProfileById(id: number): Promise<TeacherProfile> {
  const { data } = await api.get<TeacherProfile>(`/api/profiles/${id}/`);
  return data;
}

export async function createDiploma(formData: FormData) {
  const { data } = await api.post('/api/profile/me/diplomas/', formData);
  return data;
}

export async function deleteDiploma(id: number): Promise<void> {
  await api.delete(`/api/profile/me/diplomas/${id}/`);
}

export async function createCertificate(formData: FormData) {
  const { data } = await api.post('/api/profile/me/certificates/', formData);
  return data;
}

export async function deleteCertificate(id: number): Promise<void> {
  await api.delete(`/api/profile/me/certificates/${id}/`);
}

export async function createQualification(payload: { category: string; awarded_date: string }) {
  const { data } = await api.post('/api/profile/me/qualifications/', payload);
  return data;
}

