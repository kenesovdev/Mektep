from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

class Command(BaseCommand):
    help = 'Creates a superuser from environment variables if it does not already exist.'

    def handle(self, *args, **options):
        email = config('SUPERUSER_EMAIL', default=None)
        password = config('SUPERUSER_PASSWORD', default=None)

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    'SUPERUSER_EMAIL or SUPERUSER_PASSWORD environment variables not set. '
                    'Skipping superuser creation.'
                )
            )
            return

        User = get_user_model()
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.SUCCESS('Superuser already exists.'))
            return

        User.objects.create_superuser(email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Successfully created superuser with email {email}.'))
