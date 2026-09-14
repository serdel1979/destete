from datetime import date

from pydantic import BaseModel

from app.models.animal import EstadoAnimal, MotivoBaja, SexoAnimal
from app.schemas.pesaje import PesajeOut


class AnimalBase(BaseModel):
    caravana: str
    sexo: SexoAnimal
    caracteristicas: str | None = None
    fecha_nacimiento: date | None = None
    fecha_destete: date | None = None
    madre: str | None = None
    padre: str | None = None
    lote_id: int | None = None
    estado: EstadoAnimal = EstadoAnimal.activo
    peso_destete_kg: float | None = None
    observaciones: str | None = None


class AnimalCreate(AnimalBase):
    pass


class AnimalUpdate(BaseModel):
    caravana: str | None = None
    sexo: SexoAnimal | None = None
    caracteristicas: str | None = None
    fecha_nacimiento: date | None = None
    fecha_destete: date | None = None
    madre: str | None = None
    padre: str | None = None
    lote_id: int | None = None
    peso_destete_kg: float | None = None
    observaciones: str | None = None


class AnimalOut(AnimalBase):
    id: int
    caravana_provisoria: bool
    fecha_baja: date | None = None
    motivo_baja: MotivoBaja | None = None
    peso_actual_kg: float | None = None
    fecha_ultimo_pesaje: date | None = None

    model_config = {"from_attributes": True}


class AnimalDetalle(AnimalOut):
    pesajes: list[PesajeOut] = []


class AnimalBajaCreate(BaseModel):
    fecha_baja: date
    motivo_baja: MotivoBaja
    observaciones: str | None = None
