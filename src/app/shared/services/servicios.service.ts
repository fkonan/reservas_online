import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { map } from 'rxjs';
import { CategoriaServicio, Servicios, TipoServicio } from '../../models/servicios.model';
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
    params: () => {
      const sedeId = this.sedeSeleccionada();
      // Retornar undefined para evitar que se haga la petición si no hay sede seleccionada
      return sedeId ? { sedeId } : undefined;
    },
    stream: ({ params }) =>
      this.http.get<any>(`${this.apiUrl}/categorias-por-sede/${params?.sedeId}`).pipe(
        map((categorias) => {
          return CategoriasAdapter(categorias);
        }),
      ),
  });

  servicioSeleccionado = signal<Servicios | null>(null);
  selectedDate = signal<Date | undefined>(new Date());

  private agendaResource = rxResource({
    params: () => ({
      sede_id: this.sedeSeleccionada(),
      servicio: this.servicioSeleccionado()?.tipo_servicio_id,
      fecha: this.selectedDate(),
    }),

    stream: ({ params }) => {
      return this.http
        .post<Agenda[]>(`${this.apiUrl}/agenda-web`, {
          sede_id: params.sede_id ?? '',
          tipo_servicio_id: params.servicio ?? '1234',
          fecha: params.fecha ?? '',
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
