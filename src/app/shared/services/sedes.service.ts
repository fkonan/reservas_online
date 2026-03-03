import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, Observable, startWith } from 'rxjs';
import { Sedes } from '../../models/sedes.model';
import { sedesAdapter } from '../../adapters/sedes.adapter';
import { rxResource } from '@angular/core/rxjs-interop';
import { Ciudades } from '../../models/ciudades.model';

@Injectable({
  providedIn: 'root',
})
export class SedesService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  ciudadSeleccionada = signal<Ciudades | undefined>(this.getCiudadFromStorage());

  private sedeResource = rxResource({
    params: () => this.ciudadSeleccionada(),
    stream: ({ params }) => {
      if (params) {
        // Guardar en localStorage cuando se hace la petición
        localStorage.setItem('ciudadSeleccionada', JSON.stringify(params));
      }
      return this.http.get<Sedes[]>(`${this.apiUrl}sedes/${params?.id}`).pipe(
        map((sedes) => {
          sedesAdapter(sedes);
          return sedes;
        }),
      );
    },
  });

  private getCiudadFromStorage(): Ciudades | undefined {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('ciudadSeleccionada');
      return stored ? JSON.parse(stored) : undefined;
    }
    return undefined;
  }

  sedes = computed(() => this.sedeResource.value() ?? ([] as Sedes[]));
  error = computed(() => this.sedeResource.error() as HttpErrorResponse);
}
