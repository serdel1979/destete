import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoteService } from '../../core/services/lote.service';
import { AnimalService } from '../../core/services/animal.service';
import { VentaService } from '../../core/services/venta.service';
import { AlimentoService } from '../../core/services/alimento.service';
import { AlimentacionService } from '../../core/services/alimentacion.service';
import { Alimento, Animal, Lote, ResumenLote, Venta } from '../../core/models/models';
import { CHART_PALETTE } from '../../shared/charts/chart-palette';
import { MiniChartComponent } from '../../shared/charts/mini-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MiniChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  lotes = signal<Lote[]>([]);
  animales = signal<Animal[]>([]);
  ventas = signal<Venta[]>([]);
  alimentos = signal<Alimento[]>([]);
  resumenes = signal<ResumenLote[]>([]);
  loading = signal(true);

  constructor(
    private loteService: LoteService,
    private animalService: AnimalService,
    private ventaService: VentaService,
    private alimentoService: AlimentoService,
    private alimentacionService: AlimentacionService
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
      this.cargarResumenes(lotes);
    });
  }

  private cargarResumenes(lotes: Lote[]): void {
    const activos = lotes.filter((l) => l.estado === 'activo');
    if (!activos.length) return;
    forkJoin(
      activos.map((l) => this.alimentacionService.resumen(l.id).pipe(catchError(() => of(null))))
    ).subscribe((resumenes) => {
      this.resumenes.set(resumenes.filter((r): r is ResumenLote => r !== null));
    });
  }

  get animalesActivos(): number {
    return this.animales().filter((a) => a.estado === 'activo').length;
  }

  get lotesActivos(): number {
    return this.lotes().filter((l) => l.estado === 'activo').length;
  }

  get ingresoTotalVentas(): number {
    return this.ventas().reduce((acc, v) => acc + v.precio_total, 0);
  }

  get caravanasProvisorias(): number {
    return this.animales().filter((a) => a.caravana_provisoria).length;
  }

  get alimentosBajoStock(): number {
    return this.alimentos().filter((a) => a.stock_bajo).length;
  }

  get chartEstadoAnimales(): ChartConfiguration<'doughnut'>['data'] {
    const animales = this.animales();
    const activos = animales.filter((a) => a.estado === 'activo').length;
    const vendidos = animales.filter((a) => a.estado === 'vendido').length;
    const bajas = animales.filter((a) => a.estado === 'baja').length;
    return {
      labels: ['Activos', 'Vendidos', 'Bajas'],
      datasets: [
        {
          data: [activos, vendidos, bajas],
          backgroundColor: [CHART_PALETTE.blue, CHART_PALETTE.aqua, CHART_PALETTE.red]
        }
      ]
    };
  }

  get chartAnimalesPorLote(): ChartConfiguration<'bar'>['data'] {
    const lotes = this.lotes();
    return {
      labels: lotes.map((l) => l.nombre),
      datasets: [{ label: 'Animales', data: lotes.map((l) => l.cantidad_animales), backgroundColor: CHART_PALETTE.blue }]
    };
  }

  get chartPesoPromedioPorLote(): ChartConfiguration<'bar'>['data'] {
    const lotes = this.lotes();
    const animales = this.animales();
    const promedios = lotes.map((l) => {
      const pesos = animales
        .filter((a) => a.lote_id === l.id && a.peso_actual_kg != null)
        .map((a) => a.peso_actual_kg as number);
      return pesos.length ? Math.round((pesos.reduce((s, p) => s + p, 0) / pesos.length) * 10) / 10 : 0;
    });
    return {
      labels: lotes.map((l) => l.nombre),
      datasets: [{ label: 'Peso promedio actual (kg)', data: promedios, backgroundColor: CHART_PALETTE.blue }]
    };
  }

  get chartStockAlimentos(): ChartConfiguration<'bar'>['data'] {
    const alimentos = this.alimentos();
    return {
      labels: alimentos.map((a) => a.nombre),
      datasets: [
        { label: 'Stock actual (kg)', data: alimentos.map((a) => a.stock_actual_kg), backgroundColor: CHART_PALETTE.blue },
        {
          label: 'Stock mínimo (kg)',
          data: alimentos.map((a) => a.stock_minimo_kg ?? 0),
          backgroundColor: CHART_PALETTE.orange
        }
      ]
    };
  }

  get chartIngresosPorMes(): ChartConfiguration<'line'>['data'] {
    const porMes = new Map<string, number>();
    for (const v of this.ventas()) {
      const mes = v.fecha_venta.slice(0, 7);
      porMes.set(mes, (porMes.get(mes) ?? 0) + v.precio_total);
    }
    const meses = [...porMes.keys()].sort();
    return {
      labels: meses,
      datasets: [
        {
          label: 'Ingreso ($)',
          data: meses.map((m) => porMes.get(m) ?? 0),
          borderColor: CHART_PALETTE.blue,
          backgroundColor: 'rgba(42, 120, 214, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  }

  get chartDesvioIca(): ChartConfiguration<'bar'>['data'] {
    const datos = this.resumenes().filter((r) => r.ica_teorico != null || r.ica_real != null);
    return {
      labels: datos.map((r) => r.lote_nombre),
      datasets: [
        { label: 'ICA teórico', data: datos.map((r) => r.ica_teorico ?? 0), backgroundColor: CHART_PALETTE.orange },
        { label: 'ICA real', data: datos.map((r) => r.ica_real ?? 0), backgroundColor: CHART_PALETTE.blue }
      ]
    };
  }
}
