from django.contrib import admin

from profiles.models import (
    Certificate,
    Diploma,
    QualificationCategory,
    StudentAchievement,
    TeacherAchievement,
    TeacherProfile,
)


class DiplomaInline(admin.TabularInline):
    model = Diploma
    extra = 0


class CertificateInline(admin.TabularInline):
    model = Certificate
    extra = 0


class QualificationCategoryInline(admin.TabularInline):
    model = QualificationCategory
    extra = 0


class TeacherAchievementInline(admin.TabularInline):
    model = TeacherAchievement
    extra = 0


class StudentAchievementInline(admin.TabularInline):
    model = StudentAchievement
    extra = 0


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'last_name', 'first_name', 'middle_name', 'user', 'experience_years')
    list_filter = ('experience_years',)
    search_fields = ('last_name', 'first_name', 'middle_name', 'user__email')
    raw_id_fields = ('user',)
    ordering = ('last_name', 'first_name')
    inlines = (
        DiplomaInline,
        CertificateInline,
        QualificationCategoryInline,
        TeacherAchievementInline,
        StudentAchievementInline,
    )


@admin.register(Diploma)
class DiplomaAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'institution', 'year', 'month')
    raw_id_fields = ('profile',)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'title', 'start_date', 'end_date')
    raw_id_fields = ('profile',)


@admin.register(QualificationCategory)
class QualificationCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'category', 'awarded_date')
    raw_id_fields = ('profile',)


@admin.register(TeacherAchievement)
class TeacherAchievementAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'title', 'year', 'month')
    raw_id_fields = ('profile',)


@admin.register(StudentAchievement)
class StudentAchievementAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'title', 'year', 'month')
    raw_id_fields = ('profile',)
