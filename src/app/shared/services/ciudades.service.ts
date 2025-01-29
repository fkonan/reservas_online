import { ciudadesAdapter } from './../../adapters/ciudades.adapter';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, Observable } from 'rxjs';
import { Ciudades } from '../../models/ciudades.model';

@Injectable({
  providedIn: 'root',
})
export class CiudadesService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  getCiudades(): Observable<Ciudades[]> {
    return this.http.get<Ciudades[]>(`${this.apiUrl}ciudades`).pipe(
      map((ciudades) => {
        ciudadesAdapter(ciudades);
        return ciudades;
      }),
      catchError((error) => {
        console.error('Error al obtener ciudades:', error);
        throw new Error('Error al cargar las ciudades');
      }),
    );
  }
}
