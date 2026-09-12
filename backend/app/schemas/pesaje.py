from datetime import date

from pydantic import BaseModel


class PesajeBase(BaseModel):
    fecha: date
    peso_kg: float
    observaciones: str | None = None


class PesajeCreate(PesajeBase):
    animal_id: int


class PesajeOut(PesajeBase):
    id: int
    animal_id: int

    model_config = {"from_attributes": True}
