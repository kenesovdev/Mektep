from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser

from profiles.achievement_serializers import (
    StudentAchievementSerializer,
    TeacherAchievementSerializer,
)
from profiles.models import StudentAchievement, TeacherAchievement
from profiles.views import get_or_create_teacher_profile
from users.choices import UserRole


class TeacherAchievementViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherAchievementSerializer
    parser_classes = (MultiPartParser, FormParser)
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return TeacherAchievement.objects.select_related('profile', 'profile__user')
        if user.role == UserRole.MANAGER:
            return TeacherAchievement.objects.filter(
                profile__user__school=user.school,
            ).select_related('profile', 'profile__user')
        return TeacherAchievement.objects.filter(
            profile__user=user,
        ).select_related('profile', 'profile__user')

    def create(self, request, *args, **kwargs):
        if request.user.role != UserRole.TEACHER:
            raise PermissionDenied('Только учитель может добавлять достижения.')
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        profile = get_or_create_teacher_profile(self.request.user)
        serializer.save(profile=profile)

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        if request.user.role == UserRole.MANAGER:
            raise PermissionDenied('Менеджер не может удалять достижения.')
        if request.user.role == UserRole.TEACHER and obj.profile.user != request.user:
            raise PermissionDenied('Можно удалять только свои достижения.')
        return super().destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()


class StudentAchievementViewSet(viewsets.ModelViewSet):
    serializer_class = StudentAchievementSerializer
    parser_classes = (MultiPartParser, FormParser)
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return StudentAchievement.objects.select_related('profile', 'profile__user')
        if user.role == UserRole.MANAGER:
            return StudentAchievement.objects.filter(
                profile__user__school=user.school,
            ).select_related('profile', 'profile__user')
        return StudentAchievement.objects.filter(
            profile__user=user,
        ).select_related('profile', 'profile__user')

    def create(self, request, *args, **kwargs):
        if request.user.role != UserRole.TEACHER:
            raise PermissionDenied('Только учитель может добавлять достижения.')
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        profile = get_or_create_teacher_profile(self.request.user)
        serializer.save(profile=profile)

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        if request.user.role == UserRole.MANAGER:
            raise PermissionDenied('Менеджер не может удалять достижения.')
        if request.user.role == UserRole.TEACHER and obj.profile.user != request.user:
            raise PermissionDenied('Можно удалять только свои достижения.')
        return super().destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()
