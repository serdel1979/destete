from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.animal import Animal


class Pesaje(Base):
    __tablename__ = "pesajes"
    __table_args__ = (UniqueConstraint("animal_id", "fecha", name="uq_pesaje_animal_fecha"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey("animales.id"), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    peso_kg: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    animal: Mapped["Animal"] = relationship(back_populates="pesajes")
