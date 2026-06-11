from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from schools.models import School
from schools.serializers import SchoolSerializer
from users.choices import UserRole
from users.permissions import IsAdminRole


class SchoolViewSet(viewsets.ModelViewSet):
    # ─── FIX: N+1 → annotate ──────────────────────────────────────────────────
    # Было: queryset без аннотаций → SchoolSerializer делал 2 COUNT-запроса
    # на каждую школу через SerializerMethodField.
    #
    # Стало: один SQL-запрос с двумя COUNT через LEFT JOIN.
    # Django ORM транслирует это в:
    #   SELECT school.*, COUNT(CASE WHEN role='TEACHER' ...) AS teacher_count, ...
    # Всё за один запрос вместо 1 + 2N.
    queryset = School.objects.annotate(
        teacher_count=Count('users', filter=Q(users__role=UserRole.TEACHER)),
        manager_count=Count('users', filter=Q(users__role=UserRole.MANAGER)),
    ).order_by('name')

    serializer_class = SchoolSerializer
    permission_classes = (IsAuthenticated, IsAdminRole)
    http_method_names = ('get', 'post', 'put', 'patch')

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        school = self.get_object()
        school.is_active = False
        school.save(update_fields=['is_active'])
        return Response({'status': 'deactivated'})

    @action(detail=True, methods=['patch'], url_path='activate')
    def activate(self, request, pk=None):
        school = self.get_object()
        school.is_active = True
        school.save(update_fields=['is_active'])
        return Response({'status': 'activated'})
