import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { map } from 'rxjs';
import { Servicios, TipoServicio } from '../../models/servicios.model';
import { ServiciosAdapter } from '../../adapters/servicios.adapter';
import { TipoServiciosAdapter } from '../../adapters/tipoServicios.adapter';
import { rxResource } from '@angular/core/rxjs-interop';
import { Agenda } from '../../models/agenda.model';
import { AgendaAdapter } from '../../adapters/agenda.adapter';

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

  sedeSeleccionada = signal<number | undefined>(undefined);
  tipoServicio = computed(() => this.tipoServicioRecourse.value() ?? ([] as TipoServicio[]));
  errorTipoServicio = computed(() => this.tipoServicioRecourse.error() as HttpErrorResponse);
  tipoServicioSeleccionado = signal<number | undefined>(undefined);
  servicioSeleccionado = signal<Servicios | null>(null);

  private servicioResource = rxResource({
    request: () => ({
      tipo_servicio: this.tipoServicioSeleccionado(),
      sede: this.sedeSeleccionada(),
    }),
    loader: (param) => {
      return this.http
        .post<Servicios[]>(`${this.apiUrl}/servicios-por-sede`, {
          tipo_servicio_id: param.request.tipo_servicio ?? '',
          sede_id: param.request.sede ?? '',
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

  selectedDate = signal<Date | undefined>(undefined);

  private agendaResource = rxResource({

    request: () => ({
      sede_id: this.sedeSeleccionada(),
      tipo_servicio_id: this.tipoServicioSeleccionado(),
      servicio_id: this.servicioSeleccionado(),
      fecha: this.selectedDate(),
    }),

    loader: (param) => {
      return this.http
        .post<Agenda[]>(`${this.apiUrl}/agenda-web`, {
          sede_id: param.request.sede_id ?? '',
          tipo_servicio_id: param.request.tipo_servicio_id ?? '',
          fecha: param.request.fecha ?? '',
        })
        .pipe(
          map((agenda) => {

            return AgendaAdapter(agenda);
          }),
        );
    },
  });

  agenda = computed(() => this.agendaResource.value() ?? ([] as Agenda[]));
  errorAgenda = computed(() => this.agendaResource.error() as HttpErrorResponse);
}
