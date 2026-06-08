import io
import os
import zipfile

from django.http import FileResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.manager_serializers import TeacherDetailSerializer, TeacherListSerializer
from profiles.models import (
    Certificate,
    Diploma,
    StudentAchievement,
    TeacherAchievement,
    TeacherProfile,
)
from profiles.permissions import IsManagerOrAdmin
from users.choices import UserRole


def check_manager_school_access(user, profile):
    if user.role == UserRole.MANAGER and profile.user.school_id != user.school_id:
        raise PermissionDenied(
            'You do not have permission to view teachers from another school.',
        )


class ManagerTeacherListView(generics.ListAPIView):
    serializer_class = TeacherListSerializer
    permission_classes = (IsAuthenticated, IsManagerOrAdmin)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('first_name', 'last_name', 'middle_name', 'email')

    def get_queryset(self):
        user = self.request.user
        queryset = TeacherProfile.objects.select_related('user', 'user__school').filter(
            user__role=UserRole.TEACHER,
        )
        if user.role == UserRole.ADMIN:
            return queryset
        return queryset.filter(user__school=user.school)


class ManagerTeacherDetailView(generics.RetrieveAPIView):
    serializer_class = TeacherDetailSerializer
    permission_classes = (IsAuthenticated, IsManagerOrAdmin)

    def get_queryset(self):
        return TeacherProfile.objects.select_related('user', 'user__school').prefetch_related(
            'diplomas',
            'certificates',
            'qualifications',
            'teacher_achievements',
            'student_achievements',
        )

    def get_object(self):
        profile = get_object_or_404(self.get_queryset(), pk=self.kwargs['pk'])
        check_manager_school_access(self.request.user, profile)
        return profile


class TeacherFileDownloadView(APIView):
    permission_classes = (IsAuthenticated, IsManagerOrAdmin)

    MODEL_MAP = {
        'diploma': Diploma,
        'certificate': Certificate,
        'teacher_achievement': TeacherAchievement,
        'student_achievement': StudentAchievement,
    }

    def get(self, request, pk):
        profile = get_object_or_404(
            TeacherProfile.objects.select_related('user'),
            pk=pk,
        )
        check_manager_school_access(request.user, profile)

        file_type = request.query_params.get('type')
        file_id = request.query_params.get('id')

        model = self.MODEL_MAP.get(file_type)
        if not model:
            return Response({'error': 'Invalid type'}, status=status.HTTP_400_BAD_REQUEST)

        if not file_id:
            return Response({'error': 'id is required'}, status=status.HTTP_400_BAD_REQUEST)

        obj = get_object_or_404(model, pk=file_id, profile=profile)
        if not obj.file:
            return Response({'error': 'No file attached'}, status=status.HTTP_404_NOT_FOUND)

        try:
            if not obj.file.storage.exists(obj.file.name):
                return Response({'error': 'File not found on server'}, status=status.HTTP_404_NOT_FOUND)

            response = FileResponse(
                obj.file.open('rb'),
                as_attachment=True,
                filename=os.path.basename(obj.file.name),
            )
            return response
        except Exception as e:
            return Response({'error': f'Error accessing file: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)


class SchoolZipExportView(APIView):
    permission_classes = (IsAuthenticated, IsManagerOrAdmin)

    def get_queryset(self, request):
        if request.user.role == UserRole.MANAGER:
            return TeacherProfile.objects.filter(
                user__school=request.user.school,
            ).prefetch_related(
                'diplomas',
                'certificates',
                'teacher_achievements',
                'student_achievements',
            )
        school_id = request.query_params.get('school_id')
        if not school_id:
            return None
        return TeacherProfile.objects.filter(
            user__school_id=school_id,
        ).prefetch_related(
            'diplomas',
            'certificates',
            'teacher_achievements',
            'student_achievements',
        )

    def get(self, request):
        profiles = self.get_queryset(request)
        if profiles is None:
            return Response({'error': 'school_id required for admin'}, status=status.HTTP_400_BAD_REQUEST)

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for profile in profiles:
                folder = f'{profile.last_name}_{profile.first_name}'
                file_groups = (
                    ('diplomas', profile.diplomas.all()),
                    ('certificates', profile.certificates.all()),
                    ('teacher_achievements', profile.teacher_achievements.all()),
                    ('student_achievements', profile.student_achievements.all()),
                )
                for subfolder, items in file_groups:
                    for item in items:
                        if item.file:
                            arcname = f'{folder}/{subfolder}/{os.path.basename(item.file.name)}'
                            try:
                                with item.file.open('rb') as file_handle:
                                    zf.writestr(arcname, file_handle.read())
                            except OSError:
                                pass

        buffer.seek(0)
        response = StreamingHttpResponse(buffer, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="school_export.zip"'
        return response
