from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.alimentacion import ConsumoReal, PlanAlimentacion
from app.models.alimento import Alimento
from app.models.animal import Animal
from app.models.lote import Lote
from app.schemas.alimentacion import (
    ConsumoRealCreate,
    ConsumoRealOut,
    CurvaDiaria,
    PlanAlimentacionCreate,
    PlanAlimentacionOut,
    ResumenLote,
)
from app.services.racion import calcular_curva_teorica, calcular_resumen_lote

router = APIRouter(prefix="/alimentacion", tags=["alimentacion"])


async def _get_lote(db: AsyncSession, lote_id: int) -> Lote:
    lote = await db.get(Lote, lote_id)
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lote


async def _get_alimento(db: AsyncSession, alimento_id: int) -> Alimento:
    alimento = await db.get(Alimento, alimento_id)
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    return alimento


def _plan_out(etapa: PlanAlimentacion) -> PlanAlimentacionOut:
    return PlanAlimentacionOut(
        id=etapa.id,
        lote_id=etapa.lote_id,
        alimento_id=etapa.alimento_id,
        alimento_nombre=etapa.alimento.nombre,
        orden=etapa.orden,
        dia_desde=etapa.dia_desde,
        dia_hasta=etapa.dia_hasta,
        pct_consumo_pv=etapa.pct_consumo_pv,
        adpv_esperado_kg=etapa.adpv_esperado_kg,
        costo_kg=etapa.costo_kg,
    )


def _consumo_out(consumo: ConsumoReal) -> ConsumoRealOut:
    return ConsumoRealOut(
        id=consumo.id,
        lote_id=consumo.lote_id,
        alimento_id=consumo.alimento_id,
        alimento_nombre=consumo.alimento.nombre,
        fecha=consumo.fecha,
        cantidad_kg=consumo.cantidad_kg,
        costo_total=consumo.costo_total,
        observaciones=consumo.observaciones,
    )


@router.get("/plan/{lote_id}", response_model=list[PlanAlimentacionOut])
async def obtener_plan(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(PlanAlimentacion)
        .options(selectinload(PlanAlimentacion.alimento))
        .where(PlanAlimentacion.lote_id == lote_id)
        .order_by(PlanAlimentacion.orden)
    )
    return [_plan_out(e) for e in result.scalars().all()]


@router.post("/plan", response_model=PlanAlimentacionOut, status_code=201)
async def crear_etapa_plan(
    payload: PlanAlimentacionCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    await _get_lote(db, payload.lote_id)
    await _get_alimento(db, payload.alimento_id)
    etapa = PlanAlimentacion(**payload.model_dump())
    db.add(etapa)
    await db.commit()
    await db.refresh(etapa, attribute_names=["alimento"])
    return _plan_out(etapa)


@router.delete("/plan/{etapa_id}", status_code=204)
async def eliminar_etapa_plan(etapa_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    etapa = await db.get(PlanAlimentacion, etapa_id)
    if not etapa:
        raise HTTPException(status_code=404, detail="Etapa no encontrada")
    await db.delete(etapa)
    await db.commit()


@router.get("/curva/{lote_id}", response_model=list[CurvaDiaria])
async def obtener_curva_teorica(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    lote = await _get_lote(db, lote_id)
    result = await db.execute(
        select(PlanAlimentacion)
        .options(selectinload(PlanAlimentacion.alimento))
        .where(PlanAlimentacion.lote_id == lote_id)
        .order_by(PlanAlimentacion.orden)
    )
    plan = result.scalars().all()
    return calcular_curva_teorica(lote, plan)


@router.get("/consumos/{lote_id}", response_model=list[ConsumoRealOut])
async def listar_consumos(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(ConsumoReal)
        .options(selectinload(ConsumoReal.alimento))
        .where(ConsumoReal.lote_id == lote_id)
        .order_by(ConsumoReal.fecha)
    )
    return [_consumo_out(c) for c in result.scalars().all()]


@router.post("/consumos", response_model=ConsumoRealOut, status_code=201)
async def registrar_consumo(
    payload: ConsumoRealCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    await _get_lote(db, payload.lote_id)
    alimento = await _get_alimento(db, payload.alimento_id)
    consumo = ConsumoReal(**payload.model_dump())
    # El consumo real es la salida de stock: alimentar un lote descuenta
    # del depósito del alimento usado.
    alimento.stock_actual_kg = float(alimento.stock_actual_kg) - float(payload.cantidad_kg)
    db.add(consumo)
    await db.commit()
    await db.refresh(consumo, attribute_names=["alimento"])
    return _consumo_out(consumo)


@router.get("/resumen/{lote_id}", response_model=ResumenLote)
async def resumen_economico_lote(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    lote = await _get_lote(db, lote_id)
    animales_res = await db.execute(
        select(Animal).options(selectinload(Animal.pesajes)).where(Animal.lote_id == lote_id)
    )
    animales = animales_res.scalars().unique().all()
    plan_res = await db.execute(
        select(PlanAlimentacion)
        .options(selectinload(PlanAlimentacion.alimento))
        .where(PlanAlimentacion.lote_id == lote_id)
        .order_by(PlanAlimentacion.orden)
    )
    plan = plan_res.scalars().all()
    consumos_res = await db.execute(select(ConsumoReal).where(ConsumoReal.lote_id == lote_id))
    consumos = consumos_res.scalars().all()
    return calcular_resumen_lote(lote, animales, plan, consumos)
