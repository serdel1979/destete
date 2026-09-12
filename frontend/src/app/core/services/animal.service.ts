import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Animal, AnimalDetalle, Pesaje } from '../models/models';

const BASE = '/api/v1/animales';
const PESAJES = '/api/v1/pesajes';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  constructor(private http: HttpClient) {}

  listar(filtros: { lote_id?: number; estado?: string; caravana?: string } = {}): Observable<Animal[]> {
    const params: Record<string, string> = {};
    if (filtros.lote_id != null) params['lote_id'] = String(filtros.lote_id);
    if (filtros.estado) params['estado'] = filtros.estado;
    if (filtros.caravana) params['caravana'] = filtros.caravana;
    return this.http.get<Animal[]>(BASE, { params });
  }

  obtener(id: number): Observable<AnimalDetalle> {
    return this.http.get<AnimalDetalle>(`${BASE}/${id}`);
  }

  crear(payload: Partial<Animal>): Observable<Animal> {
    return this.http.post<Animal>(BASE, payload);
  }

  actualizar(id: number, payload: Partial<Animal>): Observable<Animal> {
    return this.http.put<Animal>(`${BASE}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  agregarPesaje(payload: { animal_id: number; fecha: string; peso_kg: number; observaciones?: string }): Observable<Pesaje> {
    return this.http.post<Pesaje>(PESAJES, payload);
  }

  eliminarPesaje(id: number): Observable<void> {
    return this.http.delete<void>(`${PESAJES}/${id}`);
  }
}
