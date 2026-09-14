from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.animal import Animal
from app.models.lote import Lote
from app.schemas.lote import LoteCreate, LoteOut, LoteUpdate
from app.services.racion import peso_inicial_real

router = APIRouter(prefix="/lotes", tags=["lotes"])


def _lote_out(lote: Lote) -> LoteOut:
    return LoteOut.model_validate(lote, from_attributes=True).model_copy(
        update={
            "cantidad_animales": len(lote.animales),
            "peso_inicial_real_kg": peso_inicial_real(lote.animales),
        }
    )


@router.get("", response_model=list[LoteOut])
async def listar_lotes(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(Lote).options(selectinload(Lote.animales).selectinload(Animal.pesajes))
    )
    lotes = result.scalars().unique().all()
    return [_lote_out(lote) for lote in lotes]


@router.post("", response_model=LoteOut, status_code=201)
async def crear_lote(payload: LoteCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    lote = Lote(**payload.model_dump())
    db.add(lote)
    await db.commit()
    await db.refresh(lote)
    return LoteOut.model_validate(lote, from_attributes=True)


@router.get("/{lote_id}", response_model=LoteOut)
async def obtener_lote(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(Lote)
        .options(selectinload(Lote.animales).selectinload(Animal.pesajes))
        .where(Lote.id == lote_id)
    )
    lote = result.scalar_one_or_none()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return _lote_out(lote)


@router.put("/{lote_id}", response_model=LoteOut)
async def actualizar_lote(
    lote_id: int, payload: LoteUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    lote = await db.get(Lote, lote_id)
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lote, field, value)
    await db.commit()
    await db.refresh(lote)
    return LoteOut.model_validate(lote, from_attributes=True)


@router.delete("/{lote_id}", status_code=204)
async def eliminar_lote(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    lote = await db.get(Lote, lote_id)
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    count = await db.execute(select(Animal).where(Animal.lote_id == lote_id))
    if count.scalars().first():
        raise HTTPException(status_code=400, detail="No se puede eliminar: tiene animales asociados")
    await db.delete(lote)
    await db.commit()
