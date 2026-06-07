from django.contrib.auth import get_user_model
from rest_framework import serializers

from profiles.models import TeacherProfile
from schools.models import School
from users.choices import UserRole

User = get_user_model()

VALID_ROLES = {UserRole.ADMIN, UserRole.MANAGER, UserRole.TEACHER}


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.filter(is_active=True),
        source='school',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'role', 'school_id')

    def validate_role(self, value):
        if value not in VALID_ROLES:
            raise serializers.ValidationError('Invalid role.')
        return value

    def validate(self, attrs):
        role = attrs.get('role')
        school = attrs.get('school')

        if role in (UserRole.MANAGER, UserRole.TEACHER) and not school:
            raise serializers.ValidationError(
                {'school_id': 'Для учителя и менеджера необходимо выбрать школу.'},
            )

        if role == UserRole.ADMIN and school:
            raise serializers.ValidationError(
                {'school_id': 'Администратор не привязывается к школе.'},
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if user.role == UserRole.TEACHER:
            TeacherProfile.objects.get_or_create(
                user=user,
                defaults={'first_name': '', 'last_name': ''},
            )
        return user


class AdminUserListSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True, default=None)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        source='school',
        allow_null=True,
        required=False,
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'school_id', 'school_name')
        read_only_fields = ('id', 'email', 'school_name')

    def validate(self, attrs):
        role = attrs.get('role', getattr(self.instance, 'role', None))
        school = attrs.get('school', getattr(self.instance, 'school', None))

        if role in (UserRole.MANAGER, UserRole.TEACHER) and not school:
            raise serializers.ValidationError(
                {'school_id': 'Для учителя и менеджера необходимо выбрать школу.'},
            )

        if role == UserRole.ADMIN and school:
            raise serializers.ValidationError(
                {'school_id': 'Администратор не привязывается к школе.'},
            )

        return attrs


class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8)
