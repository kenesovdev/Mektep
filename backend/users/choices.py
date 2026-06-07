from django.db import models


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Администратор'
    MANAGER = 'MANAGER', 'Менеджер'
    TEACHER = 'TEACHER', 'Учитель'
