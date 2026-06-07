from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import (
    Certificate,
    Diploma,
    QualificationCategory,
    TeacherProfile,
)
from profiles.permissions import (
    IsManagerOfSchool,
    IsTeacherOnly,
    IsTeacherOrReadOnlyManager,
)
from profiles.serializers import (
    CertificateSerializer,
    DiplomaSerializer,
    QualificationCategorySerializer,
    TeacherProfileListSerializer,
    TeacherProfileSerializer,
    TeacherProfileUpdateSerializer,
)
from users.choices import UserRole


def get_teacher_profile(user):
    try:
        return user.profile
    except TeacherProfile.DoesNotExist:
        return None


def get_or_create_teacher_profile(user):
    profile, _ = TeacherProfile.objects.get_or_create(
        user=user,
        defaults={
            'first_name': '',
            'last_name': '',
        },
    )
    return profile


class ProfileMeView(APIView):
    permission_classes = (IsTeacherOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get(self, request):
        profile = get_or_create_teacher_profile(request.user)
        serializer = TeacherProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile = get_or_create_teacher_profile(request.user)
        serializer = TeacherProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            TeacherProfileSerializer(profile, context={'request': request}).data,
        )


class ProfileListView(ListAPIView):
    serializer_class = TeacherProfileListSerializer
    permission_classes = (IsManagerOfSchool,)

    def get_queryset(self):
        queryset = TeacherProfile.objects.select_related('user', 'user__school')
        if self.request.user.role == UserRole.MANAGER:
            return queryset.filter(user__school=self.request.user.school)
        return queryset


class ProfileDetailView(RetrieveUpdateAPIView):
    serializer_class = TeacherProfileSerializer
    permission_classes = (IsTeacherOrReadOnlyManager,)
    queryset = TeacherProfile.objects.prefetch_related(
        'diplomas',
        'certificates',
        'qualifications',
        'teacher_achievements',
        'student_achievements',
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == UserRole.MANAGER:
            return queryset.filter(user__school=self.request.user.school)
        return queryset

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return TeacherProfileUpdateSerializer
        return TeacherProfileSerializer

    def update(self, request, *args, **kwargs):
        if request.user.role != UserRole.ADMIN:
            raise PermissionDenied('Только администратор может редактировать чужой профиль.')
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            TeacherProfileSerializer(instance, context={'request': request}).data,
        )


class ProfileNestedMixin:
    model = None
    serializer_class = None
    related_name = None

    def get_profile(self, request):
        profile = get_teacher_profile(request.user)
        if profile is None:
            raise NotFound('Профиль не найден. Сначала заполните личные данные.')
        return profile


class DiplomaListCreateView(ProfileNestedMixin, APIView):
    permission_classes = (IsTeacherOnly,)
    parser_classes = (MultiPartParser, FormParser)
    model = Diploma
    serializer_class = DiplomaSerializer

    def get(self, request):
        profile = self.get_profile(request)
        serializer = DiplomaSerializer(
            profile.diplomas.all(),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)

    def post(self, request):
        profile = self.get_profile(request)
        serializer = DiplomaSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(profile=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DiplomaDestroyView(ProfileNestedMixin, APIView):
    permission_classes = (IsTeacherOnly,)

    def delete(self, request, pk):
        profile = self.get_profile(request)
        diploma = get_object_or_404(Diploma, pk=pk, profile=profile)
        diploma.file.delete(save=False)
        diploma.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CertificateListCreateView(ProfileNestedMixin, APIView):
    permission_classes = (IsTeacherOnly,)
    parser_classes = (MultiPartParser, FormParser)
    model = Certificate
    serializer_class = CertificateSerializer

    def get(self, request):
        profile = self.get_profile(request)
        serializer = CertificateSerializer(
            profile.certificates.all(),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)

    def post(self, request):
        profile = self.get_profile(request)
        serializer = CertificateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(profile=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CertificateDestroyView(ProfileNestedMixin, APIView):
    permission_classes = (IsTeacherOnly,)

    def delete(self, request, pk):
        profile = self.get_profile(request)
        certificate = get_object_or_404(Certificate, pk=pk, profile=profile)
        certificate.file.delete(save=False)
        certificate.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QualificationListCreateView(ProfileNestedMixin, APIView):
    permission_classes = (IsTeacherOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    model = QualificationCategory
    serializer_class = QualificationCategorySerializer

    def get(self, request):
        profile = self.get_profile(request)
        serializer = QualificationCategorySerializer(
            profile.qualifications.all(),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)

    def post(self, request):
        profile = self.get_profile(request)
        serializer = QualificationCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(profile=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


