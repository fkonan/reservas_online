import Swal from 'sweetalert2';

import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientesService } from '../../services/clientes.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-cliente-dialog',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './cliente-dialog.component.html',
  styleUrl: './cliente-dialog.component.scss',
})
export class ClienteDialogComponent {
  private clienteService = inject(ClientesService);

  valorAbono = signal<number>(0);
  valorAbonoDisplay = signal<string>('');

  horaSeleccionada = signal<string>('');
  documento = signal<string>('');
  nombres = signal<string>('');
  apellidos = signal<string>('');
  telefono = signal<string>('');
  correo = signal<string>('');
  fecha_nacimiento = signal<Date | null>(null);

  cliente = effect(() => {
    const data = this.clienteService.cliente();
    if (data && data.length > 0) {
      const cliente = Array.isArray(data) ? data[0] : data;
      this.nombres.set(cliente.nombres || '');
      this.apellidos.set(cliente.apellidos || '');
      this.telefono.set(cliente.telefono || '');
      this.correo.set(cliente.correo || '');
      this.fecha_nacimiento.set(
        cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : null,
      );
    } else {
      this.nombres.set('');
      this.apellidos.set('');
      this.telefono.set('');
      this.correo.set('');
      this.fecha_nacimiento.set(null);
    }
  });

  constructor(
    public dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.valorAbonoDisplay.set(this.formatCurrency(this.valorAbono()));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  private parseCurrency(value: string): number {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue ? parseInt(numericValue, 10) : 0;
  }

  onValorAbonoChange(value: string) {
    const numericValue = this.parseCurrency(value);
    this.valorAbono.set(numericValue);
    this.valorAbonoDisplay.set(this.formatCurrency(numericValue));
  }

  onSubmit() {
    // Valida el formulario antes de cerrar

    // if (this.data.valorAbono > this.valorAbono()) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error',
    //     text: 'El valor del abono no puede ser mayor al valor total del servicio.',
    //   });
    //   return;
    // }
    if (this.isFormValid()) {
      this.dialogRef.close({
        documento: this.documento(),
        nombres: this.nombres(),
        apellidos: this.apellidos(),
        telefono: this.telefono(),
        correo: this.correo(),
        valorAbono: this.data.valorAbono,
        fecha_nacimiento: this.fecha_nacimiento(),
      });

      this.resetCampos();
    }
  }

  private isFormValid(): boolean {
    return (
      !!this.documento &&
      !!this.nombres &&
      !!this.apellidos &&
      !!this.telefono &&
      !!this.fecha_nacimiento &&
      !!this.correo &&
      !!this.valorAbono
    );
  }

  validarDocumento() {
    if (!this.documento() || this.documento().length < 8) return;
    this.clienteService.documento.set(this.documento());
  }

  private resetCampos() {
    this.documento.set('');
    this.nombres.set('');
    this.apellidos.set('');
    this.telefono.set('');
    this.correo.set('');
    this.fecha_nacimiento.set(null);
    // this.valorAbono.set(0); // o null, depende de tu lógica
    this.clienteService.documento.set('');
  }
}
