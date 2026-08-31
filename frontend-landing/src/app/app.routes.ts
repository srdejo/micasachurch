import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'devocional',
    loadComponent: () => import('./pages/devocional/devocional').then((m) => m.Devocional),
  },
];
