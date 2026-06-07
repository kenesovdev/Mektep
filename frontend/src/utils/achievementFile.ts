const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
export const MAX_ACHIEVEMENT_FILE_SIZE = 10 * 1024 * 1024;

export function validateAchievementFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(extension)) {
    return 'Допустимые форматы: PDF, JPG, PNG.';
  }
  if (file.size > MAX_ACHIEVEMENT_FILE_SIZE) {
    return 'Файл не должен превышать 10 МБ.';
  }
  return null;
}
