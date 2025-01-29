import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, Observable } from 'rxjs';
import { Sedes } from '../models/sedes.model';
import { sedesAdapter } from '../../adapters/sedes.adapter';

@Injectable({
  providedIn: 'root',
})
export class SedesService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  getSedes(ciudad_id: number): Observable<Sedes[]> {
    return this.http.get<Sedes[]>(`${this.apiUrl}sedes/${ciudad_id}`).pipe(
      map((sedes) => {
        sedesAdapter(sedes);
        return sedes;
      }),
      catchError((error) => {
        console.error('Error al obtener ciudades:', error);
        throw new Error('Error al cargar las ciudades');
      }),
    );
  }
}
