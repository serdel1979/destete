from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.alimentacion import ConsumoReal, PlanAlimentacion


class Alimento(Base):
    """Catálogo de tipos de alimento (Hiper-Precoz, Precoz, etc.).

    Reemplaza el texto libre que antes se tipeaba en cada etapa del plan
    o en cada consumo real: se da de alta una vez, con su costo de
    referencia y el tamaño de bolsa del proveedor, y se reutiliza en
    todos los lotes.
    """

    __tablename__ = "alimentos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    costo_kg_referencia: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    kg_por_bolsa: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    etapas_plan: Mapped[list["PlanAlimentacion"]] = relationship(back_populates="alimento")
    consumos_reales: Mapped[list["ConsumoReal"]] = relationship(back_populates="alimento")
