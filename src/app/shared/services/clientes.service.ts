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

  private clienteResource = rxResource({
    params: () => this.documento(),
    stream: ({ params }) => {
      return this.http
        .get<Clientes[]>(`${this.apiUrl}api/cliente/${params}`)
        .pipe(
          map((cliente) => clientesAdapter(cliente)),
          catchError((error) => {
            console.log('Error al buscar cliente:', error);
            // Retornar array vacío en caso de error (cliente no existe)
            return of([]);
          })
        );
    },
  });

  cliente = computed(() => this.clienteResource.value() ?? ([] as Clientes[]));
  error = computed(() => this.clienteResource.error() as HttpErrorResponse);

  actualizarDocumento(documento: string) {
    this.documento.set(documento); // Esto dispara la recarga de datos
  }
}
