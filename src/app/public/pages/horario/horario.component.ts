import { Component, ElementRef, inject, signal, Signal, ViewChild, computed } from '@angular/core';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { AgendaService } from '../../../shared/services/agenda.service';
import { Agenda } from '../../../models/agenda.model';
import { ServicioDetalle } from '../../../models/servicio-detalle.model';
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

  // Agenda ordenada por hora
  agenda = computed(() => {
    const agendaData = this.servicioService.agenda();
    return this.sortByTime(agendaData);
  });

  servicioSeleccionado = signal<ServicioDetalle | null>(null);
  sede: Sedes | null = null;

  /**
   * Ordena las horas en formato "7:30am, 9:30am, 6:00pm" de manera ascendente
   */
  private sortByTime(agenda: Agenda[]): Agenda[] {
    return [...agenda].sort((a, b) => {
      const timeA = this.convertToMinutes(a.hora);
      const timeB = this.convertToMinutes(b.hora);
      return timeA - timeB;
    });
  }

  /**
   * Convierte hora en formato "7am", "7:30am" o "6:00pm" a minutos desde medianoche
   */
  private convertToMinutes(timeStr: string): number {
    // Regex para capturar horas, minutos opcionales y AM/PM
    const match = timeStr.toLowerCase().match(/(\d+):?(\d+)?\s*(am|pm)/);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3];

    // Convertir a formato 24 horas
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

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
      this.servicioService.sedeSeleccionada.set(this.sede?.id);
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
      sede: this.sede?.id,
      fecha: this.selectedDate,
      hora: this.horaSeleccionada(),
      valor_abono: this.valor_abono(),
    };
    this.router.navigate(['/detalle-pago'], {
      state: { datosCita },
    });
  }
}
