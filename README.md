# Control de Destete

Sistema para reemplazar el seguimiento de terneros (desde el destete hasta la venta) que hoy se lleva en dos planillas Excel, por una aplicación web con base de datos, cálculo automático de curvas de alimentación/costos, y trazabilidad individual por animal.

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 (async) + Alembic + PostgreSQL
- **Frontend:** Angular 19 + Angular Material
- **Infraestructura:** Docker Compose (Postgres, backend, frontend)

## Cómo levantarlo

Requiere Docker y Docker Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

La primera vez que levanta, el backend automáticamente:
1. Aplica las migraciones de Alembic (crea el esquema).
2. Crea el usuario administrador (`ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`, por defecto `admin@destete.com` / `admin123`).
3. Migra los datos reales de los Excel en `data/raw/` (solo la primera vez; si ya hay lotes cargados, no vuelve a importar).

Servicios expuestos (puertos configurables en `.env`):

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API (Swagger) | http://localhost:8000/docs |
| Postgres | localhost:5433 (5433 por defecto para no chocar con un Postgres local en 5432) |

Para levantarlo en otra máquina (por ejemplo en casa), alcanza con clonar el repo, copiar `data/raw/` con los Excel, `cp .env.example .env` y `docker compose up -d --build`. El volumen de Postgres es local a cada máquina — no hay datos compartidos entre ambas instalaciones salvo que se haga un `pg_dump`/`pg_restore` manual.

## Estructura

```
backend/    API FastAPI + modelos SQLAlchemy + Alembic + script de migración de los Excel
frontend/   Angular (standalone components + Angular Material)
data/raw/   Excel originales del cliente (fuente de la migración inicial)
docs/       Documentación de la propuesta
```

## Notas de diseño

- **Pesajes:** el modelo incluye la entidad `Pesaje` con fecha real por evento (a diferencia de las columnas fijas de peso del Excel). El registro de pesajes en esta versión es manual vía web; está pensado para integrarse con una futura app mobile de campo sin cambiar el modelo de datos.
- **Curva de alimentación:** `MODELO 150D` de la planilla original (150 filas fijas por lote) se reemplazó por un plan de etapas (`plan_alimentacion`) que se recalcula en tiempo real (`app/services/racion.py`). Se simplificó el ADPV a un valor constante por etapa (antes variaba día a día) — el error acumulado contra el modelo original es menor al 0.5% a 150 días.
- **Caravanas provisorias:** los animales sin caravana individual en la planilla original ("S/C - H", "S/C - M", repetidos) se importaron con un ID provisorio autogenerado y quedan marcados con `caravana_provisoria = true` para que se puedan identificar y corregir en campo.

## Comandos útiles

```bash
# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Crear una nueva migración tras cambiar un modelo
docker compose run --rm --user "$(id -u):$(id -g)" --entrypoint alembic backend revision --autogenerate -m "descripcion"

# Bajar todo (conserva los datos)
docker compose down

# Bajar todo y borrar los datos de Postgres
docker compose down -v
```
