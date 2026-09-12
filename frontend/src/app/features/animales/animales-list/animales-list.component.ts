import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AnimalService } from '../../../core/services/animal.service';
import { LoteService } from '../../../core/services/lote.service';
import { Animal, Lote } from '../../../core/models/models';
import { AnimalFormDialogComponent } from '../animal-form-dialog/animal-form-dialog.component';

@Component({
  selector: 'app-animales-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './animales-list.component.html'
})
export class AnimalesListComponent implements OnInit {
  animales = signal<Animal[]>([]);
  lotes = signal<Lote[]>([]);

  filtroCaravana = '';
  filtroLote: number | null = null;
  filtroEstado = '';

  columns = ['caravana', 'sexo', 'lote', 'estado', 'peso_actual_kg', 'fecha_ultimo_pesaje', 'acciones'];

  constructor(
    private animalService: AnimalService,
    private loteService: LoteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loteService.listar().subscribe((lotes) => this.lotes.set(lotes));
    this.cargar();
  }

  cargar(): void {
    this.animalService
      .listar({
        caravana: this.filtroCaravana || undefined,
        lote_id: this.filtroLote ?? undefined,
        estado: this.filtroEstado || undefined
      })
      .subscribe((animales) => this.animales.set(animales));
  }

  nombreLote(loteId: number | null): string {
    if (!loteId) return '—';
    return this.lotes().find((l) => l.id === loteId)?.nombre ?? '—';
  }

  nuevoAnimal(): void {
    const ref = this.dialog.open(AnimalFormDialogComponent, { data: null });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.animalService.crear(payload).subscribe(() => this.cargar());
      }
    });
  }
}
