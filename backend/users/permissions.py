from rest_framework.permissions import BasePermission

from users.choices import UserRole


class IsAdminRole(BasePermission):
    """Only users with role ADMIN may access this view."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsAdmin(IsAdminRole):
    """Backward-compatible alias."""


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.MANAGER
        )


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.TEACHER
        )


class IsManagerOfSameSchool(BasePermission):
    """Менеджер имеет доступ только к объектам своей школы."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.MANAGER
            and request.user.school_id is not None
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN:
            return True

        if request.user.role != UserRole.MANAGER:
            return False

        obj_school_id = self._get_school_id(obj)
        return obj_school_id is not None and obj_school_id == request.user.school_id

    @staticmethod
    def _get_school_id(obj):
        if hasattr(obj, 'school_id'):
            return obj.school_id
        if hasattr(obj, 'school'):
            school = obj.school
            return school.id if school else None
        if hasattr(obj, 'user'):
            user = obj.user
            return user.school_id if user else None
        return None
