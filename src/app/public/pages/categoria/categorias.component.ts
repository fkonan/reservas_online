import { ServiciosService } from '../../../shared/services/servicios.service';
import {
  Component,
  inject,
  Signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Sedes } from '../../../models/sedes.model';
import { CategoriaServicio } from '../../../models/servicios.model';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-categorias',
  imports: [CommonModule, RouterModule, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss',
})
export class categoriasComponent {
  private servicioService = inject(ServiciosService);

  categorias: Signal<CategoriaServicio[]> = this.servicioService.categorias;

  sede: Sedes;

  constructor(private router: Router) {

    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
    this.servicioService.sedeSeleccionada.set(this.sede.id);
  }
}
