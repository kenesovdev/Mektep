from django.urls import include, path
from rest_framework.routers import DefaultRouter

from schools.viewsets import SchoolViewSet
from users.admin_viewsets import AdminUserViewSet

router = DefaultRouter()
router.register('admin/schools', SchoolViewSet, basename='admin-schools')
router.register('admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('', include(router.urls)),
]
