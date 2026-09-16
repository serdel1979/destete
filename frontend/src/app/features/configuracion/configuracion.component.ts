import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService, FONDOS, NOMBRES_FONDO, NOMBRES_PALETA, PALETAS } from '../../core/services/config.service';
import { ColorFondo, PaletaColor } from '../../core/models/models';
import { BackButtonComponent } from '../../shared/back-button/back-button.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, MatIconModule, BackButtonComponent],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent implements OnInit {
  paletas = Object.keys(PALETAS) as PaletaColor[];
  nombresPaleta = NOMBRES_PALETA;
  tonosPaleta = PALETAS;

  fondos = Object.keys(FONDOS) as ColorFondo[];
  nombresFondo = NOMBRES_FONDO;
  tonosFondo = FONDOS;

  paletaActual = signal<PaletaColor | null>(null);
  fondoActual = signal<ColorFondo | null>(null);
  guardando = signal<string | null>(null);

  constructor(
    private configService: ConfigService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.configService.obtener().subscribe((config) => {
      this.paletaActual.set(config.paleta);
      this.fondoActual.set(config.fondo);
    });
  }

  seleccionarPaleta(paleta: PaletaColor): void {
    if (paleta === this.paletaActual() || this.guardando()) return;
    this.guardando.set(paleta);
    this.configService.actualizarPaleta(paleta).subscribe({
      next: () => {
        this.paletaActual.set(paleta);
        this.guardando.set(null);
        this.snackBar.open('Color principal actualizado', 'Cerrar', { duration: 2500 });
      },
      error: () => {
        this.guardando.set(null);
        this.snackBar.open('No se pudo actualizar el color', 'Cerrar', { duration: 3000 });
      }
    });
  }

  seleccionarFondo(fondo: ColorFondo): void {
    if (fondo === this.fondoActual() || this.guardando()) return;
    this.guardando.set(fondo);
    this.configService.actualizarFondo(fondo).subscribe({
      next: () => {
        this.fondoActual.set(fondo);
        this.guardando.set(null);
        this.snackBar.open('Color de fondo actualizado', 'Cerrar', { duration: 2500 });
      },
      error: () => {
        this.guardando.set(null);
        this.snackBar.open('No se pudo actualizar el fondo', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
