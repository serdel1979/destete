import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LoteService } from '../../../core/services/lote.service';
import { Lote } from '../../../core/models/models';
import { LoteFormDialogComponent } from '../lote-form-dialog/lote-form-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-lotes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    BackButtonComponent
  ],
  templateUrl: './lotes-list.component.html'
})
export class LotesListComponent implements OnInit {
  lotes = signal<Lote[]>([]);
  columns = ['nombre', 'estado', 'cantidad_animales', 'peso_inicial_promedio', 'fecha_inicio', 'acciones'];

  pageIndex = signal(0);
  pageSize = signal(10);
  lotesPagina = computed(() => {
    const inicio = this.pageIndex() * this.pageSize();
    return this.lotes().slice(inicio, inicio + this.pageSize());
  });

  constructor(
    private loteService: LoteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loteService.listar().subscribe((lotes) => {
      this.lotes.set(lotes);
      this.pageIndex.set(0);
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  nuevoLote(): void {
    const ref = this.dialog.open(LoteFormDialogComponent, { data: null });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.loteService.crear(payload).subscribe(() => this.cargar());
      }
    });
  }

  editarLote(lote: Lote): void {
    const ref = this.dialog.open(LoteFormDialogComponent, { data: lote });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.loteService.actualizar(lote.id, payload).subscribe(() => this.cargar());
      }
    });
  }

  eliminarLote(lote: Lote): void {
    if (!confirm(`¿Eliminar el lote "${lote.nombre}"?`)) return;
    this.loteService.eliminar(lote.id).subscribe({
      next: () => this.cargar(),
      error: (err) => alert(err?.error?.detail ?? 'No se pudo eliminar')
    });
  }
}
