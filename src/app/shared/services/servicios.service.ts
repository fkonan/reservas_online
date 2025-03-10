import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { map } from 'rxjs';
import { Servicios, TipoServicio } from '../../models/servicios.model';
import { ServiciosAdapter } from '../../adapters/servicios.adapter';
import { TipoServiciosAdapter } from '../../adapters/tipoServicios.adapter';
import { rxResource } from '@angular/core/rxjs-interop';
import { Sedes } from '../../models/sedes.model';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.baseUrl}api`;
  private http = inject(HttpClient);

  private tipoServicioRecourse = rxResource({
    loader: () =>
      this.http.get<TipoServicio[]>(`${this.apiUrl}/tipo-servicio`).pipe(
        map((tipoServicio) => {
          TipoServiciosAdapter(tipoServicio);
          return tipoServicio;
        }),
      ),
  });

  tipoServicio = computed(() => this.tipoServicioRecourse.value() ?? ([] as TipoServicio[]));
  errorTipoServicio = computed(() => this.tipoServicioRecourse.error() as HttpErrorResponse);
  tipoServicioSeleccionado = signal<TipoServicio | undefined>(undefined);
  sedeSeleccionada = signal<Sedes | undefined>(undefined);

  private servicioResource = rxResource({
    request: () => ({
      tipo_servicio: this.tipoServicioSeleccionado(),
      sede: this.sedeSeleccionada(),
    }),
    loader: (param) => {
      return this.http
        .get<Servicios[]>(`${this.apiUrl}sedes`, {
          params: {
            tipo_servicio_id: param.request.tipo_servicio?.id ?? '',
            sede_id: param.request.sede?.id ?? '',
          },
        })
        .pipe(
          map((servicios) => {
            ServiciosAdapter(servicios);
            return servicios;
          }),
        );
    },
  });

  servicios = computed(() => this.servicioResource.value() ?? ([] as Servicios[]));
  errorServicios = computed(() => this.servicioResource.error() as HttpErrorResponse);
}
