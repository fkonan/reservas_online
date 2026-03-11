import { Component, effect, inject, signal } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SeasonalTreeComponent } from '../../../shared/components/seasonal-tree/seasonal-tree.component';
import { Router, RouterModule } from '@angular/router';
import { Sedes } from '../../../models/sedes.model';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { SedesService } from '../../../shared/services/sedes.service';

@Component({
  selector: 'app-inicio',
  imports: [HeaderComponent, RouterModule, SeasonalTreeComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent {
  private sedesService = inject(SedesService);
  protected readonly sede = signal<Sedes | null>(null);

  constructor(private router: Router) {
    // Establecer ciudad por defecto
    this.sedesService.ciudadSeleccionada.set({ id: 1, ciudad: 'BUCARAMANGA' });

    // Observar cuando se carguen las sedes y tomar la primera
    effect(() => {
      const sedes = this.sedesService.sedes();
      if (sedes.length > 0 && !this.sede()) {
        this.sede.set(sedes[0]);
      }
    });
  }
}
