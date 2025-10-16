import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { ServiciosComponent } from './public/pages/servicios/servicios.component';
import { ValidarPagoComponent } from './public/pages/validar-pago/validar-pago.component';
import { HorarioComponent } from './public/pages/horario/horario.component';
import { DetallePagoComponent } from './public/pages/detalle-pago/detalle-pago.component';
import { categoriasComponent } from './public/pages/categoria/categorias.component';
import { InicioComponent } from './public/pages/inicio/inicio.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    component: HomeComponent,
  },
  {
    path: 'inicio',
    title: 'Inicio',
    component: InicioComponent,
  },
  {
    path: 'categorias',
    title: 'Categorias',
    component: categoriasComponent,
  },
  {
    path: 'servicios',
    title: 'Servicios',
    component: ServiciosComponent,
  },
  {
    path: 'validar-pago',
    title: 'Validar pago',
    component: ValidarPagoComponent,
  },

  {
    path: 'horario',
    title: 'Seleccionar horario',
    component: HorarioComponent,
  },
  {
    path: 'detalle-pago',
    title: 'Detalle del pago',
    component: DetallePagoComponent,
  },
];
