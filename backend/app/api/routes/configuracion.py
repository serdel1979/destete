from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.configuracion import ConfiguracionApp, PaletaColor
from app.schemas.configuracion import ConfiguracionOut, ConfiguracionUpdate

router = APIRouter(prefix="/config", tags=["config"])

CONFIG_ID = 1


async def _get_or_create(db: AsyncSession) -> ConfiguracionApp:
    config = await db.get(ConfiguracionApp, CONFIG_ID)
    if not config:
        config = ConfiguracionApp(id=CONFIG_ID, paleta=PaletaColor.verde)
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config


@router.get("", response_model=ConfiguracionOut)
async def obtener_config(db: AsyncSession = Depends(get_db)):
    return await _get_or_create(db)


@router.put("", response_model=ConfiguracionOut)
async def actualizar_config(
    payload: ConfiguracionUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    config = await _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(config, field, value)
    await db.commit()
    await db.refresh(config)
    return config
