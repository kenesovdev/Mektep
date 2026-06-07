import os

from rest_framework import serializers

from profiles.achievement_serializers import (
    StudentAchievementSerializer,
    TeacherAchievementSerializer,
)
from profiles.models import (
    Certificate,
    Diploma,
    QualificationCategory,
    TeacherProfile,
)

ALLOWED_FILE_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}


class AbsoluteFileField(serializers.FileField):
    def to_representation(self, value):
        if not value:
            return None
        request = self.context.get('request')
        url = value.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url


def validate_uploaded_file(file):
    if file is None:
        return file
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise serializers.ValidationError(
            'Допустимые форматы: PDF, JPG, PNG, DOC, DOCX.'
        )
    return file


class DiplomaSerializer(serializers.ModelSerializer):
    file = AbsoluteFileField()

    class Meta:
        model = Diploma
        fields = ('id', 'year', 'month', 'institution', 'file')
        read_only_fields = ('id',)

    def validate_file(self, value):
        return validate_uploaded_file(value)


class CertificateSerializer(serializers.ModelSerializer):
    file = AbsoluteFileField()

    class Meta:
        model = Certificate
        fields = ('id', 'title', 'start_date', 'end_date', 'file')
        read_only_fields = ('id',)

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {'end_date': 'Дата окончания не может быть раньше даты начала.'}
            )
        return attrs

    def validate_file(self, value):
        return validate_uploaded_file(value)


class QualificationCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QualificationCategory
        fields = ('id', 'category', 'awarded_date')
        read_only_fields = ('id',)


class TeacherProfileSerializer(serializers.ModelSerializer):
    diplomas = DiplomaSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)
    qualifications = QualificationCategorySerializer(many=True, read_only=True)
    teacher_achievements = TeacherAchievementSerializer(many=True, read_only=True)
    student_achievements = StudentAchievementSerializer(many=True, read_only=True)

    class Meta:
        model = TeacherProfile
        fields = (
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'birth_date',
            'experience_years',
            'phone',
            'email',
            'diplomas',
            'certificates',
            'qualifications',
            'teacher_achievements',
            'student_achievements',
        )
        read_only_fields = ('id',)


class TeacherProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = (
            'first_name',
            'last_name',
            'middle_name',
            'birth_date',
            'experience_years',
            'phone',
            'email',
        )


class TeacherProfileListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    school_name = serializers.CharField(source='user.school.name', read_only=True, default='')

    class Meta:
        model = TeacherProfile
        fields = (
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'user_email',
            'school_name',
            'experience_years',
        )
