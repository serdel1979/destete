from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.animal import Animal, EstadoAnimal
from app.schemas.animal import AnimalCreate, AnimalDetalle, AnimalOut, AnimalUpdate

router = APIRouter(prefix="/animales", tags=["animales"])


def _to_out(animal: Animal) -> AnimalOut:
    ultimo = animal.pesajes[-1] if animal.pesajes else None
    return AnimalOut.model_validate(animal, from_attributes=True).model_copy(
        update={
            "peso_actual_kg": float(ultimo.peso_kg) if ultimo else None,
            "fecha_ultimo_pesaje": ultimo.fecha if ultimo else None,
        }
    )


@router.get("", response_model=list[AnimalOut])
async def listar_animales(
    lote_id: int | None = None,
    estado: EstadoAnimal | None = None,
    caravana: str | None = Query(default=None, description="Búsqueda parcial por caravana"),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    stmt = select(Animal).options(selectinload(Animal.pesajes))
    if lote_id is not None:
        stmt = stmt.where(Animal.lote_id == lote_id)
    if estado is not None:
        stmt = stmt.where(Animal.estado == estado)
    if caravana:
        stmt = stmt.where(Animal.caravana.ilike(f"%{caravana}%"))
    result = await db.execute(stmt)
    animales = result.scalars().unique().all()
    return [_to_out(a) for a in animales]


@router.post("", response_model=AnimalOut, status_code=201)
async def crear_animal(payload: AnimalCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    existing = await db.execute(select(Animal).where(Animal.caravana == payload.caravana))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya existe un animal con esa caravana")
    animal = Animal(**payload.model_dump())
    db.add(animal)
    await db.commit()
    await db.refresh(animal, attribute_names=["pesajes"])
    return _to_out(animal)


@router.get("/{animal_id}", response_model=AnimalDetalle)
async def obtener_animal(animal_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(Animal).options(selectinload(Animal.pesajes)).where(Animal.id == animal_id)
    )
    animal = result.scalar_one_or_none()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    base = _to_out(animal)
    return AnimalDetalle(**base.model_dump(), pesajes=animal.pesajes)


@router.put("/{animal_id}", response_model=AnimalOut)
async def actualizar_animal(
    animal_id: int, payload: AnimalUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    result = await db.execute(
        select(Animal).options(selectinload(Animal.pesajes)).where(Animal.id == animal_id)
    )
    animal = result.scalar_one_or_none()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(animal, field, value)
    await db.commit()
    await db.refresh(animal, attribute_names=["pesajes"])
    return _to_out(animal)


@router.delete("/{animal_id}", status_code=204)
async def eliminar_animal(animal_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    animal = await db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    await db.delete(animal)
    await db.commit()
