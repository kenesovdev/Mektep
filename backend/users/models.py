from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from users.choices import UserRole
from users.managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['email']

    def __str__(self):
        return f'{self.email} ({self.get_role_display()})'

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_manager(self):
        return self.role == UserRole.MANAGER

    @property
    def is_teacher(self):
        return self.role == UserRole.TEACHER
