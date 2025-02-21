import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, Observable, startWith } from 'rxjs';
import { Sedes } from '../../models/sedes.model';
import { sedesAdapter } from '../../adapters/sedes.adapter';

@Injectable({
  providedIn: 'root',
})
export class SedesService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  getSedes(ciudad_id: number | undefined): Observable<Sedes[]> {
    return this.http.get<Sedes[]>(`${this.apiUrl}sedes/${ciudad_id}`).pipe(
      map((sedes) => {
        return sedesAdapter(sedes);
      }),
      catchError((error) => {
        console.error('Error al obtener las sedes:', error);
        throw new Error('Error al cargar las sedes');
      }),
    );
  }

  getSedesById(id: number | undefined): Observable<Sedes[]> {
    return this.http.get<Sedes[]>(`${this.apiUrl}sedesById/${id}`).pipe(
      map((sedes) => {
        return sedesAdapter(sedes);
      }),
      catchError((error) => {
        console.error('Error al obtener la sede:', error);
        throw new Error('Error al cargar la sede');
      }),
    );
  }
}
