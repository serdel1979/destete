import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private contador = signal(0);

  isLoading = computed(() => this.contador() > 0);

  iniciar(): void {
    this.contador.update((n) => n + 1);
  }

  finalizar(): void {
    this.contador.update((n) => Math.max(0, n - 1));
  }
}
