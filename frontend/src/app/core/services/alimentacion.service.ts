import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ComparacionLote, ConsumoReal, CurvaDiaria, PlanAlimentacion, ResumenLote } from '../models/models';

const BASE = '/api/v1/alimentacion';

@Injectable({ providedIn: 'root' })
export class AlimentacionService {
  constructor(private http: HttpClient) {}

  plan(loteId: number): Observable<PlanAlimentacion[]> {
    return this.http.get<PlanAlimentacion[]>(`${BASE}/plan/${loteId}`);
  }

  crearEtapa(payload: Partial<PlanAlimentacion>): Observable<PlanAlimentacion> {
    return this.http.post<PlanAlimentacion>(`${BASE}/plan`, payload);
  }

  eliminarEtapa(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/plan/${id}`);
  }

  curvaTeorica(loteId: number): Observable<CurvaDiaria[]> {
    return this.http.get<CurvaDiaria[]>(`${BASE}/curva/${loteId}`);
  }

  consumos(loteId: number): Observable<ConsumoReal[]> {
    return this.http.get<ConsumoReal[]>(`${BASE}/consumos/${loteId}`);
  }

  registrarConsumo(payload: Partial<ConsumoReal>): Observable<ConsumoReal> {
    return this.http.post<ConsumoReal>(`${BASE}/consumos`, payload);
  }

  resumen(loteId: number): Observable<ResumenLote> {
    return this.http.get<ResumenLote>(`${BASE}/resumen/${loteId}`);
  }

  comparacion(loteId: number): Observable<ComparacionLote> {
    return this.http.get<ComparacionLote>(`${BASE}/comparacion/${loteId}`);
  }
}
