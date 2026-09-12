from datetime import date

from pydantic import BaseModel

from app.models.movimiento_stock import TipoMovimientoStock


class MovimientoStockBase(BaseModel):
    fecha: date
    tipo: TipoMovimientoStock
    cantidad_kg: float
    costo_total: float | None = None
    proveedor: str | None = None
    observaciones: str | None = None


class MovimientoStockCreate(MovimientoStockBase):
    pass


class MovimientoStockOut(MovimientoStockBase):
    id: int
    alimento_id: int

    model_config = {"from_attributes": True}
