from cloudinary_storage.storage import (
    MediaCloudinaryStorage,
    RawMediaCloudinaryStorage,
)


class PublicRawStorage(RawMediaCloudinaryStorage):
    """Для документов (PDF, DOC) — явно устанавливает публичный доступ."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extra_options = {'access_mode': 'public'}


class PublicMediaStorage(MediaCloudinaryStorage):
    """Для изображений — явно устанавливает публичный доступ."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extra_options = {'access_mode': 'public'}
