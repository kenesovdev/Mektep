from django.urls import include, path
from rest_framework.routers import DefaultRouter

from profiles.manager_views import (
    ManagerTeacherDetailView,
    ManagerTeacherListView,
    SchoolZipExportView,
    TeacherFileDownloadView,
)
from profiles.views import (
    CertificateDestroyView,
    CertificateListCreateView,
    DiplomaDestroyView,
    DiplomaListCreateView,
    ProfileDetailView,
    ProfileListView,
    ProfileMeView,
    QualificationListCreateView,
)
from profiles.viewsets import StudentAchievementViewSet, TeacherAchievementViewSet

router = DefaultRouter()
router.register(
    r'profile/me/achievements/teacher',
    TeacherAchievementViewSet,
    basename='teacher-achievement',
)
router.register(
    r'profile/me/achievements/student',
    StudentAchievementViewSet,
    basename='student-achievement',
)

urlpatterns = [
    path('profile/me/', ProfileMeView.as_view(), name='profile-me'),
    path('profile/me/diplomas/', DiplomaListCreateView.as_view(), name='profile-diplomas'),
    path('profile/me/diplomas/<int:pk>/', DiplomaDestroyView.as_view(), name='profile-diploma-delete'),
    path('profile/me/certificates/', CertificateListCreateView.as_view(), name='profile-certificates'),
    path(
        'profile/me/certificates/<int:pk>/',
        CertificateDestroyView.as_view(),
        name='profile-certificate-delete',
    ),
    path(
        'profile/me/qualifications/',
        QualificationListCreateView.as_view(),
        name='profile-qualifications',
    ),
    path('profiles/', ProfileListView.as_view(), name='profile-list'),
    path('profiles/<int:pk>/', ProfileDetailView.as_view(), name='profile-detail'),
    path('manager/teachers/', ManagerTeacherListView.as_view(), name='manager-teacher-list'),
    path('manager/teachers/<int:pk>/', ManagerTeacherDetailView.as_view(), name='manager-teacher-detail'),
    path(
        'manager/teachers/<int:pk>/download/',
        TeacherFileDownloadView.as_view(),
        name='manager-teacher-download',
    ),
    path('manager/export/zip/', SchoolZipExportView.as_view(), name='manager-export-zip'),
    path('', include(router.urls)),
]
