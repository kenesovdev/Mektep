import cloudinary.uploader
from cloudinary_storage.storage import RawMediaCloudinaryStorage, MediaCloudinaryStorage


class PublicRawStorage(RawMediaCloudinaryStorage):
    def _save(self, name, content):
        name = self.get_available_name(name)
        content.seek(0)
        response = cloudinary.uploader.upload(
            content,
            public_id=name,
            resource_type='raw',
            access_mode='public',
            type='upload',
        )
        return response['public_id']


class PublicMediaStorage(MediaCloudinaryStorage):
    def _save(self, name, content):
        name = self.get_available_name(name)
        content.seek(0)
        response = cloudinary.uploader.upload(
            content,
            public_id=name,
            resource_type='image',
            access_mode='public',
            type='upload',
        )
        return response['public_id']
