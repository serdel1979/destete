import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlimentoService } from '../../../core/services/alimento.service';
import { Alimento } from '../../../core/models/models';
import { AlimentoFormDialogComponent } from '../alimento-form-dialog/alimento-form-dialog.component';

@Component({
  selector: 'app-alimentos-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './alimentos-list.component.html'
})
export class AlimentosListComponent implements OnInit {
  alimentos = signal<Alimento[]>([]);
  columns = ['nombre', 'costo_kg_referencia', 'kg_por_bolsa', 'activo', 'acciones'];

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

  eliminarAlimento(alimento: Alimento): void {
    if (!confirm(`¿Eliminar "${alimento.nombre}"?`)) return;
    this.alimentoService.eliminar(alimento.id).subscribe({
      next: () => this.cargar(),
      error: (err) => alert(err?.error?.detail ?? 'No se pudo eliminar')
    });
  }
}
