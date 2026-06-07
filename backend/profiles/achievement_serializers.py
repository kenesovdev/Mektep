from rest_framework import serializers

from profiles.models import StudentAchievement, TeacherAchievement

ACHIEVEMENT_ALLOWED_CONTENT_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
}
ACHIEVEMENT_MAX_FILE_SIZE = 10 * 1024 * 1024


def validate_achievement_file(value):
    if value in (None, ''):
        return value
    if value.content_type not in ACHIEVEMENT_ALLOWED_CONTENT_TYPES:
        raise serializers.ValidationError('Только PDF, JPG или PNG файлы разрешены.')
    if value.size > ACHIEVEMENT_MAX_FILE_SIZE:
        raise serializers.ValidationError('Файл не должен превышать 10 МБ.')
    return value


class TeacherAchievementSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TeacherAchievement
        fields = ('id', 'year', 'month', 'title', 'file', 'file_url')
        extra_kwargs = {'file': {'write_only': True, 'required': False}}

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def validate_file(self, value):
        return validate_achievement_file(value)


class StudentAchievementSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentAchievement
        fields = ('id', 'year', 'month', 'title', 'file', 'file_url')
        extra_kwargs = {'file': {'write_only': True, 'required': False}}

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def validate_file(self, value):
        return validate_achievement_file(value)
