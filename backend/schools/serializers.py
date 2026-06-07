from rest_framework import serializers

from schools.models import School
from users.choices import UserRole


class SchoolSerializer(serializers.ModelSerializer):
    teacher_count = serializers.SerializerMethodField()
    manager_count = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = ('id', 'name', 'city', 'is_active', 'teacher_count', 'manager_count')

    def get_teacher_count(self, obj):
        return obj.users.filter(role=UserRole.TEACHER).count()

    def get_manager_count(self, obj):
        return obj.users.filter(role=UserRole.MANAGER).count()
