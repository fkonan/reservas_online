import { HttpClient } from '@angular/common/http';
import {inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { finalize, map, Observable } from 'rxjs';
import { AgendaRequest, AgendaResponse } from '../../models/agenda.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  // Signals para mantener estado de la última transacción
  transactionUrl = signal<string | null>(null);
  transactionId = signal<string | null>(null);
  transactionError = signal<string | null>(null);

  generatePaymentLink(agenda: AgendaRequest): Observable<AgendaResponse> {
    // Mostrar toast de carga
    const loadingSnackBarRef = this.snackBar.open('Generando link de pago...', '', {
      duration: 0,
      panelClass: ['loading-snackbar'],
    });

    return this.http.post<AgendaResponse>(`${this.apiUrl}api/payment/generate-link`, agenda)
    .pipe(
      finalize(() => {
        loadingSnackBarRef.dismiss(); // Cerrar el snackbar de carga
      }),
      map((response) => {
        if (response.success) {
          this.transactionUrl.set(response.data.url);
          this.transactionId.set(response.data.transaction_id);

          // Mostrar toast de éxito
          this.snackBar.open('Link de pago generado con éxito, en un momento sera redireccionado.', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar'],
          });

          // Redirigir después de un breve retraso para permitir que el usuario vea el mensaje
          setTimeout(() => {
            window.location.href = response.data.url; // Redirige a la URL externa
          }, 2000);
        } else {
          // Mostrar toast de error
          this.snackBar.open(response.message || 'Error al generar el link de pago', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
        return response;
      }),
    );
  }

  // Método para limpiar el estado de la transacción
  clearTransactionState(): void {
    this.transactionUrl.set(null);
    this.transactionId.set(null);
    this.transactionError.set(null);
  }
}
