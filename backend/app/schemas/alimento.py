from pydantic import BaseModel


class AlimentoBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    costo_kg_referencia: float | None = None
    kg_por_bolsa: float | None = None
    stock_actual_kg: float = 0
    stock_minimo_kg: float | None = None
    activo: bool = True


class AlimentoCreate(AlimentoBase):
    pass


class AlimentoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    costo_kg_referencia: float | None = None
    kg_por_bolsa: float | None = None
    stock_actual_kg: float | None = None
    stock_minimo_kg: float | None = None
    activo: bool | None = None


class AlimentoOut(AlimentoBase):
    id: int
    stock_bajo: bool

    model_config = {"from_attributes": True}
