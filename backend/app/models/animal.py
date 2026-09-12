import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.lote import Lote
    from app.models.pesaje import Pesaje
    from app.models.venta import Venta


class SexoAnimal(str, enum.Enum):
    macho = "M"
    hembra = "H"


class EstadoAnimal(str, enum.Enum):
    activo = "activo"
    vendido = "vendido"
    baja = "baja"


class Animal(Base):
    __tablename__ = "animales"

    id: Mapped[int] = mapped_column(primary_key=True)
    caravana: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    caravana_provisoria: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sexo: Mapped[SexoAnimal] = mapped_column(Enum(SexoAnimal, name="sexo_animal"), nullable=False)
    caracteristicas: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_destete: Mapped[date | None] = mapped_column(Date, nullable=True)
    madre: Mapped[str | None] = mapped_column(String(60), nullable=True)
    padre: Mapped[str | None] = mapped_column(String(60), nullable=True)
    lote_id: Mapped[int | None] = mapped_column(ForeignKey("lotes.id"), nullable=True)
    estado: Mapped[EstadoAnimal] = mapped_column(
        Enum(EstadoAnimal, name="estado_animal"), default=EstadoAnimal.activo, nullable=False
    )
    peso_destete_kg: Mapped[float | None] = mapped_column(Numeric(7, 2), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    lote: Mapped["Lote"] = relationship(back_populates="animales")
    pesajes: Mapped[list["Pesaje"]] = relationship(
        back_populates="animal", cascade="all, delete-orphan", order_by="Pesaje.fecha"
    )
    venta: Mapped["Venta"] = relationship(
        back_populates="animal", cascade="all, delete-orphan", uselist=False
    )
