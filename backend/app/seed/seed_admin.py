"""Crea el usuario administrador inicial si no existe."""
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import RolUsuario, User


def run() -> None:
    engine = create_engine(settings.DATABASE_URL_SYNC)
    with Session(engine) as session:
        existing = session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        ).scalar_one_or_none()
        if existing:
            print(f"Usuario admin ya existe: {settings.ADMIN_EMAIL}")
            return
        admin = User(
            email=settings.ADMIN_EMAIL,
            nombre="Administrador",
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            rol=RolUsuario.admin,
        )
        session.add(admin)
        session.commit()
        print(f"Usuario admin creado: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")


if __name__ == "__main__":
    run()
