import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';
import { LoteService } from '../../../core/services/lote.service';
import { AnimalService } from '../../../core/services/animal.service';
import { AlimentacionService } from '../../../core/services/alimentacion.service';
import { Animal, CurvaDiaria, Lote, PlanAlimentacion, ResumenLote } from '../../../core/models/models';
import { PlanFormDialogComponent } from '../plan-form-dialog/plan-form-dialog.component';
import { LoteFormDialogComponent } from '../lote-form-dialog/lote-form-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-lote-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatPaginatorModule,
    BackButtonComponent
  ],
  templateUrl: './lote-detail.component.html'
})
export class LoteDetailComponent implements OnInit {
  lote = signal<Lote | null>(null);
  animales = signal<Animal[]>([]);
  plan = signal<PlanAlimentacion[]>([]);
  curva = signal<CurvaDiaria[]>([]);
  resumen = signal<ResumenLote | null>(null);

  animalesCols = ['caravana', 'sexo', 'estado', 'peso_actual_kg', 'fecha_ultimo_pesaje'];
  planCols = ['fase', 'dia_desde', 'dia_hasta', 'pct_consumo_pv', 'adpv_esperado_kg', 'costo_kg', 'acciones'];
  curvaCols = ['dia', 'fecha', 'fase', 'peso_teorico_kg', 'racion_teorica_kg', 'costo_diario', 'costo_acumulado'];

  animalesPageIndex = signal(0);
  animalesPageSize = signal(10);
  animalesPagina = computed(() => {
    const inicio = this.animalesPageIndex() * this.animalesPageSize();
    return this.animales().slice(inicio, inicio + this.animalesPageSize());
  });

  curvaPageIndex = signal(0);
  curvaPageSize = signal(10);
  curvaPagina = computed(() => {
    const inicio = this.curvaPageIndex() * this.curvaPageSize();
    return this.curva().slice(inicio, inicio + this.curvaPageSize());
  });

  private loteId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loteService: LoteService,
    private animalService: AnimalService,
    private alimentacionService: AlimentacionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarTodo();
  }

  cargarTodo(): void {
    forkJoin({
      lote: this.loteService.obtener(this.loteId),
      animales: this.animalService.listar({ lote_id: this.loteId }),
      plan: this.alimentacionService.plan(this.loteId),
      resumen: this.alimentacionService.resumen(this.loteId)
    }).subscribe(({ lote, animales, plan, resumen }) => {
      this.lote.set(lote);
      this.animales.set(animales);
      this.animalesPageIndex.set(0);
      this.plan.set(plan);
      this.resumen.set(resumen);
      this.cargarCurva();
    });
  }

  cargarCurva(): void {
    this.alimentacionService.curvaTeorica(this.loteId).subscribe((curva) => {
      this.curva.set(curva);
      this.curvaPageIndex.set(0);
    });
  }

  onAnimalesPage(event: PageEvent): void {
    this.animalesPageIndex.set(event.pageIndex);
    this.animalesPageSize.set(event.pageSize);
  }

  onCurvaPage(event: PageEvent): void {
    this.curvaPageIndex.set(event.pageIndex);
    this.curvaPageSize.set(event.pageSize);
  }

  agregarEtapa(): void {
    const ref = this.dialog.open(PlanFormDialogComponent, { data: { orden: this.plan().length + 1 } });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.alimentacionService
          .crearEtapa({ ...payload, lote_id: this.loteId, orden: this.plan().length + 1 })
          .subscribe(() => this.cargarTodo());
      }
    });
  }

  eliminarEtapa(id: number): void {
    this.alimentacionService.eliminarEtapa(id).subscribe(() => this.cargarTodo());
  }

  editarLote(): void {
    const ref = this.dialog.open(LoteFormDialogComponent, { data: this.lote() });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.loteService.actualizar(this.loteId, payload).subscribe(() => this.cargarTodo());
      }
    });
  }

  eliminarLote(): void {
    const lote = this.lote();
    if (!lote) return;
    if (!confirm(`¿Eliminar el lote "${lote.nombre}"?`)) return;
    this.loteService.eliminar(this.loteId).subscribe({
      next: () => this.router.navigate(['/lotes']),
      error: (err) => alert(err?.error?.detail ?? 'No se pudo eliminar')
    });
  }
}
