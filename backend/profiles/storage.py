from django.conf import settings
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from supabase import create_client

# ─── Singleton клиент ─────────────────────────────────────────────────────────
_supabase_client = None


def _get_client():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,
        )
    return _supabase_client


@deconstructible
class SupabaseStorage(Storage):
    def __init__(self):
        self.bucket = settings.SUPABASE_BUCKET  # 'media'

    @property
    def client(self):
        return _get_client()

    def _save(self, name, content):
        # ─── FIX: убираем 'media/' в начале если upload_to его содержал ────────
        # Было: name = 'media/certificates/file.jpg'
        #        → загружалось в бакет по пути 'media/certificates/file.jpg'
        #        → URL = .../public/media/media/certificates/file.jpg  💥
        # Стало: clean_name = 'certificates/file.jpg'
        #        → загружается в бакет по пути 'certificates/file.jpg'
        #        → URL = .../public/media/certificates/file.jpg  ✅
        clean_name = name.removeprefix(f'{self.bucket}/')
        content.seek(0)
        data = content.read()
        self.client.storage.from_(self.bucket).upload(
            clean_name,
            data,
            {
                'content-type': 'application/octet-stream',
                'x-upsert': 'true',
            },
        )
        # Возвращаем чистое имя — Django сохранит его в БД без лишнего 'media/'
        return clean_name

    def url(self, name):
        # ─── FIX: убираем 'media/' в начале если в БД хранится старый путь ─────
        # Старые записи в БД: name = 'media/certificates/file.jpg'
        # Новые записи в БД:  name = 'certificates/file.jpg'
        # В обоих случаях URL будет правильным.
        clean_name = name.removeprefix(f'{self.bucket}/')
        return (
            f'{settings.SUPABASE_URL}/storage/v1/object/public'
            f'/{self.bucket}/{clean_name}'
        )

    def exists(self, name):
        return False

    def delete(self, name):
        try:
            clean_name = name.removeprefix(f'{self.bucket}/')
            self.client.storage.from_(self.bucket).remove([clean_name])
        except Exception:
            pass


PublicRawStorage = SupabaseStorage
PublicMediaStorage = SupabaseStorage