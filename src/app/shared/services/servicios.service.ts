import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { map } from 'rxjs';
import { CategoriaServicio, TipoServicio } from '../../models/servicios.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { Agenda } from '../../models/agenda.model';
import { AgendaAdapter } from '../../adapters/agenda.adapter';
import { CategoriasAdapter } from '../../adapters/categorias.adapter';
import { ServicioDetalle } from '../../models/servicio-detalle.model';

export const DEFAULT_SEDE_ID = 3;

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.baseUrl}api`;
  private http = inject(HttpClient);

  sedeSeleccionada = signal<number>(DEFAULT_SEDE_ID);

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

  servicioSeleccionado = signal<ServicioDetalle | null>(null);
  selectedDate = signal<Date | undefined>(new Date());
  valorAbono = signal<number>(0);

  private agendaResource = rxResource({
  params: () => {
    const fecha = this.selectedDate();
    const servicio = this.servicioSeleccionado();
    const sede_id = this.sedeSeleccionada();

    // No hacer la petición si no hay fecha o servicio seleccionado
    if (!fecha || !servicio) return undefined;

    return {
      sede_id,
      servicio: servicio.tipo_servicio_id,
      servicio_id: servicio.id,
      fecha,
    };
  },

  stream: ({ params }) => {
    return this.http
      .post<any>(`${this.apiUrl}/agenda-web`, {
        sede_id: params.sede_id ?? '',
        tipo_servicio_id: params.servicio ?? '1234',
        servicio_id: params.servicio_id ?? '',
        fecha: params.fecha,
      })
      .pipe(
        map((response) => {
          const slots: any[] = Array.isArray(response.data)
            ? response.data
            : (Object.values(response.data) as any[]).flat();
          const valorAbono = slots[0]?.valor_abono;
          if (valorAbono) {
            this.valorAbono.set(valorAbono);
            localStorage.setItem('valorAbono', String(valorAbono));
          }
          return AgendaAdapter(response);
        }),
      );
  },
});

  agenda = computed(() => this.agendaResource.value() ?? ([] as Agenda[]));
  errorAgenda = computed(() => this.agendaResource.error() as HttpErrorResponse);
}
