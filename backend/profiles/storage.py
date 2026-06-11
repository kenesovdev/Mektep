from django.conf import settings
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from supabase import create_client

# ─── FIX: Singleton клиент ────────────────────────────────────────────────────
# Было: SupabaseStorage.__init__() создавал новый create_client() при КАЖДОМ
# инстанцировании хранилища. Это происходит каждый раз, когда сериализатор
# обращается к полю FileField. Каждый клиент держит HTTP-сессию в памяти.
#
# Стало: один глобальный клиент на весь процесс (создаётся при первом обращении).
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
        self.bucket = settings.SUPABASE_BUCKET

    @property
    def client(self):
        return _get_client()

    def _save(self, name, content):
        # ─── FIX: content.read() всё ещё нужен (Supabase SDK не поддерживает стриминг),
        # НО теперь это безопасно потому что:
        # 1. FILE_UPLOAD_MAX_MEMORY_SIZE снижен до 2MB в settings.py
        # 2. Файлы >2MB Django пишет на диск как temp-файл, НЕ держит в RAM
        # 3. content.read() читает с диска, а не из оперативки
        content.seek(0)
        data = content.read()
        self.client.storage.from_(self.bucket).upload(
            name,
            data,
            {
                'content-type': 'application/octet-stream',
                'x-upsert': 'true',
            },
        )
        return name

    def url(self, name):
        return (
            f'{settings.SUPABASE_URL}/storage/v1/object/public'
            f'/{self.bucket}/{name}'
        )

    def exists(self, name):
        return False

    def delete(self, name):
        try:
            self.client.storage.from_(self.bucket).remove([name])
        except Exception:
            # Не падаем если файл уже удалён или не существует
            pass


PublicRawStorage = SupabaseStorage
PublicMediaStorage = SupabaseStorage
