from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from .storage import PublicRawStorage


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, default='')
    birth_date = models.DateField(null=True, blank=True)
    experience_years = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(40)],
    )
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')

    class Meta:
        verbose_name = 'Профиль учителя'
        verbose_name_plural = 'Профили учителей'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.last_name} {self.first_name}'

    @property
    def full_name(self):
        parts = [self.last_name, self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        return ' '.join(parts)


class Diploma(models.Model):
    profile = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name='diplomas',
    )
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
    )
    institution = models.CharField(max_length=255)
    file = models.FileField(upload_to='diplomas/', storage=PublicRawStorage())

    class Meta:
        verbose_name = 'Диплом'
        verbose_name_plural = 'Дипломы'
        ordering = ['-year', '-month']

    def __str__(self):
        return f'{self.institution} ({self.year})'


class Certificate(models.Model):
    profile = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    file = models.FileField(upload_to='certificates/', storage=PublicRawStorage())

    class Meta:
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'
        ordering = ['-start_date']

    def __str__(self):
        return self.title


class QualificationCategory(models.Model):
    profile = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name='qualifications',
    )
    category = models.CharField(max_length=100)
    awarded_date = models.DateField()

    class Meta:
        verbose_name = 'Квалификационная категория'
        verbose_name_plural = 'Квалификационные категории'
        ordering = ['-awarded_date']

    def __str__(self):
        return self.category


class TeacherAchievement(models.Model):
    profile = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name='teacher_achievements',
    )
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='teacher_achievements/', blank=True, storage=PublicRawStorage())

    class Meta:
        verbose_name = 'Достижение учителя'
        verbose_name_plural = 'Достижения учителя'
        ordering = ['-year', '-month']

    def __str__(self):
        return self.title


class StudentAchievement(models.Model):
    profile = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name='student_achievements',
    )
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='student_achievements/', blank=True, storage=PublicRawStorage())

    class Meta:
        verbose_name = 'Достижение ученика'
        verbose_name_plural = 'Достижения учеников'
        ordering = ['-year', '-month']

    def __str__(self):
        return self.title
