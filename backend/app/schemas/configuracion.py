from pydantic import BaseModel

from app.models.configuracion import ColorFondo, PaletaColor


class ConfiguracionOut(BaseModel):
    paleta: PaletaColor
    fondo: ColorFondo

    model_config = {"from_attributes": True}


class ConfiguracionUpdate(BaseModel):
    paleta: PaletaColor | None = None
    fondo: ColorFondo | None = None
