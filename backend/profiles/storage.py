import os
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from supabase import create_client
from django.conf import settings

@deconstructible
class SupabaseStorage(Storage):
    def __init__(self):
        self.client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        self.bucket = settings.SUPABASE_BUCKET

    def _save(self, name, content):
        content.seek(0)
        self.client.storage.from_(self.bucket).upload(
            name,
            content.read(),
            {"content-type": "application/octet-stream",
             "x-upsert": "true"}
        )
        return name

    def url(self, name):
        return (
            f"{settings.SUPABASE_URL}/storage/v1/object/public"
            f"/{self.bucket}/{name}"
        )

    def exists(self, name):
        return False

    def delete(self, name):
        self.client.storage.from_(self.bucket).remove([name])

PublicRawStorage = SupabaseStorage
PublicMediaStorage = SupabaseStorage
