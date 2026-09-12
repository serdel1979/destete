from datetime import date

from pydantic import BaseModel


class PlanAlimentacionBase(BaseModel):
    orden: int
    alimento_id: int
    dia_desde: int
    dia_hasta: int
    pct_consumo_pv: float
    adpv_esperado_kg: float
    costo_kg: float


class PlanAlimentacionCreate(PlanAlimentacionBase):
    lote_id: int


class PlanAlimentacionOut(PlanAlimentacionBase):
    id: int
    lote_id: int
    alimento_nombre: str

    model_config = {"from_attributes": True}


class ConsumoRealBase(BaseModel):
    fecha: date
    alimento_id: int
    cantidad_kg: float
    costo_total: float | None = None
    observaciones: str | None = None


class ConsumoRealCreate(ConsumoRealBase):
    lote_id: int


class ConsumoRealOut(ConsumoRealBase):
    id: int
    lote_id: int
    alimento_nombre: str

    model_config = {"from_attributes": True}


class CurvaDiaria(BaseModel):
    dia: int
    fecha: date | None
    fase: str
    peso_teorico_kg: float
    racion_teorica_kg: float
    costo_diario: float
    costo_acumulado: float


class ResumenLote(BaseModel):
    lote_id: int
    lote_nombre: str
    cantidad_animales: int
    peso_promedio_actual_kg: float | None
    consumo_teorico_acumulado_kg: float
    consumo_real_acumulado_kg: float
    costo_teorico_acumulado: float
    costo_real_acumulado: float
    ica_teorico: float | None
    ica_real: float | None
    costo_por_kg_ganado_teorico: float | None
    costo_por_kg_ganado_real: float | None
