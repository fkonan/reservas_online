import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/env.dev';
import { catchError, map, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { Clientes } from '../../models/clientes.model';
import { clientesAdapter } from '../../adapters/clientes.adapter';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private apiUrl = `${environment.baseUrl}`;
  private http = inject(HttpClient);

  documento = signal<string | null>(null);
  noAgendar = signal<boolean>(false);
  mensajeBloqueo = signal<string>('');
  errorServidor = signal<boolean>(false);

  private clienteResource = rxResource({
    params: () => this.documento(),
    stream: ({ params }) => {
      this.noAgendar.set(false);
      this.mensajeBloqueo.set('');
      this.errorServidor.set(false);
      return this.http
        .get<any>(`${this.apiUrl}api/cliente/${params}`)
        .pipe(
          map((response) => {
            if (response.noAgendar === true) {
              this.noAgendar.set(true);
              this.mensajeBloqueo.set(response.message ?? '');
              return [] as Clientes[];
            }
            return clientesAdapter(response);
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Error al buscar cliente:', error);
            this.errorServidor.set(true);
            return of(null);
          })
        );
    },
  });

  cliente = computed(() => {
    const val = this.clienteResource.value();
    if (val === null || val === undefined) return [] as Clientes[];
    return val;
  });

  error = computed(() => this.clienteResource.error() as HttpErrorResponse);

  actualizarDocumento(documento: string) {
    this.documento.set(documento);
  }
}
