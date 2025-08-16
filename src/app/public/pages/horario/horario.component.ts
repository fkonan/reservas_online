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
import { Sedes } from '../../../models/sedes.model';

@Component({
  selector: 'app-horario',
  imports: [RouterModule, FormsModule, MatButtonModule, CalendarComponent],
  templateUrl: './horario.component.html',
  styleUrl: './horario.component.scss',
})
export class HorarioComponent {
  private servicioService = inject(ServiciosService);
  private clienteService = inject(ClientesService);
  private agendaService = inject(AgendaService);
  agenda: Signal<Agenda[]> = this.servicioService.agenda;
  servicioSeleccionado = signal<Servicios | null>(null);
  sede: Sedes;

  constructor(private router: Router, private dialog: MatDialog) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
    const servicioSeleccionado =
      navigation?.extras.state?.['servicio'] || localStorage.getItem('servicio');
    const valorAbono = 50000;

    if (servicioSeleccionado) {
      this.servicioSeleccionado.set(
        typeof servicioSeleccionado === 'string'
          ? JSON.parse(servicioSeleccionado)
          : servicioSeleccionado,
      );
      localStorage.setItem('servicio', JSON.stringify(servicioSeleccionado));
      this.servicioService.sedeSeleccionada.set(this.sede.id);
    }

    if (valorAbono) {
      this.valor_abono.set(typeof valorAbono === 'string' ? JSON.parse(valorAbono) : valorAbono);
      localStorage.setItem('valorAbono', JSON.stringify(valorAbono));
    }
  }

  selectedDate: Date | undefined = undefined;
  horaSeleccionada = signal<string>('');

  onDaySelected(date: Date) {
    this.selectedDate = date ?? new Date();
    this.servicioService.servicioSeleccionado.set(this.servicioSeleccionado());
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
      sede: this.sede.id,
      fecha: this.selectedDate,
      hora: this.horaSeleccionada(),
      valor_abono: this.valor_abono(),
    };
    this.router.navigate(['/detalle-pago'], {
      state: { datosCita },
    });
  }
}
