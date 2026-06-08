import cloudinary.uploader
from cloudinary_storage.storage import RawMediaCloudinaryStorage, MediaCloudinaryStorage


class PublicRawStorage(RawMediaCloudinaryStorage):
    def _save(self, name, content):
        # Используем _get_target_name чтобы сохранить правильный префикс пути
        if hasattr(self, '_get_target_name'):
            target_name = self._get_target_name(name)
        else:
            target_name = name

        content.seek(0)
        response = cloudinary.uploader.upload(
            content,
            public_id=target_name,
            resource_type='raw',
            access_mode='public',
            type='upload',
        )
        return response['public_id']


class PublicMediaStorage(MediaCloudinaryStorage):
    def _save(self, name, content):
        if hasattr(self, '_get_target_name'):
            target_name = self._get_target_name(name)
        else:
            target_name = name

        content.seek(0)
        response = cloudinary.uploader.upload(
            content,
            public_id=target_name,
            resource_type='image',
            access_mode='public',
            type='upload',
        )
        return response['public_id']
