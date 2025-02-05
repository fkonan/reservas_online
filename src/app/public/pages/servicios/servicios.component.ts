import { ServiciosService } from './../../../shared/services/servicios.service';
import { Component, inject, signal } from '@angular/core';
import { CardSedeComponent } from '../../../shared/components/card-sede/card-sede.component';
import { Router } from '@angular/router';
import { Sedes } from '../../../shared/models/sedes.model';
import { Servicios } from '../../../shared/models/servicios.model';

@Component({
  selector: 'app-servicios',
  imports: [CardSedeComponent],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  sede: Sedes;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
  }

  servicios: Servicios[] = [];
  servicioSeleccionado = signal<Servicios | null>(null);

  serviciosService = inject(ServiciosService);
  readonly loading = signal<boolean>(false);

  ngOnInit() {
    if (this.serviciosService) {
      this.serviciosService.getServicios(this.sede.id).subscribe({
        next: (data) => (this.servicios = data),
        error: (err) => console.error('Error en componente:', err),
      });
    }
  }
}
