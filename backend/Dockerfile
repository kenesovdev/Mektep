FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ─── FIX: было --workers 3 → теперь 1 воркер + 4 потока
# На Render Free (512MB) каждый воркер Django ≈ 150MB
# 3 воркера × 150MB = 450MB+ = OOM (именно поэтому падало!)
#
# --workers 1 --threads 4     → 1 процесс, 4 параллельных потока (≈ 150-200MB total)
# --timeout 120               → поднимаем таймаут для тяжёлых загрузок файлов
# --max-requests 500          → перезапуск воркера каждые 500 запросов (борьба с утечками)
# --max-requests-jitter 50    → рандомный разброс ±50 чтобы не перезапускались одновременно
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py create_superuser_env && gunicorn teacher_portfolio.wsgi:application --bind 0.0.0.0:8000 --workers 1 --threads 4 --timeout 120 --max-requests 500 --max-requests-jitter 50"]
