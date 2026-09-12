export type RolUsuario = 'admin' | 'operario';
export type SexoAnimal = 'M' | 'H';
export type EstadoAnimal = 'activo' | 'vendido' | 'baja';
export type EstadoLote = 'activo' | 'cerrado';

export interface Token {
  access_token: string;
  token_type: string;
  rol: RolUsuario;
  nombre: string;
}

export interface Lote {
  id: number;
  nombre: string;
  caravana_color: string | null;
  fecha_inicio: string | null;
  fecha_cierre: string | null;
  peso_inicial_promedio: number | null;
  estado: EstadoLote;
  observaciones: string | null;
  cantidad_animales: number;
}

export interface Pesaje {
  id: number;
  animal_id: number;
  fecha: string;
  peso_kg: number;
  observaciones: string | null;
}

export interface Animal {
  id: number;
  caravana: string;
  caravana_provisoria: boolean;
  sexo: SexoAnimal;
  caracteristicas: string | null;
  fecha_nacimiento: string | null;
  fecha_destete: string | null;
  madre: string | null;
  padre: string | null;
  lote_id: number | null;
  estado: EstadoAnimal;
  peso_destete_kg: number | null;
  observaciones: string | null;
  peso_actual_kg: number | null;
  fecha_ultimo_pesaje: string | null;
}

export interface AnimalDetalle extends Animal {
  pesajes: Pesaje[];
}

export interface PlanAlimentacion {
  id: number;
  lote_id: number;
  orden: number;
  alimento_id: number;
  alimento_nombre: string;
  dia_desde: number;
  dia_hasta: number;
  pct_consumo_pv: number;
  adpv_esperado_kg: number;
  costo_kg: number;
}

export interface ConsumoReal {
  id: number;
  lote_id: number;
  fecha: string;
  alimento_id: number;
  alimento_nombre: string;
  cantidad_kg: number;
  costo_total: number | null;
  observaciones: string | null;
}

export interface Alimento {
  id: number;
  nombre: string;
  descripcion: string | null;
  costo_kg_referencia: number | null;
  kg_por_bolsa: number | null;
  activo: boolean;
}

export interface CurvaDiaria {
  dia: number;
  fecha: string | null;
  fase: string;
  peso_teorico_kg: number;
  racion_teorica_kg: number;
  costo_diario: number;
  costo_acumulado: number;
}

export interface ResumenLote {
  lote_id: number;
  lote_nombre: string;
  cantidad_animales: number;
  peso_promedio_actual_kg: number | null;
  consumo_teorico_acumulado_kg: number;
  consumo_real_acumulado_kg: number;
  costo_teorico_acumulado: number;
  costo_real_acumulado: number;
  ica_teorico: number | null;
  ica_real: number | null;
  costo_por_kg_ganado_teorico: number | null;
  costo_por_kg_ganado_real: number | null;
}

export interface Venta {
  id: number;
  animal_id: number;
  fecha_venta: string;
  peso_venta_kg: number;
  precio_kg: number;
  precio_total: number;
  comprador: string | null;
  observaciones: string | null;
}
