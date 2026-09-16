import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ColorFondo, ConfiguracionApp, PaletaColor } from '../models/models';

const BASE = '/api/v1/config';

interface TonosPaleta {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
}

export const PALETAS: Record<PaletaColor, TonosPaleta> = {
  verde: {
    primary: '#1F5D46',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E3EFE7',
    onPrimaryContainer: '#163F30'
  },
  azul: {
    primary: '#1F4E79',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E2ECF4',
    onPrimaryContainer: '#163A57'
  },
  terracota: {
    primary: '#8A4B32',
    onPrimary: '#FFFFFF',
    primaryContainer: '#F3E3DA',
    onPrimaryContainer: '#5C3220'
  },
  violeta: {
    primary: '#5B4B8A',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E9E4F3',
    onPrimaryContainer: '#3C2F63'
  },
  grafito: {
    primary: '#46545C',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E4E9EB',
    onPrimaryContainer: '#29343A'
  }
};

export const NOMBRES_PALETA: Record<PaletaColor, string> = {
  verde: 'Verde',
  azul: 'Azul',
  terracota: 'Terracota',
  violeta: 'Violeta',
  grafito: 'Grafito'
};

export const FONDOS: Record<ColorFondo, string> = {
  crema: '#F6F3EC',
  blanco: '#FFFFFF',
  gris: '#F0F0EE',
  arena: '#F5ECDD',
  celeste: '#EAF1F4'
};

export const NOMBRES_FONDO: Record<ColorFondo, string> = {
  crema: 'Crema',
  blanco: 'Blanco',
  gris: 'Gris',
  arena: 'Arena',
  celeste: 'Celeste'
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private http: HttpClient) {}

  obtener(): Observable<ConfiguracionApp> {
    return this.http.get<ConfiguracionApp>(BASE);
  }

  actualizarPaleta(paleta: PaletaColor): Observable<ConfiguracionApp> {
    return this.http.put<ConfiguracionApp>(BASE, { paleta }).pipe(tap(() => this.aplicarPaleta(paleta)));
  }

  actualizarFondo(fondo: ColorFondo): Observable<ConfiguracionApp> {
    return this.http.put<ConfiguracionApp>(BASE, { fondo }).pipe(tap(() => this.aplicarFondo(fondo)));
  }

  aplicarPaleta(paleta: PaletaColor): void {
    const tonos = PALETAS[paleta];
    const root = document.documentElement.style;
    root.setProperty('--mat-sys-primary', tonos.primary);
    root.setProperty('--mat-sys-on-primary', tonos.onPrimary);
    root.setProperty('--mat-sys-primary-container', tonos.primaryContainer);
    root.setProperty('--mat-sys-on-primary-container', tonos.onPrimaryContainer);
  }

  aplicarFondo(fondo: ColorFondo): void {
    document.documentElement.style.setProperty('--mat-sys-background', FONDOS[fondo]);
  }

  cargarYAplicar(): void {
    this.obtener().subscribe({
      next: (config) => {
        this.aplicarPaleta(config.paleta);
        this.aplicarFondo(config.fondo);
      },
      error: () => {}
    });
  }
}
