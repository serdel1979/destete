import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lote } from '../models/models';

const BASE = '/api/v1/lotes';

@Injectable({ providedIn: 'root' })
export class LoteService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Lote[]> {
    return this.http.get<Lote[]>(BASE);
  }

  obtener(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${BASE}/${id}`);
  }

  crear(payload: Partial<Lote>): Observable<Lote> {
    return this.http.post<Lote>(BASE, payload);
  }

  actualizar(id: number, payload: Partial<Lote>): Observable<Lote> {
    return this.http.put<Lote>(`${BASE}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
