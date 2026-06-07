FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py create_superuser_env && gunicorn teacher_portfolio.wsgi:application --bind 0.0.0.0:8000 --workers 3"]