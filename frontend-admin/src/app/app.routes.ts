import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      { path: 'panel', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'eventos', loadComponent: () => import('./pages/events/events').then((m) => m.Events) },
      { path: 'oracion', loadComponent: () => import('./pages/prayer-requests/prayer-requests').then((m) => m.PrayerRequests) },
      { path: 'redes', loadComponent: () => import('./pages/networks/networks').then((m) => m.Networks) },
      { path: 'horarios', loadComponent: () => import('./pages/schedules/schedules').then((m) => m.Schedules) },
      { path: 'enlaces', loadComponent: () => import('./pages/links/links').then((m) => m.Links) },
      { path: 'contenido', loadComponent: () => import('./pages/content/content').then((m) => m.ContentPage) },
      { path: 'imagenes', loadComponent: () => import('./pages/images/images').then((m) => m.ImagesPage) },
      { path: 'cuenta', loadComponent: () => import('./pages/account/account').then((m) => m.Account) },
    ],
  },
  { path: '**', redirectTo: '' },
];
