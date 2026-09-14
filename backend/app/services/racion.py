from datetime import date, timedelta

from app.models.alimentacion import ConsumoReal, PlanAlimentacion
from app.models.animal import Animal, EstadoAnimal
from app.models.lote import Lote
from app.schemas.alimentacion import CurvaDiaria, ResumenLote


def peso_inicial_real(animales: list[Animal]) -> float | None:
    """Promedio del primer pesaje (por fecha) de cada animal del lote.

    Es "la sumatoria del peso del primer pesaje donde se hace la
    clasificación", tal como se hace en el campo: no hay que tipearlo,
    sale solo de los pesajes ya cargados.
    """
    primeros = [min(a.pesajes, key=lambda p: p.fecha) for a in animales if a.pesajes]
    if not primeros:
        return None
    return round(sum(float(p.peso_kg) for p in primeros) / len(primeros), 2)


def peso_inicial_efectivo(lote: Lote, animales: list[Animal]) -> float:
    """Peso inicial a usar en los cálculos: real si hay pesajes cargados,
    si no el valor de planificación cargado a mano en el lote (por ejemplo
    para proyectar un lote antes de que existan animales o pesajes)."""
    real = peso_inicial_real(animales)
    if real is not None:
        return real
    return float(lote.peso_inicial_promedio or 0)


def calcular_curva_teorica(
    peso_inicial: float, fecha_inicio: date | None, plan: list[PlanAlimentacion]
) -> list[CurvaDiaria]:
    """Proyecta peso, ración y costo día a día a partir de las etapas del plan.

    Reemplaza la tabla estática "MODELO 150D" de la planilla: la curva se
    recalcula siempre a partir de peso_inicial + % consumo/ADPV por etapa,
    en vez de quedar fija en celdas que hay que editar a mano.
    """
    peso = peso_inicial
    costo_acumulado = 0.0
    curva: list[CurvaDiaria] = []
    etapas_ordenadas = sorted(plan, key=lambda e: e.orden)
    for etapa in etapas_ordenadas:
        for dia in range(etapa.dia_desde, etapa.dia_hasta + 1):
            racion = peso * float(etapa.pct_consumo_pv)
            costo_diario = racion * float(etapa.costo_kg)
            costo_acumulado += costo_diario
            fecha = fecha_inicio + timedelta(days=dia - 1) if fecha_inicio else None
            curva.append(
                CurvaDiaria(
                    dia=dia,
                    fecha=fecha,
                    fase=etapa.alimento.nombre,
                    peso_teorico_kg=round(peso, 2),
                    racion_teorica_kg=round(racion, 3),
                    costo_diario=round(costo_diario, 2),
                    costo_acumulado=round(costo_acumulado, 2),
                )
            )
            peso += float(etapa.adpv_esperado_kg)
    return curva


def calcular_resumen_lote(
    lote: Lote,
    animales: list[Animal],
    plan: list[PlanAlimentacion],
    consumos_reales: list[ConsumoReal],
) -> ResumenLote:
    peso_inicial = peso_inicial_efectivo(lote, animales)

    # Las bajas (muerte, robo, etc.) dejan de aportar ganancia de peso: se
    # excluyen del promedio actual para no distorsionar el ICA y el costo
    # por kg ganado del lote, pero el alimento que ya consumieron sigue
    # contando como costo real (fue un gasto real, no se revierte).
    animales_vivos = [a for a in animales if a.estado != EstadoAnimal.baja]
    cantidad_bajas = len(animales) - len(animales_vivos)

    pesos_actuales = [
        float(a.pesajes[-1].peso_kg) for a in animales_vivos if a.pesajes
    ]
    peso_promedio_actual = (
        sum(pesos_actuales) / len(pesos_actuales) if pesos_actuales else None
    )

    curva = calcular_curva_teorica(peso_inicial, lote.fecha_inicio, plan)
    consumo_teorico = sum(c.racion_teorica_kg for c in curva)
    costo_teorico = curva[-1].costo_acumulado if curva else 0.0
    peso_teorico_final = curva[-1].peso_teorico_kg if curva else peso_inicial
    ganancia_teorica = peso_teorico_final - peso_inicial if curva else None

    consumo_real = sum(float(c.cantidad_kg) for c in consumos_reales)
    costo_real = sum(float(c.costo_total or 0) for c in consumos_reales)
    ganancia_real = (
        peso_promedio_actual - peso_inicial
        if peso_promedio_actual is not None and peso_inicial
        else None
    )

    def ratio(a: float, b: float | None) -> float | None:
        if not b:
            return None
        return round(a / b, 4)

    return ResumenLote(
        lote_id=lote.id,
        lote_nombre=lote.nombre,
        cantidad_animales=len(animales),
        cantidad_bajas=cantidad_bajas,
        peso_inicial_kg=peso_inicial or None,
        peso_promedio_actual_kg=(
            round(peso_promedio_actual, 2) if peso_promedio_actual is not None else None
        ),
        consumo_teorico_acumulado_kg=round(consumo_teorico, 2),
        consumo_real_acumulado_kg=round(consumo_real, 2),
        costo_teorico_acumulado=round(costo_teorico, 2),
        costo_real_acumulado=round(costo_real, 2),
        ica_teorico=ratio(consumo_teorico, ganancia_teorica),
        ica_real=ratio(consumo_real, ganancia_real),
        costo_por_kg_ganado_teorico=ratio(costo_teorico, ganancia_teorica),
        costo_por_kg_ganado_real=ratio(costo_real, ganancia_real),
    )
