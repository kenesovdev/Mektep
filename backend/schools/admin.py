from django.contrib import admin

from schools.models import School


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'city', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'city')
    ordering = ('name',)
