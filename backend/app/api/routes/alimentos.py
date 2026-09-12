from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.alimentacion import ConsumoReal, PlanAlimentacion
from app.models.alimento import Alimento
from app.schemas.alimento import AlimentoCreate, AlimentoOut, AlimentoUpdate

router = APIRouter(prefix="/alimentos", tags=["alimentos"])


@router.get("", response_model=list[AlimentoOut])
async def listar_alimentos(
    solo_activos: bool = False, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    stmt = select(Alimento).order_by(Alimento.nombre)
    if solo_activos:
        stmt = stmt.where(Alimento.activo.is_(True))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=AlimentoOut, status_code=201)
async def crear_alimento(
    payload: AlimentoCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    existing = await db.execute(select(Alimento).where(Alimento.nombre == payload.nombre))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya existe un alimento con ese nombre")
    alimento = Alimento(**payload.model_dump())
    db.add(alimento)
    await db.commit()
    await db.refresh(alimento)
    return alimento


@router.put("/{alimento_id}", response_model=AlimentoOut)
async def actualizar_alimento(
    alimento_id: int,
    payload: AlimentoUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    alimento = await db.get(Alimento, alimento_id)
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(alimento, field, value)
    await db.commit()
    await db.refresh(alimento)
    return alimento


@router.delete("/{alimento_id}", status_code=204)
async def eliminar_alimento(
    alimento_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    alimento = await db.get(Alimento, alimento_id)
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    en_uso = await db.execute(
        select(PlanAlimentacion.id).where(PlanAlimentacion.alimento_id == alimento_id)
    )
    if en_uso.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="No se puede eliminar: está usado en un plan de alimentación"
        )
    en_uso_consumo = await db.execute(
        select(ConsumoReal.id).where(ConsumoReal.alimento_id == alimento_id)
    )
    if en_uso_consumo.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="No se puede eliminar: tiene consumos reales registrados"
        )
    await db.delete(alimento)
    await db.commit()
