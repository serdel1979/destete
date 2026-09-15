import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./features/estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent)
      },
      {
        path: 'lotes',
        loadComponent: () =>
          import('./features/lotes/lotes-list/lotes-list.component').then((m) => m.LotesListComponent)
      },
      {
        path: 'lotes/:id',
        loadComponent: () =>
          import('./features/lotes/lote-detail/lote-detail.component').then((m) => m.LoteDetailComponent)
      },
      {
        path: 'animales',
        loadComponent: () =>
          import('./features/animales/animales-list/animales-list.component').then(
            (m) => m.AnimalesListComponent
          )
      },
      {
        path: 'animales/:id',
        loadComponent: () =>
          import('./features/animales/animal-detail/animal-detail.component').then(
            (m) => m.AnimalDetailComponent
          )
      },
      {
        path: 'alimentos',
        loadComponent: () =>
          import('./features/alimentos/alimentos-list/alimentos-list.component').then(
            (m) => m.AlimentosListComponent
          )
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas-list/ventas-list.component').then(
            (m) => m.VentasListComponent
          )
      },
      {
        path: 'ayuda',
        loadComponent: () => import('./features/ayuda/ayuda.component').then((m) => m.AyudaComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
