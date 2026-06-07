import api from './axios';
import type { Achievement } from '@/types/achievement';

export async function fetchAchievements(apiPath: string): Promise<Achievement[]> {
  const { data } = await api.get<Achievement[]>(apiPath);
  return data;
}

export async function createAchievement(apiPath: string, formData: FormData): Promise<Achievement> {
  const { data } = await api.post<Achievement>(apiPath, formData);
  return data;
}

export async function deleteAchievement(apiPath: string, id: number): Promise<void> {
  const base = apiPath.endsWith('/') ? apiPath : `${apiPath}/`;
  await api.delete(`${base}${id}/`);
}
