import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.alimento import Alimento


class TipoMovimientoStock(str, enum.Enum):
    entrada = "entrada"
    ajuste = "ajuste"


class MovimientoStock(Base):
    """Movimiento de stock de un alimento: una compra/ingreso ("entrada")
    o una corrección manual contra el conteo físico ("ajuste", puede ser
    positivo o negativo). El consumo (salida) no se carga acá: se
    descuenta solo cuando se registra un ConsumoReal para un lote.
    """

    __tablename__ = "movimientos_stock"

    id: Mapped[int] = mapped_column(primary_key=True)
    alimento_id: Mapped[int] = mapped_column(ForeignKey("alimentos.id"), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    tipo: Mapped[TipoMovimientoStock] = mapped_column(
        Enum(TipoMovimientoStock, name="tipo_movimiento_stock"), nullable=False
    )
    cantidad_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    costo_total: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    proveedor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    alimento: Mapped["Alimento"] = relationship(back_populates="movimientos_stock")
