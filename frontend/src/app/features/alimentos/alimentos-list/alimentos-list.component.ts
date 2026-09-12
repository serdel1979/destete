import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlimentoService } from '../../../core/services/alimento.service';
import { Alimento } from '../../../core/models/models';
import { AlimentoFormDialogComponent } from '../alimento-form-dialog/alimento-form-dialog.component';
import { MovimientoFormDialogComponent } from '../movimiento-form-dialog/movimiento-form-dialog.component';

@Component({
  selector: 'app-alimentos-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule],
  templateUrl: './alimentos-list.component.html'
})
export class AlimentosListComponent implements OnInit {
  alimentos = signal<Alimento[]>([]);
  columns = ['nombre', 'stock_actual_kg', 'stock_minimo_kg', 'costo_kg_referencia', 'activo', 'acciones'];

  constructor(
    private alimentoService: AlimentoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.alimentoService.listar().subscribe((alimentos) => this.alimentos.set(alimentos));
  }

  get alimentosBajoStock(): number {
    return this.alimentos().filter((a) => a.stock_bajo).length;
  }

  nuevoAlimento(): void {
    const ref = this.dialog.open(AlimentoFormDialogComponent, { data: null, width: '480px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.alimentoService.crear(payload).subscribe(() => this.cargar());
      }
    });
  }

  editarAlimento(alimento: Alimento): void {
    const ref = this.dialog.open(AlimentoFormDialogComponent, { data: alimento, width: '480px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.alimentoService.actualizar(alimento.id, payload).subscribe(() => this.cargar());
      }
    });
  }

  registrarMovimiento(alimento: Alimento): void {
    const ref = this.dialog.open(MovimientoFormDialogComponent, {
      data: alimento,
      width: '480px',
      maxWidth: '95vw'
    });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.alimentoService.registrarMovimiento(alimento.id, payload).subscribe(() => this.cargar());
      }
    });
  }

  eliminarAlimento(alimento: Alimento): void {
    if (!confirm(`¿Eliminar "${alimento.nombre}"?`)) return;
    this.alimentoService.eliminar(alimento.id).subscribe({
      next: () => this.cargar(),
      error: (err) => alert(err?.error?.detail ?? 'No se pudo eliminar')
    });
  }
}
