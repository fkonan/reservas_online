import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { environment } from '../../environments/env.dev';
import { Promocion, PromocionesResponse } from '../../models/promociones.model';

@Injectable({
  providedIn: 'root',
})
export class PromocionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}api/promociones-vigentes`;

  private promoResource = rxResource({
    stream: () =>
      this.http
        .get<PromocionesResponse>(this.apiUrl, {
          headers: {
            Authorization: `Bearer ${environment.APP_TOKEN}`,
            Accept: 'application/json',
          },
        })
        .pipe(map((res) => res.data ?? [])),
  });

  readonly promociones = computed<Promocion[]>(() => this.promoResource.value() ?? []);
  readonly isLoading = computed(() => this.promoResource.isLoading());
  readonly error = computed(() => this.promoResource.error());
}
