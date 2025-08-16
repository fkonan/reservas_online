import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { map } from 'rxjs';
import { CategoriaServicio, Servicios, TipoServicio } from '../../models/servicios.model';
import { ServiciosAdapter } from '../../adapters/servicios.adapter';
import { TipoServiciosAdapter } from '../../adapters/tipoServicios.adapter';
import { rxResource } from '@angular/core/rxjs-interop';
import { Agenda } from '../../models/agenda.model';
import { AgendaAdapter } from '../../adapters/agenda.adapter';
import { CategoriasAdapter } from '../../adapters/categorias.adapter';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.baseUrl}api`;
  private http = inject(HttpClient);

  sedeSeleccionada = signal<number | undefined>(undefined);

  categorias = computed(() => this.categoriaSedeRecourse.value() ?? ([] as CategoriaServicio[]));

  private categoriaSedeRecourse = rxResource({
    loader: () =>
      this.http.get<any>(`${this.apiUrl}/categorias-por-sede/${this.sedeSeleccionada()}`).pipe(
        map((categorias) => {
          return ServiciosAdapter(categorias);
        }),
      ),
  });

  servicioSeleccionado = signal<Servicios | null>(null);
  selectedDate = signal<Date | undefined>(undefined);

  private agendaResource = rxResource({
    request: () => ({
      sede_id: this.sedeSeleccionada(),
      servicio: this.servicioSeleccionado()?.tipo_servicio_id,
      fecha: this.selectedDate(),
    }),

    loader: (param) => {
      return this.http
        .post<Agenda[]>(`${this.apiUrl}/agenda-web`, {
          sede_id: param.request.sede_id ?? '',
          tipo_servicio_id: param.request.servicio ?? '1234',
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
