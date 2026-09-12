import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Alimento, MovimientoStock } from '../models/models';

const BASE = '/api/v1/alimentos';

@Injectable({ providedIn: 'root' })
export class AlimentoService {
  constructor(private http: HttpClient) {}

  listar(soloActivos = false): Observable<Alimento[]> {
    const params: Record<string, string> = soloActivos ? { solo_activos: 'true' } : {};
    return this.http.get<Alimento[]>(BASE, { params });
  }

  crear(payload: Partial<Alimento>): Observable<Alimento> {
    return this.http.post<Alimento>(BASE, payload);
  }

  actualizar(id: number, payload: Partial<Alimento>): Observable<Alimento> {
    return this.http.put<Alimento>(`${BASE}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  movimientos(alimentoId: number): Observable<MovimientoStock[]> {
    return this.http.get<MovimientoStock[]>(`${BASE}/${alimentoId}/movimientos`);
  }

  registrarMovimiento(alimentoId: number, payload: Partial<MovimientoStock>): Observable<MovimientoStock> {
    return this.http.post<MovimientoStock>(`${BASE}/${alimentoId}/movimientos`, payload);
  }
}
