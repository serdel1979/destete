from datetime import date

from pydantic import BaseModel


class VentaBase(BaseModel):
    fecha_venta: date
    peso_venta_kg: float
    precio_kg: float
    comprador: str | None = None
    observaciones: str | None = None


class VentaCreate(VentaBase):
    animal_id: int


class VentaOut(VentaBase):
    id: int
    animal_id: int
    precio_total: float

    model_config = {"from_attributes": True}
