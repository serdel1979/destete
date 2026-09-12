import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../models/models';

const BASE = '/api/v1/ventas';

@Injectable({ providedIn: 'root' })
export class VentaService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(BASE);
  }

  registrar(payload: { animal_id: number; fecha_venta: string; peso_venta_kg: number; precio_kg: number; comprador?: string; observaciones?: string }): Observable<Venta> {
    return this.http.post<Venta>(BASE, payload);
  }

  anular(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
