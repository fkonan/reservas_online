import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { ServiciosComponent } from './public/pages/servicios/servicios.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio',
    component: HomeComponent,
  },
  {
    path: 'servicios',
    title: 'Servicios',
    component: ServiciosComponent,
  },
];
