from datetime import date

from pydantic import BaseModel

from app.models.lote import EstadoLote


class LoteBase(BaseModel):
    nombre: str
    caravana_color: str | None = None
    fecha_inicio: date | None = None
    fecha_cierre: date | None = None
    peso_inicial_promedio: float | None = None
    estado: EstadoLote = EstadoLote.activo
    observaciones: str | None = None


class LoteCreate(LoteBase):
    pass


class LoteUpdate(BaseModel):
    nombre: str | None = None
    caravana_color: str | None = None
    fecha_inicio: date | None = None
    fecha_cierre: date | None = None
    peso_inicial_promedio: float | None = None
    estado: EstadoLote | None = None
    observaciones: str | None = None


class LoteOut(LoteBase):
    id: int
    cantidad_animales: int = 0

    model_config = {"from_attributes": True}
