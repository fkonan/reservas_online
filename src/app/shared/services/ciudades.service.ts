import { ciudadesAdapter } from './../../adapters/ciudades.adapter';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { map } from 'rxjs';
import { Ciudades } from '../../models/ciudades.model';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CiudadesService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  private ciudadesRecourse = rxResource({
    loader: () =>
      this.http.get<Ciudades[]>(`${this.apiUrl}ciudades`).pipe(
        map((ciudades) => {
          ciudadesAdapter(ciudades);
          return ciudades;
        }),
      ),
  });

  ciudades = computed(() => this.ciudadesRecourse.value() ?? ([] as Ciudades[]));
  error = computed(() => this.ciudadesRecourse.error() as HttpErrorResponse);
}
