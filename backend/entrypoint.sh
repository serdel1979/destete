#!/bin/sh
set -e

echo "Esperando a Postgres..."
python -c "
import time, sys
import psycopg2
from app.core.config import settings
for i in range(30):
    try:
        psycopg2.connect(
            host=settings.POSTGRES_HOST, port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER, password=settings.POSTGRES_PASSWORD,
            dbname=settings.POSTGRES_DB,
        ).close()
        sys.exit(0)
    except Exception:
        time.sleep(1)
print('No se pudo conectar a Postgres', file=sys.stderr)
sys.exit(1)
"

echo "Aplicando migraciones..."
alembic upgrade head

echo "Creando usuario admin (si no existe)..."
python -m app.seed.seed_admin

echo "Migrando datos de los Excel (si la base está vacía)..."
python -m app.seed.import_excel

echo "Iniciando API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
