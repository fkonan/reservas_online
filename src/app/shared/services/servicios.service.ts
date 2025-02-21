import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, Observable, startWith } from 'rxjs';
import { Servicios } from '../../models/servicios.model';
import { ServiciosAdapter } from '../../adapters/servicios.adapter';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.baseUrl}api/`;
  private http = inject(HttpClient);

  getTipoServicio(sede_id: number): Observable<Servicios[]> {
    debugger
    return this.http.get<Servicios[]>(`${this.apiUrl}servicios/getTipoServicio/${sede_id}`).pipe(
      map((servicios) => {
        return ServiciosAdapter(servicios);
      }),
      catchError((error) => {
        console.error('Error al obtener las sedes:', error);
        throw new Error('Error al cargar las sedes');
      }),
    );
  }

  getServicios(sede_id: number): Observable<Servicios[]> {
    return this.http.get<Servicios[]>(`${this.apiUrl}servicios/getBySede/${sede_id}`).pipe(
      map((servicios) => {
        return ServiciosAdapter(servicios);
      }),
      catchError((error) => {
        console.error('Error al obtener las sedes:', error);
        throw new Error('Error al cargar las sedes');
      }),
    );
  }

  getHorarios(fecha: string, tipo_servicio_id: number, servicio_id: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}agenda/getHorarios/${fecha}/${tipo_servicio_id}/${servicio_id}`)
      .pipe(
        map((horarios) => {
          return horarios;
        }),
        catchError((error) => {
          console.error('Error al obtener las sedes:', error);
          throw new Error('Error al cargar las sedes');
        }),
      );
  }
}
