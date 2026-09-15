import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AnimalService } from '../../../core/services/animal.service';
import { AnimalDetalle } from '../../../core/models/models';
import { PesajeFormDialogComponent } from '../pesaje-form-dialog/pesaje-form-dialog.component';
import { AnimalFormDialogComponent } from '../animal-form-dialog/animal-form-dialog.component';
import { BajaFormDialogComponent } from '../baja-form-dialog/baja-form-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    BackButtonComponent
  ],
  templateUrl: './animal-detail.component.html'
})
export class AnimalDetailComponent implements OnInit {
  animal = signal<AnimalDetalle | null>(null);
  pesajesCols = ['fecha', 'peso_kg', 'ganancia', 'observaciones', 'acciones'];

  pesajesConGanancia = computed(() => {
    const pesajes = this.animal()?.pesajes ?? [];
    return pesajes.map((p, i) => ({
      ...p,
      ganancia: i === 0 ? '—' : this.formatearGanancia(p.peso_kg - pesajes[i - 1].peso_kg)
    }));
  });

  pesajesPageIndex = signal(0);
  pesajesPageSize = signal(10);
  pesajesPagina = computed(() => {
    const inicio = this.pesajesPageIndex() * this.pesajesPageSize();
    return this.pesajesConGanancia().slice(inicio, inicio + this.pesajesPageSize());
  });

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
    this.animalService.obtener(this.animalId).subscribe((a) => {
      this.animal.set(a);
      this.pesajesPageIndex.set(0);
    });
  }

  onPesajesPage(event: PageEvent): void {
    this.pesajesPageIndex.set(event.pageIndex);
    this.pesajesPageSize.set(event.pageSize);
  }

  private formatearGanancia(diff: number): string {
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

  darDeBaja(): void {
    const ref = this.dialog.open(BajaFormDialogComponent);
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.animalService.darDeBaja(this.animalId, payload).subscribe(() => this.cargar());
      }
    });
  }

  reactivar(): void {
    if (!confirm('¿Reactivar este animal? Vuelve a contar como activo en el lote.')) return;
    this.animalService.reactivar(this.animalId).subscribe(() => this.cargar());
  }
}
