import api from '@/api/axios';

export async function downloadBlob(url: string, filename: string): Promise<void> {
  const response = await api.get<Blob>(url, { responseType: 'blob' });
  const href = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}
