import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { LoteService } from '../../core/services/lote.service';
import { AnimalService } from '../../core/services/animal.service';
import { VentaService } from '../../core/services/venta.service';
import { AlimentoService } from '../../core/services/alimento.service';
import { Alimento, Animal, Lote, Venta } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  lotes = signal<Lote[]>([]);
  animales = signal<Animal[]>([]);
  ventas = signal<Venta[]>([]);
  alimentos = signal<Alimento[]>([]);
  loading = signal(true);

  constructor(
    private loteService: LoteService,
    private animalService: AnimalService,
    private ventaService: VentaService,
    private alimentoService: AlimentoService
  ) {}

  ngOnInit(): void {
    forkJoin({
      lotes: this.loteService.listar(),
      animales: this.animalService.listar(),
      ventas: this.ventaService.listar(),
      alimentos: this.alimentoService.listar()
    }).subscribe(({ lotes, animales, ventas, alimentos }) => {
      this.lotes.set(lotes);
      this.animales.set(animales);
      this.ventas.set(ventas);
      this.alimentos.set(alimentos);
      this.loading.set(false);
    });
  }

  get animalesActivos(): number {
    return this.animales().filter((a) => a.estado === 'activo').length;
  }

  get pesoPromedioActivos(): number | null {
    const pesos = this.animales()
      .filter((a) => a.estado === 'activo' && a.peso_actual_kg != null)
      .map((a) => a.peso_actual_kg as number);
    if (!pesos.length) return null;
    return Math.round((pesos.reduce((s, p) => s + p, 0) / pesos.length) * 10) / 10;
  }

  get lotesActivos(): number {
    return this.lotes().filter((l) => l.estado === 'activo').length;
  }

  get animalesEnLotesActivos(): number {
    return this.lotes()
      .filter((l) => l.estado === 'activo')
      .reduce((acc, l) => acc + l.cantidad_animales, 0);
  }

  get ingresoTotalVentas(): number {
    return this.ventas().reduce((acc, v) => acc + v.precio_total, 0);
  }

  get ingresoPromedioPorVenta(): number | null {
    const ventas = this.ventas();
    if (!ventas.length) return null;
    return Math.round(this.ingresoTotalVentas / ventas.length);
  }

  get ultimaVentaFecha(): string | null {
    const ventas = this.ventas();
    if (!ventas.length) return null;
    return ventas.map((v) => v.fecha_venta).sort().at(-1) ?? null;
  }

  get caravanasProvisorias(): number {
    return this.animales().filter((a) => a.caravana_provisoria).length;
  }

  get alimentosBajoStock(): number {
    return this.alimentos().filter((a) => a.stock_bajo).length;
  }
}
