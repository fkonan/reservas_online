import { CiudadesService } from './../../../shared/services/ciudades.service';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Ciudades } from '../../../models/ciudades.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { SedesService } from '../../../shared/services/sedes.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  ciudades: Ciudades[] = [];
  ciudadSeleccionada = signal<Ciudades | null>(null);

  ciudadesService = inject(CiudadesService);
  sedesService = inject(SedesService);
  readonly loading = signal<boolean>(false);

  sedes = computed(() => this._sedes.value());

  ngOnInit() {
    if (this.ciudadesService) {
      this.ciudadesService.getCiudades().subscribe({
        next: (data) => (this.ciudades = data),
        error: (err) => console.error('Error en componente:', err),
      });
    }
  }

  _sedes = rxResource({
    request: () => ({ ciudad_id: this.ciudadSeleccionada()?.id }),
    loader: ({ request }) => this.sedesService.getSedes(request.ciudad_id),
  });
}

