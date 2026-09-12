from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.alimentacion import ConsumoReal, PlanAlimentacion
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


@router.get("/plan/{lote_id}", response_model=list[PlanAlimentacionOut])
async def obtener_plan(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(PlanAlimentacion)
        .where(PlanAlimentacion.lote_id == lote_id)
        .order_by(PlanAlimentacion.orden)
    )
    return result.scalars().all()


@router.post("/plan", response_model=PlanAlimentacionOut, status_code=201)
async def crear_etapa_plan(
    payload: PlanAlimentacionCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    await _get_lote(db, payload.lote_id)
    etapa = PlanAlimentacion(**payload.model_dump())
    db.add(etapa)
    await db.commit()
    await db.refresh(etapa)
    return etapa


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
        .where(PlanAlimentacion.lote_id == lote_id)
        .order_by(PlanAlimentacion.orden)
    )
    plan = result.scalars().all()
    return calcular_curva_teorica(lote, plan)


@router.get("/consumos/{lote_id}", response_model=list[ConsumoRealOut])
async def listar_consumos(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(ConsumoReal).where(ConsumoReal.lote_id == lote_id).order_by(ConsumoReal.fecha)
    )
    return result.scalars().all()


@router.post("/consumos", response_model=ConsumoRealOut, status_code=201)
async def registrar_consumo(
    payload: ConsumoRealCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    await _get_lote(db, payload.lote_id)
    consumo = ConsumoReal(**payload.model_dump())
    db.add(consumo)
    await db.commit()
    await db.refresh(consumo)
    return consumo


@router.get("/resumen/{lote_id}", response_model=ResumenLote)
async def resumen_economico_lote(lote_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    lote = await _get_lote(db, lote_id)
    animales_res = await db.execute(
        select(Animal).options(selectinload(Animal.pesajes)).where(Animal.lote_id == lote_id)
    )
    animales = animales_res.scalars().unique().all()
    plan_res = await db.execute(
        select(PlanAlimentacion).where(PlanAlimentacion.lote_id == lote_id).order_by(PlanAlimentacion.orden)
    )
    plan = plan_res.scalars().all()
    consumos_res = await db.execute(select(ConsumoReal).where(ConsumoReal.lote_id == lote_id))
    consumos = consumos_res.scalars().all()
    return calcular_resumen_lote(lote, animales, plan, consumos)
