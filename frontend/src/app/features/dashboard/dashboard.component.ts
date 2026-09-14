import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoteService } from '../../core/services/lote.service';
import { AnimalService } from '../../core/services/animal.service';
import { VentaService } from '../../core/services/venta.service';
import { AlimentoService } from '../../core/services/alimento.service';
import { AlimentacionService } from '../../core/services/alimentacion.service';
import {
  Alimento,
  Animal,
  ComparacionLote,
  Lote,
  ResumenLote,
  SeveridadDesvio,
  Venta
} from '../../core/models/models';
import { CHART_PALETTE } from '../../shared/charts/chart-palette';
import { MiniChartComponent } from '../../shared/charts/mini-chart.component';

const SEVERIDAD_COLOR: Record<SeveridadDesvio, string> = {
  en_linea: CHART_PALETTE.green,
  leve: CHART_PALETTE.yellow,
  critico: CHART_PALETTE.red
};

const SEVERIDAD_LABEL: Record<SeveridadDesvio, string> = {
  en_linea: 'En línea con el plan',
  leve: 'Desvío leve',
  critico: 'Desvío crítico (rezagado)'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    BaseChartDirective,
    MiniChartComponent
  ],
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

  loteSeleccionadoId = signal<number | null>(null);
  comparacion = signal<ComparacionLote | null>(null);
  cargandoComparacion = signal(false);

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
      this.seleccionarLotePorDefecto(lotes);
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

  get lotesParaComparar(): Lote[] {
    return this.lotes().filter((l) => l.estado === 'activo');
  }

  private seleccionarLotePorDefecto(lotes: Lote[]): void {
    const activos = lotes.filter((l) => l.estado === 'activo');
    if (!activos.length) return;
    this.onLoteChange(activos[0].id);
  }

  onLoteChange(loteId: number): void {
    this.loteSeleccionadoId.set(loteId);
    this.comparacion.set(null);
    this.cargandoComparacion.set(true);
    this.alimentacionService
      .comparacion(loteId)
      .pipe(catchError(() => of(null)))
      .subscribe((comparacion) => {
        this.comparacion.set(comparacion);
        this.cargandoComparacion.set(false);
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

  get chartPesoVsCurva(): ChartConfiguration<'line'>['data'] {
    const comp = this.comparacion();
    if (!comp) return { datasets: [] };
    const bandaInferior = comp.curva_teorica.map((c) => ({
      x: c.dia,
      y: Math.round(c.peso_teorico_kg * 0.95 * 100) / 100
    }));
    const bandaSuperior = comp.curva_teorica.map((c) => ({
      x: c.dia,
      y: Math.round(c.peso_teorico_kg * 1.05 * 100) / 100
    }));
    const teorica = comp.curva_teorica.map((c) => ({ x: c.dia, y: c.peso_teorico_kg }));
    const real = comp.serie_real.map((p) => ({ x: p.dia, y: p.peso_promedio_kg }));
    return {
      datasets: [
        {
          label: '',
          data: bandaInferior,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Banda de tolerancia (±5%)',
          data: bandaSuperior,
          borderColor: 'transparent',
          backgroundColor: 'rgba(235, 104, 52, 0.12)',
          pointRadius: 0,
          fill: '-1'
        },
        {
          label: 'Peso teórico (modelo)',
          data: teorica,
          borderColor: CHART_PALETTE.orange,
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Peso real (promedio del lote)',
          data: real,
          borderColor: CHART_PALETTE.blue,
          backgroundColor: CHART_PALETTE.blue,
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.15,
          fill: false
        }
      ]
    };
  }

  opcionesPesoVsCurva: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { filter: (item) => !!item.text } }
    },
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Días desde el inicio del lote' } },
      y: { title: { display: true, text: 'Peso (kg)' } }
    }
  };

  get chartDesvioAnimal(): ChartConfiguration<'scatter'>['data'] {
    const comp = this.comparacion();
    if (!comp) return { datasets: [] };
    const grupos: SeveridadDesvio[] = ['en_linea', 'leve', 'critico'];
    const datasets: ChartConfiguration<'scatter'>['data']['datasets'] = grupos.map((sev) => {
      const puntos = comp.animales
        .filter((a) => a.severidad === sev)
        .map((a) => ({ x: a.peso_teorico_kg, y: a.peso_real_kg, caravana: a.caravana }));
      return {
        label: SEVERIDAD_LABEL[sev],
        data: puntos,
        backgroundColor: SEVERIDAD_COLOR[sev],
        pointRadius: 5,
        pointHoverRadius: 7
      };
    });
    const pesos = comp.animales.flatMap((a) => [a.peso_teorico_kg, a.peso_real_kg]);
    if (pesos.length) {
      const min = Math.min(...pesos);
      const max = Math.max(...pesos);
      datasets.push({
        label: 'Referencia (real = teórico)',
        data: [
          { x: min, y: min },
          { x: max, y: max }
        ],
        borderColor: CHART_PALETTE.violet,
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        showLine: true,
        fill: false
      });
    }
    return { datasets };
  }

  opcionesDesvioAnimal: ChartConfiguration<'scatter'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const raw = ctx.raw as { x: number; y: number; caravana?: string };
            const nombre = raw.caravana ? `Caravana ${raw.caravana} — ` : '';
            return `${nombre}teórico ${raw.x} kg, real ${raw.y} kg`;
          }
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Peso teórico esperado (kg)' } },
      y: { title: { display: true, text: 'Peso real relevado (kg)' } }
    }
  };

  get animalesRezagados(): { caravana: string; desvio_pct: number }[] {
    const comp = this.comparacion();
    if (!comp) return [];
    return comp.animales
      .filter((a) => a.severidad === 'critico')
      .sort((a, b) => a.desvio_pct - b.desvio_pct)
      .map((a) => ({ caravana: a.caravana, desvio_pct: a.desvio_pct }));
  }

  get mostrarSemaforo(): boolean {
    return this.resumenes().some((r) => r.gdp_real_kg_dia != null || r.gdp_teorico_kg_dia != null);
  }

  get chartSemaforo(): ChartConfiguration<'bar'>['data'] {
    const datos = this.resumenes().filter((r) => r.gdp_real_kg_dia != null || r.gdp_teorico_kg_dia != null);
    return {
      labels: datos.map((r) => r.lote_nombre),
      datasets: [
        {
          label: 'GDP esperado (plan)',
          data: datos.map((r) => r.gdp_teorico_kg_dia ?? 0),
          backgroundColor: 'rgba(120, 120, 120, 0.35)'
        },
        {
          label: 'GDP real',
          data: datos.map((r) => r.gdp_real_kg_dia ?? 0),
          backgroundColor: datos.map((r) => this.colorEstadoGdp(r))
        }
      ]
    };
  }

  opcionesSemaforo: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${(ctx.raw as number).toFixed(2)} kg/día`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Ganancia diaria de peso (kg/día)' } }
    }
  };

  private colorEstadoGdp(r: ResumenLote): string {
    if (r.gdp_real_kg_dia == null || !r.gdp_teorico_kg_dia) return CHART_PALETTE.blue;
    const ratio = r.gdp_real_kg_dia / r.gdp_teorico_kg_dia;
    if (ratio >= 0.95) return CHART_PALETTE.green;
    if (ratio >= 0.8) return CHART_PALETTE.yellow;
    return CHART_PALETTE.red;
  }
}
