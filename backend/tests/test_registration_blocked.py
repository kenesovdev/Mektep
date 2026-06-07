from django.test import TestCase
from django.urls import Resolver404, resolve
from rest_framework import status
from rest_framework.test import APIClient

from schools.models import School
from users.choices import UserRole
from users.models import User


class RegistrationBlockedTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.school = School.objects.create(name='Test School', city='Almaty')
        self.teacher = User.objects.create_user(
            email='teacher@test.kz',
            password='pass12345',
            role=UserRole.TEACHER,
            school=self.school,
        )
        self.manager = User.objects.create_user(
            email='manager@test.kz',
            password='pass12345',
            role=UserRole.MANAGER,
            school=self.school,
        )
        self.admin = User.objects.create_superuser(
            email='admin@test.kz',
            password='pass12345',
        )

    def test_no_public_register_endpoint(self):
        for path in ('/api/auth/register/', '/api/register/', '/api/signup/'):
            with self.assertRaises(Resolver404, msg=f'Registration endpoint {path} must not exist'):
                resolve(path)

    def test_legacy_users_endpoint_removed(self):
        with self.assertRaises(Resolver404):
            resolve('/api/users/')

    def test_teacher_cannot_create_users(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(
            '/api/admin/users/',
            {
                'email': 'new@test.kz',
                'password': 'pass12345',
                'role': UserRole.TEACHER,
                'school_id': self.school.id,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_cannot_create_users(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(
            '/api/admin/users/',
            {
                'email': 'new@test.kz',
                'password': 'pass12345',
                'role': UserRole.TEACHER,
                'school_id': self.school.id,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_users(self):
        response = self.client.post(
            '/api/admin/users/',
            {
                'email': 'new@test.kz',
                'password': 'pass12345',
                'role': UserRole.TEACHER,
                'school_id': self.school.id,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_user(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            '/api/admin/users/',
            {
                'email': 'new_teacher@test.kz',
                'password': 'securepass1',
                'role': UserRole.TEACHER,
                'school_id': self.school.id,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_cannot_create_user_with_invalid_role(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            '/api/admin/users/',
            {
                'email': 'bad@test.kz',
                'password': 'pass12345',
                'role': 'superuser',
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_teacher_without_school_rejected(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            '/api/admin/users/',
            {
                'email': 'noschool@test.kz',
                'password': 'pass12345',
                'role': UserRole.TEACHER,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
