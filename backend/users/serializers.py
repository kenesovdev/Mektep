from django.contrib.auth import get_user_model
from rest_framework import serializers

from schools.models import School
from users.choices import UserRole

User = get_user_model()


class SchoolBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ('id', 'name', 'city')


class UserReadSerializer(serializers.ModelSerializer):
    school = SchoolBriefSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'school', 'is_active', 'is_staff')
        read_only_fields = fields


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        source='school',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ('email', 'password', 'role', 'school_id', 'is_active', 'is_staff')

    def validate(self, attrs):
        role = attrs.get('role')
        school = attrs.get('school')

        if role in (UserRole.MANAGER, UserRole.TEACHER) and not school:
            raise serializers.ValidationError(
                {'school_id': 'Школа обязательна для менеджера и учителя.'}
            )

        if role == UserRole.ADMIN and school:
            raise serializers.ValidationError(
                {'school_id': 'Администратор не привязывается к школе.'}
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
