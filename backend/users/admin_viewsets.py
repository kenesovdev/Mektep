from django.contrib.auth import get_user_model
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.admin_serializers import (
    AdminUserCreateSerializer,
    AdminUserListSerializer,
    PasswordResetSerializer,
)
from users.permissions import IsAdminRole

User = get_user_model()


class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminRole)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('email',)
    ordering_fields = ('email', 'role')
    http_method_names = ('get', 'post', 'put', 'patch', 'delete')

    def get_queryset(self):
        queryset = User.objects.select_related('school').order_by('role', 'email')
        role = self.request.query_params.get('role')
        school_id = self.request.query_params.get('school')
        if role:
            queryset = queryset.filter(role=role)
        if school_id:
            queryset = queryset.filter(school_id=school_id)
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        return AdminUserListSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'status': 'password updated'})
