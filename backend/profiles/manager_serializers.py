from rest_framework import serializers

from profiles.achievement_serializers import (
    StudentAchievementSerializer,
    TeacherAchievementSerializer,
)
from profiles.models import TeacherProfile
from profiles.serializers import (
    CertificateSerializer,
    DiplomaSerializer,
    QualificationCategorySerializer,
)


class TeacherListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    school_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = ('id', 'full_name', 'experience_years', 'email', 'phone', 'school_name')

    def get_full_name(self, obj):
        return f'{obj.last_name} {obj.first_name} {obj.middle_name}'.strip()

    def get_school_name(self, obj):
        return obj.user.school.name if obj.user.school else None


class TeacherDetailSerializer(serializers.ModelSerializer):
    diplomas = DiplomaSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)
    qualifications = QualificationCategorySerializer(many=True, read_only=True)
    teacher_achievements = TeacherAchievementSerializer(many=True, read_only=True)
    student_achievements = StudentAchievementSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()
    school_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = (
            'id',
            'full_name',
            'school_name',
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

    def get_full_name(self, obj):
        return f'{obj.last_name} {obj.first_name} {obj.middle_name}'.strip()

    def get_school_name(self, obj):
        return obj.user.school.name if obj.user.school else None
