from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config, UndefinedValueError

class Command(BaseCommand):
    help = 'Create superuser from environment variables'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        
        try:
            email = config('SUPERUSER_EMAIL')
            password = config('SUPERUSER_PASSWORD')
        except UndefinedValueError:
            self.stdout.write(self.style.WARNING(
                'SUPERUSER_EMAIL or SUPERUSER_PASSWORD not set. Skipping.'
            ))
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(f'Superuser {email} already exists. Skipping.')
            return

        User.objects.create_superuser(email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully.'))
