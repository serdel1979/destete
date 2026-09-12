import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AnimalService } from '../../../core/services/animal.service';
import { AnimalDetalle } from '../../../core/models/models';
import { PesajeFormDialogComponent } from '../pesaje-form-dialog/pesaje-form-dialog.component';
import { AnimalFormDialogComponent } from '../animal-form-dialog/animal-form-dialog.component';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './animal-detail.component.html'
})
export class AnimalDetailComponent implements OnInit {
  animal = signal<AnimalDetalle | null>(null);
  pesajesCols = ['fecha', 'peso_kg', 'ganancia', 'observaciones', 'acciones'];

  private animalId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.animalId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.animalService.obtener(this.animalId).subscribe((a) => this.animal.set(a));
  }

  gananciaDesdeAnterior(index: number): string {
    const pesajes = this.animal()?.pesajes ?? [];
    if (index === 0) return '—';
    const diff = pesajes[index].peso_kg - pesajes[index - 1].peso_kg;
    return (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' kg';
  }

  registrarPesaje(): void {
    const ref = this.dialog.open(PesajeFormDialogComponent);
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.animalService.agregarPesaje({ ...payload, animal_id: this.animalId }).subscribe(() => this.cargar());
      }
    });
  }

  eliminarPesaje(id: number): void {
    this.animalService.eliminarPesaje(id).subscribe(() => this.cargar());
  }

  editarAnimal(): void {
    const ref = this.dialog.open(AnimalFormDialogComponent, { data: this.animal() });
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.animalService.actualizar(this.animalId, payload).subscribe(() => this.cargar());
      }
    });
  }

  eliminarAnimal(): void {
    if (!confirm('¿Eliminar este animal y todo su historial de pesajes?')) return;
    this.animalService.eliminar(this.animalId).subscribe(() => this.router.navigate(['/animales']));
  }
}
