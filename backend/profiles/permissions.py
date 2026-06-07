from rest_framework.permissions import BasePermission, SAFE_METHODS

from users.choices import UserRole


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


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


class IsManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (UserRole.MANAGER, UserRole.ADMIN)
        )


class IsManagerOfSchool(BasePermission):
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


class IsTeacherOwner(BasePermission):
    """Учитель может работать только со своим профилем."""

    def has_object_permission(self, request, view, obj):
        profile = obj if hasattr(obj, 'user') else getattr(obj, 'profile', None)
        if profile is None:
            return False
        return profile.user == request.user


class IsTeacherOrReadOnlyManager(BasePermission):
    """Учитель редактирует свой профиль; менеджер/админ — только чтение."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return request.user.role in (UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN)
        return request.user.role == UserRole.TEACHER

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN:
            return True
        if request.user.role == UserRole.MANAGER:
            if request.method not in SAFE_METHODS:
                return False
            return obj.user.school_id == request.user.school_id
        if request.user.role == UserRole.TEACHER:
            if request.method not in SAFE_METHODS:
                return obj.user == request.user
            return obj.user == request.user
        return False


class IsTeacherOnly(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.TEACHER
        )
