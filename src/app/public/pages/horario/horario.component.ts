import { Component, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { AgendaService } from '../../../shared/services/agenda.service';
import { Agenda } from '../../../models/agenda.model';
import { Servicios } from '../../../models/servicios.model';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { FormsModule } from '@angular/forms';
import { ClienteDialogComponent } from '../../../shared/components/cliente-dialog/cliente-dialog.component';
import { ClientesService } from '../../../shared/services/clientes.service';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-horario',
  imports: [CalendarComponent, RouterModule, FormsModule, MatButtonModule],
  templateUrl: './horario.component.html',
  styleUrl: './horario.component.scss',
})
export class HorarioComponent {
  private servicioService = inject(ServiciosService);
  private clienteService = inject(ClientesService);
  private agendaService = inject(AgendaService);
  agenda: Signal<Agenda[]> = this.servicioService.agenda;
  servicioSeleccionado = signal<Servicios | null>(null);

  constructor(private router: Router, private dialog: MatDialog) {
    const navigation = this.router.getCurrentNavigation();
    const servicioSeleccionado =
      navigation?.extras.state?.['servicioSeleccionado'] ||
      localStorage.getItem('servicioSeleccionado');
    const valorAbono = navigation?.extras.state?.['abono'] || localStorage.getItem('valorAbono');

    if (servicioSeleccionado) {
      this.servicioSeleccionado.set(
        typeof servicioSeleccionado === 'string'
          ? JSON.parse(servicioSeleccionado)
          : servicioSeleccionado,
      );
      localStorage.setItem('servicioSeleccionado', JSON.stringify(servicioSeleccionado));
      this.servicioService.servicioSeleccionado.set(this.servicioSeleccionado());
      this.servicioService.tipoServicioSeleccionado.set(
        this.servicioSeleccionado()?.tipo_servicio_id,
      );
      this.servicioService.sedeSeleccionada.set(this.servicioSeleccionado()?.sede_id);
    }

    if (valorAbono) {
      this.valor_abono.set(typeof valorAbono === 'string' ? JSON.parse(valorAbono) : valorAbono);
      localStorage.setItem('valorAbono', JSON.stringify(valorAbono));
    }
  }

  selectedDate: Date | undefined = undefined;
  horaSeleccionada = signal<string>('');

  onDaySelected(date: Date) {
    this.selectedDate = date;
    this.servicioService.selectedDate.set(this.selectedDate);
  }

  valor_abono = signal<number>(0);
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

    const datosCita = {
      servicio: this.servicioSeleccionado(),
      sede: 3,
      fecha: this.selectedDate,
      hora: this.horaSeleccionada(),
      valor_abono: this.valor_abono(),
    };

    this.router.navigate(['/detalle-pago'], {
      state: { datosCita },
    });
  }
}
