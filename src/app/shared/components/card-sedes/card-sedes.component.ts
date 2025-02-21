import { Component, computed, inject, signal } from '@angular/core';
import { Ciudades } from '../../../models/ciudades.model';
import { Input } from '@angular/core';
import { SedesService } from '../../services/sedes.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-sedes',
  imports: [MatCardModule, RouterModule],
  templateUrl: './card-sedes.component.html',
  styleUrl: './card-sedes.component.scss',
})
export class CardSedesComponent {
  @Input() ciudadSeleccionada = signal<Ciudades | null>(null);
  sedesService = inject(SedesService);
  readonly loading = signal<boolean>(false);
  sedes = computed(() => this._sedes.value());

  _sedes = rxResource({
    request: () => ({ ciudad_id: this.ciudadSeleccionada()?.id }),
    loader: ({ request }) => this.sedesService.getSedes(request.ciudad_id),
  });
}
