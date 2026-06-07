from django.db import models


class School(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Школа'
        verbose_name_plural = 'Школы'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.city})'
