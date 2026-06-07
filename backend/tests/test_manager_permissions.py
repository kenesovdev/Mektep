from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from profiles.models import TeacherProfile
from schools.models import School
from users.choices import UserRole
from users.models import User


class ManagerPermissionTests(TestCase):
    def setUp(self):
        self.school_a = School.objects.create(name='School A', city='Almaty')
        self.school_b = School.objects.create(name='School B', city='Astana')

        self.manager = User.objects.create_user(
            email='manager@a.kz',
            password='pass12345',
            role=UserRole.MANAGER,
            school=self.school_a,
        )
        self.teacher_b = User.objects.create_user(
            email='teacher@b.kz',
            password='pass12345',
            role=UserRole.TEACHER,
            school=self.school_b,
        )
        self.profile_b = TeacherProfile.objects.create(
            user=self.teacher_b,
            first_name='Айбек',
            last_name='Сейткали',
            experience_years=5,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.manager)

    def test_manager_cannot_see_other_school_teacher_list(self):
        response = self.client.get('/api/manager/teachers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        ids = [teacher['id'] for teacher in results]
        self.assertNotIn(self.profile_b.id, ids)

    def test_manager_gets_403_on_other_school_teacher_detail(self):
        response = self.client.get(f'/api/manager/teachers/{self.profile_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_gets_403_on_other_school_file_download(self):
        response = self.client.get(
            f'/api/manager/teachers/{self.profile_b.id}/download/?type=diploma&id=999',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_access_manager_endpoints(self):
        self.client.force_authenticate(user=self.teacher_b)
        response = self.client.get('/api/manager/teachers/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
