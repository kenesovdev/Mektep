from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from schools.models import School
from schools.serializers import SchoolSerializer
from users.permissions import IsAdminRole


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all().order_by('name')
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
