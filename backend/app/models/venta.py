from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.animal import Animal


class Venta(Base):
    __tablename__ = "ventas"

    id: Mapped[int] = mapped_column(primary_key=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey("animales.id"), unique=True, nullable=False)
    fecha_venta: Mapped[date] = mapped_column(Date, nullable=False)
    peso_venta_kg: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    precio_kg: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    precio_total: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    comprador: Mapped[str | None] = mapped_column(String(255), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    animal: Mapped["Animal"] = relationship(back_populates="venta")
