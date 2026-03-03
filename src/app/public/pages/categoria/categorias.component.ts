import { ServiciosService } from '../../../shared/services/servicios.service';
import {
  Component,
  inject,
  Signal,
  ChangeDetectionStrategy,
  signal,
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
export class CategoriasComponent {
  private readonly servicioService = inject(ServiciosService);
  private readonly router = inject(Router);

  protected readonly categorias = this.servicioService.categorias;
  protected readonly sede = signal<Sedes | null>(null);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const sedeData = navigation?.extras.state?.['sede'] as Sedes | undefined;

    if (sedeData) {
      this.sede.set(sedeData);
      this.servicioService.sedeSeleccionada.set(sedeData.id);
    }
  }
}
