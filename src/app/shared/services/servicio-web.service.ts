import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/env.dev';
import { ApiResponseServicio, ServicioDetalle } from '../../models/servicio-detalle.model';

@Injectable({ providedIn: 'root' })
export class ServicioWebService {
  private readonly apiUrl = `${environment.baseUrl}api`;
  private readonly http = inject(HttpClient);

  getServicio(id: number): Observable<ServicioDetalle> {
    return this.http
      .get<ApiResponseServicio>(`${this.apiUrl}/servicio-web/${id}`)
      .pipe(
        map(res => {
          if (!res.success || !res.data) {
            throw new Error(res.message ?? 'Servicio no encontrado o no disponible.');
          }
          return res.data;
        }),
        catchError((err: unknown) => {
          if (err instanceof Error) return throwError(() => err);
          const httpErr = err as HttpErrorResponse;
          const msg =
            httpErr?.error?.message ??
            httpErr?.message ??
            'No se pudo cargar la información del servicio.';
          return throwError(() => new Error(msg));
        })
      );
  }
}
