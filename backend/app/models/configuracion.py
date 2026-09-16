import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class PaletaColor(str, enum.Enum):
    verde = "verde"
    azul = "azul"
    terracota = "terracota"
    violeta = "violeta"
    grafito = "grafito"


class ColorFondo(str, enum.Enum):
    crema = "crema"
    blanco = "blanco"
    gris = "gris"
    arena = "arena"
    celeste = "celeste"


class ConfiguracionApp(Base):
    __tablename__ = "configuracion_app"

    id: Mapped[int] = mapped_column(primary_key=True)
    paleta: Mapped[PaletaColor] = mapped_column(
        Enum(PaletaColor, name="paleta_color"), default=PaletaColor.verde, nullable=False
    )
    fondo: Mapped[ColorFondo] = mapped_column(
        Enum(ColorFondo, name="color_fondo"), default=ColorFondo.crema, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
