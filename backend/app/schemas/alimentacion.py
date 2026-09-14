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
    cantidad_bajas: int
    peso_inicial_kg: float | None
    peso_promedio_actual_kg: float | None
    consumo_teorico_acumulado_kg: float
    consumo_real_acumulado_kg: float
    costo_teorico_acumulado: float
    costo_real_acumulado: float
    ica_teorico: float | None
    ica_real: float | None
    costo_por_kg_ganado_teorico: float | None
    costo_por_kg_ganado_real: float | None
    dias_plan_total: int | None
    dias_transcurridos: int | None
    gdp_teorico_kg_dia: float | None
    gdp_real_kg_dia: float | None


class SerieRealPunto(BaseModel):
    dia: int
    fecha: date
    peso_promedio_kg: float
    cantidad_pesajes: int


class AnimalComparacion(BaseModel):
    animal_id: int
    caravana: str
    dia: int
    fecha: date
    peso_real_kg: float
    peso_teorico_kg: float
    desvio_pct: float
    severidad: str


class ComparacionLote(BaseModel):
    lote_id: int
    lote_nombre: str
    dias_plan_total: int
    curva_teorica: list[CurvaDiaria]
    serie_real: list[SerieRealPunto]
    animales: list[AnimalComparacion]
