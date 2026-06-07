import api from './axios';
import type {
  DownloadFileType,
  ManagerTeacherDetail,
  PaginatedResponse,
  TeacherListItem,
} from '@/types/manager';

export async function fetchManagerTeachers(
  search = '',
): Promise<TeacherListItem[]> {
  const { data } = await api.get<PaginatedResponse<TeacherListItem> | TeacherListItem[]>(
    '/api/manager/teachers/',
    { params: search ? { search } : undefined },
  );
  if (Array.isArray(data)) {
    return data;
  }
  return data.results;
}

export async function fetchManagerTeacherDetail(id: number): Promise<ManagerTeacherDetail> {
  const { data } = await api.get<ManagerTeacherDetail>(`/api/manager/teachers/${id}/`);
  return data;
}

export function getTeacherFileDownloadUrl(
  profileId: number,
  type: DownloadFileType,
  fileId: number,
): string {
  return `/api/manager/teachers/${profileId}/download/?type=${type}&id=${fileId}`;
}

export async function downloadSchoolZip(): Promise<void> {
  const response = await api.get<Blob>('/api/manager/export/zip/', { responseType: 'blob' });
  const href = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = 'school_export.zip';
  anchor.click();
  URL.revokeObjectURL(href);
}
