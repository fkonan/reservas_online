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

  ciudadSeleccionada = signal<Ciudades | undefined>(undefined);

  private sedeResource = rxResource({
    request: this.ciudadSeleccionada,
    loader: (param) => {
      return this.http.get<Sedes[]>(`${this.apiUrl}sedes/${param.request?.id}`).pipe(
        map((sedes) => {
          sedesAdapter(sedes);
          return sedes;
        }),
      );
    },
  });

  sedes = computed(() => this.sedeResource.value() ?? ([] as Sedes[]));
  error = computed(() => this.sedeResource.error() as HttpErrorResponse);
}
