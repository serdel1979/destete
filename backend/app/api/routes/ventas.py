from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.animal import Animal, EstadoAnimal
from app.models.venta import Venta
from app.schemas.venta import VentaCreate, VentaOut

router = APIRouter(prefix="/ventas", tags=["ventas"])


@router.get("", response_model=list[VentaOut])
async def listar_ventas(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Venta).order_by(Venta.fecha_venta.desc()))
    return result.scalars().all()


@router.post("", response_model=VentaOut, status_code=201)
async def registrar_venta(payload: VentaCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    animal = await db.get(Animal, payload.animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    if animal.estado == EstadoAnimal.vendido:
        raise HTTPException(status_code=400, detail="El animal ya fue vendido")
    precio_total = round(payload.peso_venta_kg * payload.precio_kg, 2)
    venta = Venta(**payload.model_dump(), precio_total=precio_total)
    animal.estado = EstadoAnimal.vendido
    db.add(venta)
    await db.commit()
    await db.refresh(venta)
    return venta


@router.delete("/{venta_id}", status_code=204)
async def anular_venta(venta_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    venta = await db.get(Venta, venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    animal = await db.get(Animal, venta.animal_id)
    if animal:
        animal.estado = EstadoAnimal.activo
    await db.delete(venta)
    await db.commit()
