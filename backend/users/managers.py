from django.contrib.auth.models import BaseUserManager

from users.choices import UserRole


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, role=UserRole.TEACHER, school=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        if not role:
            raise ValueError('Роль обязательна')

        email = self.normalize_email(email)
        user = self.model(email=email, role=role, school=school, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('role') != UserRole.ADMIN:
            raise ValueError('Суперпользователь должен иметь роль ADMIN')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True')

        return self.create_user(email, password, **extra_fields)
