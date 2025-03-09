import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { Servicios, TipoServicio } from '../../models/servicios.model';
import { ServiciosAdapter } from '../../adapters/servicios.adapter';
import { TipoServiciosAdapter } from '../../adapters/tipoServicios.adapter';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.baseUrl}api`;
  private http = inject(HttpClient);

  tipoServicios = signal<TipoServicio[]>([]);
  servicios = signal<Servicios[]>([]);
  error = signal<string | null>(null);

  constructor() {
    // Cargar datos automáticamente al instanciar el servicio
    this.loadTipoServicio();
  }

  loadTipoServicio(): void {
    this.http
      .get<TipoServicio[]>(`${this.apiUrl}/tipo-servicio`)
      .pipe(
        map((response) => TipoServiciosAdapter(response)),
        catchError((error) => {
          console.error('Error al obtener el tipo de servicio:', error);
          this.error.set('Error al obtener el tipo de servicio');
          return of([]); // Retorna array vacío en caso de error
        }),
      )
      .subscribe((data) => this.tipoServicios.set(data));
  }

  loadServicios(sede_id: number, tipo_servicio_id: number): void {
    this.http
      .get<Servicios[]>(`${this.apiUrl}/servicios-por-sede`, {
        params: {
          sede_id: sede_id,
          tipo_servicio_id: tipo_servicio_id,
        },
      })
      .pipe(
        map((servicios) => ServiciosAdapter(servicios)),
        catchError((error) => {
          console.error('Error al obtener los servicios:', error);
          this.error.set('Error al cargar los servicios');
          return of([]); // Retorna array vacío en caso de error
        }),
      )
      .subscribe((data) => this.servicios.set(data));
  }
}
