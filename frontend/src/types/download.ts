import api from '@/api/axios';

/**
 * Скачивает файл через Django API (для проверки прав доступа),
 * затем загружает сам файл напрямую с Supabase без auth-заголовков.
 *
 * ПРОБЛЕМА которую это исправляет:
 * Раньше: api.get(url) → axios добавлял Authorization: Bearer → Django делал
 * redirect на Supabase → axios следовал редиректу с тем же JWT → Supabase
 * не знал этот токен → 400.
 *
 * Теперь:
 * 1. api.get(url) — авторизованный запрос к Django (проверка прав)
 * 2. Django возвращает JSON { url: "https://supabase.co/..." }
 * 3. plain fetch(supabaseUrl) — без auth-заголовков, Supabase публичный бакет
 * 4. Сохраняем как файл
 */
export async function downloadBlob(djangoUrl: string, filename: string): Promise<void> {
  // Шаг 1: получаем URL файла от Django (с проверкой прав через JWT)
  const { data } = await api.get<{ url: string }>(djangoUrl);

  // Шаг 2: скачиваем файл напрямую с Supabase (plain fetch, без auth-заголовков)
  const fileResponse = await fetch(data.url);
  if (!fileResponse.ok) {
    throw new Error(`Ошибка загрузки файла: ${fileResponse.status}`);
  }

  // Шаг 3: сохраняем файл
  const blob = await fileResponse.blob();
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
}
