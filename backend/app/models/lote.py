import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.alimentacion import ConsumoReal, PlanAlimentacion
    from app.models.animal import Animal


class EstadoLote(str, enum.Enum):
    activo = "activo"
    cerrado = "cerrado"


class Lote(Base):
    __tablename__ = "lotes"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    caravana_color: Mapped[str | None] = mapped_column(String(60), nullable=True)
    fecha_inicio: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_cierre: Mapped[date | None] = mapped_column(Date, nullable=True)
    peso_inicial_promedio: Mapped[float | None] = mapped_column(Numeric(7, 2), nullable=True)
    estado: Mapped[EstadoLote] = mapped_column(
        Enum(EstadoLote, name="estado_lote"), default=EstadoLote.activo, nullable=False
    )
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    animales: Mapped[list["Animal"]] = relationship(back_populates="lote")
    plan_alimentacion: Mapped[list["PlanAlimentacion"]] = relationship(
        back_populates="lote", cascade="all, delete-orphan", order_by="PlanAlimentacion.orden"
    )
    consumos_reales: Mapped[list["ConsumoReal"]] = relationship(
        back_populates="lote", cascade="all, delete-orphan"
    )
