import { ServiciosService } from './../../../shared/services/servicios.service';
import { Component, ElementRef, inject, Signal, signal, ViewChild } from '@angular/core';
import { CardSedeComponent } from '../../../shared/components/card-sede/card-sede.component';
import { Router, RouterModule } from '@angular/router';
import { Sedes } from '../../../models/sedes.model';
import { Servicios, TipoServicio } from '../../../models/servicios.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { Agenda } from '../../../models/agenda.model';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ClienteDialogComponent } from '../../../shared/components/cliente-dialog/cliente-dialog.component';
import { AgendaService } from '../../../shared/services/agenda.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientesService } from '../../../shared/services/clientes.service';
import Swal from 'sweetalert2';

// @ts-ignore
const $: any = window['$'];
@Component({
  selector: 'app-servicios',
  imports: [
    CardSedeComponent,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    CalendarComponent,
    MatRadioModule,
    RouterModule,
  ],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  @ViewChild('horariosModal') modal?: ElementRef;
  private servicioService = inject(ServiciosService);
  private agendaService = inject(AgendaService);
  private clienteService = inject(ClientesService);

  tipoServicios: Signal<TipoServicio[]> = this.servicioService.tipoServicio;
  servicios: Signal<Servicios[]> = this.servicioService.servicios;
  agenda: Signal<Agenda[]> = this.servicioService.agenda;

  tipoServicioSeleccionado = signal<TipoServicio | null>(null);
  servicioSeleccionado = signal<Servicios | null>(null);
  descripcion = signal<string | null>(null);
  duracion = signal<string | null>(null);

  sede: Sedes;

  constructor(private router: Router, private dialog: MatDialog) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
  }

  onTipoServicioChange() {
    this.servicioService.tipoServicioSeleccionado.set(this.tipoServicioSeleccionado()?.id);
    this.servicioService.sedeSeleccionada.set(this.sede.id);
    this.valor_abono.set(this.tipoServicioSeleccionado()?.valor_abono ?? 0);
    this.servicioSeleccionado.set(null);
  }

  onServicioChange() {
    this.servicioService.servicioSeleccionado.set(this.servicioSeleccionado());
    this.descripcion.set(this.servicioSeleccionado()?.descripcion || null);
    this.duracion.set(this.servicioSeleccionado()?.duracion || null);
  }

  selectedDate: Date | undefined = undefined;

  onDaySelected(date: Date) {
    this.selectedDate = date;
    this.servicioService.selectedDate.set(this.selectedDate);
  }

  valor_abono = signal<number>(0);
  horaSeleccionada = signal<string>('');
  documento = signal<string>('');
  nombres = signal<string>('');
  apellidos = signal<string>('');
  telefono = signal<string>('');
  correo = signal<string>('');
  fecha_nacimiento = signal<string>('');

  onModalCliente() {
    if (!this.horaSeleccionada()) {
      alert('Por favor seleccione una hora antes de continuar.');
      return;
    }

    const dialogRef = this.dialog.open(ClienteDialogComponent, {
      width: '600px',
      maxWidth: '100vw',
      maxHeight: '120vh',
      position: {
        right: '0',
        top: '0',
      },
      data: {
        valorAbono: this.valor_abono(),
      },
    });




    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.documento.set(result.documento);
        this.nombres.set(result.nombres);
        this.apellidos.set(result.apellidos);
        this.telefono.set(result.telefono);
        this.correo.set(result.correo);
        this.fecha_nacimiento.set(result.fecha_nacimiento);
        this.valor_abono.set(result.valorAbono);

        const datosCita = {
          tipo_servicio: this.tipoServicioSeleccionado()?.id,
          servicio: this.servicioSeleccionado()?.id,
          sede: this.sede.id,
          fecha: this.selectedDate,
          hora: this.horaSeleccionada(),
          documento: this.documento(),
          nombres: this.nombres(),
          apellidos: this.apellidos(),
          telefono: this.telefono(),
          correo: this.correo(),
          fecha_nacimiento: this.fecha_nacimiento()
            ? new Date(this.fecha_nacimiento()).toISOString().split('T')[0]
            : undefined,
          valor_abono: this.valor_abono(),
        };
        // Invocar el servicio para generar el link de pago
        // this.agendaService.generatePaymentLink(datosCita).subscribe();
        this.agendaService.generatePaymentLink(datosCita).subscribe({
          next: (response) => {
            // Todo bien, ya lo maneja el servicio
          },
          error: (err) => {
            // Mostrar toast de error aquí también
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error.message || 'Error al generar el link de pago',
            });
          },
        });
      }

      this.resetCampos();
    });
  }

  private resetCampos() {
    this.clienteService.documento.set('');
    this.documento.set('');
    this.nombres.set('');
    this.apellidos.set('');
    this.telefono.set('');
    this.correo.set('');
    this.fecha_nacimiento.set('');
  }
}
