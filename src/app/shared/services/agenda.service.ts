import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
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
  currentPaymentLink = signal<string | null>(null);

  generatePaymentLink(agenda: AgendaRequest): Observable<AgendaResponse> {
    const loadingSnackBarRef = this.snackBar.open('Generando link de pago...', '', {
      duration: 0,
      panelClass: ['loading-snackbar'],
    });

    return this.http.post<AgendaResponse>(`${this.apiUrl}api/payment/generate-link`, agenda)
    .pipe(
      finalize(() => {
        loadingSnackBarRef.dismiss();
      }),
      map((response) => {
        if (response.success) {
          this.transactionUrl.set(response.data.url);
          this.transactionId.set(response.data.transaction_id);

          // Extraer el LNK_XXX de la URL de Bold
          const boldUrl = response.data.url;
          const linkMatch = boldUrl.match(/LNK_[A-Za-z0-9_-]+/);
          const link = linkMatch ? linkMatch[0] : response.data.transaction_id;
          this.currentPaymentLink.set(link);

          this.snackBar.open('Link de pago generado. Abriendo pasarela de pago...', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar'],
          });
        } else {
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
    this.currentPaymentLink.set(null);
  }
}
