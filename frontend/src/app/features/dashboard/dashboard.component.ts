import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { LoteService } from '../../core/services/lote.service';
import { AnimalService } from '../../core/services/animal.service';
import { VentaService } from '../../core/services/venta.service';
import { Animal, Lote, Venta } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  lotes = signal<Lote[]>([]);
  animales = signal<Animal[]>([]);
  ventas = signal<Venta[]>([]);
  loading = signal(true);

  columns = ['nombre', 'estado', 'cantidad_animales', 'fecha_inicio'];

  constructor(
    private loteService: LoteService,
    private animalService: AnimalService,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
    forkJoin({
      lotes: this.loteService.listar(),
      animales: this.animalService.listar(),
      ventas: this.ventaService.listar()
    }).subscribe(({ lotes, animales, ventas }) => {
      this.lotes.set(lotes);
      this.animales.set(animales);
      this.ventas.set(ventas);
      this.loading.set(false);
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
}
