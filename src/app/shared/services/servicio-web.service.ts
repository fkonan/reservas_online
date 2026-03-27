import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/env.dev';
import { ApiResponseServicio, ServicioDetalle } from '../../models/servicio-detalle.model';

@Injectable({ providedIn: 'root' })
export class ServicioWebService {
  private readonly apiUrl = `${environment.baseUrl}api`;
  private readonly http = inject(HttpClient);

  getServicio(id: number): Observable<ServicioDetalle> {
    return this.http
      .get<ApiResponseServicio>(`${this.apiUrl}/servicio-web/${id}`)
      .pipe(map(res => res.data));
  }
}
