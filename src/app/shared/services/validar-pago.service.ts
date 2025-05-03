import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ValidarPagoService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  validarPago(link: string) {
    const url = `${this.apiUrl}api/payment/validate/${link}`;
    return this.http.get(url);
  }
}
