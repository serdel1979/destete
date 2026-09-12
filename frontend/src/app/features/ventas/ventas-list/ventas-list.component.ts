import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { VentaService } from '../../../core/services/venta.service';
import { AnimalService } from '../../../core/services/animal.service';
import { Animal, Venta } from '../../../core/models/models';
import { VentaFormDialogComponent } from '../venta-form-dialog/venta-form-dialog.component';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './ventas-list.component.html'
})
export class VentasListComponent implements OnInit {
  ventas = signal<Venta[]>([]);
  animales = signal<Animal[]>([]);
  columns = ['caravana', 'fecha_venta', 'peso_venta_kg', 'precio_kg', 'precio_total', 'comprador', 'acciones'];

  constructor(
    private ventaService: VentaService,
    private animalService: AnimalService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    forkJoin({ ventas: this.ventaService.listar(), animales: this.animalService.listar() }).subscribe(
      ({ ventas, animales }) => {
        this.ventas.set(ventas);
        this.animales.set(animales);
      }
    );
  }

  caravana(animalId: number): string {
    return this.animales().find((a) => a.id === animalId)?.caravana ?? '—';
  }

  get ingresoTotal(): number {
    return this.ventas().reduce((acc, v) => acc + v.precio_total, 0);
  }

  nuevaVenta(): void {
    const ref = this.dialog.open(VentaFormDialogComponent);
    ref.afterClosed().subscribe((payload) => {
      if (payload) {
        this.ventaService.registrar(payload).subscribe(() => this.cargar());
      }
    });
  }

  anular(id: number): void {
    if (!confirm('¿Anular esta venta? El animal vuelve a estado activo.')) return;
    this.ventaService.anular(id).subscribe(() => this.cargar());
  }
}
