from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.lote import Lote


class PlanAlimentacion(Base):
    """Etapa de la curva de racionamiento teórica de un lote.

    Reemplaza la tabla día-a-día hardcodeada de la planilla (MODELO 150D):
    cada fila define un rango de días con un % de consumo sobre peso vivo
    y un costo de referencia; la curva diaria se calcula en tiempo real
    a partir de estos parámetros (servicio `racion`).
    """

    __tablename__ = "plan_alimentacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    lote_id: Mapped[int] = mapped_column(ForeignKey("lotes.id"), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False)
    fase: Mapped[str] = mapped_column(String(120), nullable=False)
    dia_desde: Mapped[int] = mapped_column(Integer, nullable=False)
    dia_hasta: Mapped[int] = mapped_column(Integer, nullable=False)
    pct_consumo_pv: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    adpv_esperado_kg: Mapped[float] = mapped_column(Numeric(6, 3), nullable=False)
    costo_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    lote: Mapped["Lote"] = relationship(back_populates="plan_alimentacion")


class ConsumoReal(Base):
    """Consumo real de alimento registrado para un lote en una fecha,
    usado para contrastar contra el plan teórico (ICA real, costo real)."""

    __tablename__ = "consumos_reales"

    id: Mapped[int] = mapped_column(primary_key=True)
    lote_id: Mapped[int] = mapped_column(ForeignKey("lotes.id"), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    alimento: Mapped[str] = mapped_column(String(120), nullable=False)
    cantidad_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    costo_total: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lote: Mapped["Lote"] = relationship(back_populates="consumos_reales")
