from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.alimentacion import ConsumoReal, PlanAlimentacion
from app.models.alimento import Alimento
from app.models.movimiento_stock import MovimientoStock, TipoMovimientoStock
from app.schemas.alimento import AlimentoCreate, AlimentoOut, AlimentoUpdate
from app.schemas.movimiento_stock import MovimientoStockCreate, MovimientoStockOut

router = APIRouter(prefix="/alimentos", tags=["alimentos"])


def _alimento_out(alimento: Alimento) -> AlimentoOut:
    stock_bajo = (
        alimento.stock_minimo_kg is not None and alimento.stock_actual_kg <= alimento.stock_minimo_kg
    )
    return AlimentoOut(
        id=alimento.id,
        nombre=alimento.nombre,
        descripcion=alimento.descripcion,
        costo_kg_referencia=alimento.costo_kg_referencia,
        kg_por_bolsa=alimento.kg_por_bolsa,
        stock_actual_kg=alimento.stock_actual_kg,
        stock_minimo_kg=alimento.stock_minimo_kg,
        activo=alimento.activo,
        stock_bajo=stock_bajo,
    )


async def _get_alimento_or_404(db: AsyncSession, alimento_id: int) -> Alimento:
    alimento = await db.get(Alimento, alimento_id)
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    return alimento


@router.get("", response_model=list[AlimentoOut])
async def listar_alimentos(
    solo_activos: bool = False, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    stmt = select(Alimento).order_by(Alimento.nombre)
    if solo_activos:
        stmt = stmt.where(Alimento.activo.is_(True))
    result = await db.execute(stmt)
    return [_alimento_out(a) for a in result.scalars().all()]


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
    return _alimento_out(alimento)


@router.put("/{alimento_id}", response_model=AlimentoOut)
async def actualizar_alimento(
    alimento_id: int,
    payload: AlimentoUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    alimento = await _get_alimento_or_404(db, alimento_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(alimento, field, value)
    await db.commit()
    await db.refresh(alimento)
    return _alimento_out(alimento)


@router.delete("/{alimento_id}", status_code=204)
async def eliminar_alimento(
    alimento_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    alimento = await _get_alimento_or_404(db, alimento_id)
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


@router.get("/{alimento_id}/movimientos", response_model=list[MovimientoStockOut])
async def listar_movimientos(
    alimento_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    await _get_alimento_or_404(db, alimento_id)
    result = await db.execute(
        select(MovimientoStock)
        .where(MovimientoStock.alimento_id == alimento_id)
        .order_by(MovimientoStock.fecha.desc(), MovimientoStock.id.desc())
    )
    return result.scalars().all()


@router.post("/{alimento_id}/movimientos", response_model=MovimientoStockOut, status_code=201)
async def registrar_movimiento(
    alimento_id: int,
    payload: MovimientoStockCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    alimento = await _get_alimento_or_404(db, alimento_id)
    if payload.tipo == TipoMovimientoStock.entrada and payload.cantidad_kg <= 0:
        raise HTTPException(status_code=400, detail="La cantidad de una entrada debe ser positiva")

    movimiento = MovimientoStock(alimento_id=alimento_id, **payload.model_dump())
    alimento.stock_actual_kg = float(alimento.stock_actual_kg) + float(payload.cantidad_kg)
    db.add(movimiento)
    await db.commit()
    await db.refresh(movimiento)
    return movimiento
