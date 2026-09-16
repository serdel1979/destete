"""Crea la fila de configuración de la app (paleta de colores) si no existe."""
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.configuracion import ColorFondo, ConfiguracionApp, PaletaColor

CONFIG_ID = 1


def run() -> None:
    engine = create_engine(settings.DATABASE_URL_SYNC)
    with Session(engine) as session:
        existing = session.execute(
            select(ConfiguracionApp).where(ConfiguracionApp.id == CONFIG_ID)
        ).scalar_one_or_none()
        if existing:
            print(f"Configuración ya existe: paleta={existing.paleta.value}")
            return
        config = ConfiguracionApp(id=CONFIG_ID, paleta=PaletaColor.verde, fondo=ColorFondo.crema)
        session.add(config)
        session.commit()
        print("Configuración creada con paleta por defecto: verde")


if __name__ == "__main__":
    run()
