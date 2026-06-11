from django.db.models import Count, Q
from rest_framework import serializers

from schools.models import School
from users.choices import UserRole


class SchoolSerializer(serializers.ModelSerializer):
    # ─── FIX: N+1 запросы ─────────────────────────────────────────────────────
    # Было: SerializerMethodField с .filter().count() → на каждую школу
    # выполнялось 2 дополнительных COUNT-запроса к БД.
    # При 50 школах = 100 лишних запросов за один запрос API!
    #
    # Стало: IntegerField читает из аннотации (annotate в queryset во view).
    # Все подсчёты делаются одним запросом через JOIN на уровне БД.
    teacher_count = serializers.IntegerField(read_only=True)
    manager_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = School
        fields = ('id', 'name', 'city', 'is_active', 'teacher_count', 'manager_count')
