from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.animal import Animal
from app.models.pesaje import Pesaje
from app.schemas.pesaje import PesajeCreate, PesajeOut

router = APIRouter(prefix="/pesajes", tags=["pesajes"])


@router.get("", response_model=list[PesajeOut])
async def listar_pesajes(
    animal_id: int | None = None, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    stmt = select(Pesaje).order_by(Pesaje.fecha)
    if animal_id is not None:
        stmt = stmt.where(Pesaje.animal_id == animal_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=PesajeOut, status_code=201)
async def crear_pesaje(payload: PesajeCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    animal = await db.get(Animal, payload.animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    pesaje = Pesaje(**payload.model_dump())
    db.add(pesaje)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Ya existe un pesaje para ese animal en esa fecha")
    await db.refresh(pesaje)
    return pesaje


@router.delete("/{pesaje_id}", status_code=204)
async def eliminar_pesaje(pesaje_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    pesaje = await db.get(Pesaje, pesaje_id)
    if not pesaje:
        raise HTTPException(status_code=404, detail="Pesaje no encontrado")
    await db.delete(pesaje)
    await db.commit()
