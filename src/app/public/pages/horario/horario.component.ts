import { Component, ElementRef, effect, inject, signal, Signal, ViewChild, computed } from '@angular/core';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { AgendaService } from '../../../shared/services/agenda.service';
import { Agenda } from '../../../models/agenda.model';
import { AvisoFinal, ServicioDetalle } from '../../../models/servicio-detalle.model';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { FormsModule } from '@angular/forms';
import { ClienteDialogComponent } from '../../../shared/components/cliente-dialog/cliente-dialog.component';
import { ClientesService } from '../../../shared/services/clientes.service';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { Sedes } from '../../../models/sedes.model';
import { DecimalPipe } from '@angular/common';
import { HeaderPromoComponent } from '../../../shared/components/header-promo/header-promo.component';
import { SeasonalTreeBottomComponent } from '../../../shared/components/seasonal-tree-bottom/seasonal-tree-bottom.component';
@Component({
  selector: 'app-horario',
  imports: [RouterModule, FormsModule, MatButtonModule, CalendarComponent, DecimalPipe, HeaderPromoComponent, SeasonalTreeBottomComponent],
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

  slotSeleccionado = signal<Agenda | null>(null);
  horaSeleccionada = computed(() => this.slotSeleccionado()?.hora ?? '');

  mostrarAviso = signal(false);
  aceptado = signal(false);

  debesMostrarAviso = computed(
    () => (this.servicioSeleccionado()?.web?.aviso_final?.parrafos?.length ?? 0) > 0,
  );

  selectSlot(item: Agenda): void {
    this.slotSeleccionado.set(item);
  }

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

  private readonly BUFFER_MINUTES = 60;

  isPastSlot(item: Agenda): boolean {
    if (!this.selectedDate) return false;

    const now = new Date();
    const isToday =
      this.selectedDate.getFullYear() === now.getFullYear() &&
      this.selectedDate.getMonth() === now.getMonth() &&
      this.selectedDate.getDate() === now.getDate();


    if (!isToday) return false;

    const slotMinutes = this.convertToMinutes(item.hora);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return slotMinutes < currentMinutes - this.BUFFER_MINUTES;
  }

  constructor(private router: Router, private dialog: MatDialog) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
    const servicioSeleccionado =
      navigation?.extras.state?.['servicio'] || localStorage.getItem('servicio');


    const servicioObj =
      typeof servicioSeleccionado === 'string'
        ? JSON.parse(servicioSeleccionado)
        : servicioSeleccionado;

    const valorAbono: number =
      navigation?.extras.state?.['valor_abono'] ??
      servicioObj?.tipo_servicio_id?.valor_abono ??
      (Number(localStorage.getItem('valorAbono')) || 0);


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
      this.valor_abono.set(valorAbono);
      localStorage.setItem('valorAbono', String(valorAbono));
    }
  }

  selectedDate: Date | undefined = undefined;

  onDaySelected(date: Date) {
    this.selectedDate = date;
    this.slotSeleccionado.set(null);
    this.servicioService.servicioSeleccionado.set(this.servicioSeleccionado());
    this.servicioService.selectedDate.set(this.selectedDate);
  }

  valor_abono = signal<number>(0);

  private readonly valorAbonoEffect = effect(() => {
    const v = this.servicioService.valorAbono();
    if (v > 0) this.valor_abono.set(v);
  });
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
    this.aceptado.set(false);
    this.mostrarAviso.set(true);
  }

  confirmarAviso(): void {
    const avisoFinal = this.servicioSeleccionado()?.web?.aviso_final ?? null;
    localStorage.setItem('aviso_final', JSON.stringify(avisoFinal));
    this.mostrarAviso.set(false);
    const datosCita = {
      servicio: this.servicioSeleccionado(),
      sede: this.sede?.id,
      fecha: this.selectedDate,
      hora: this.horaSeleccionada(),
      valor_abono: this.valor_abono(),
    };
    this.router.navigate(['/detalle-pago'], { state: { datosCita } });
  }

  cancelarAviso(): void {
    this.mostrarAviso.set(false);
    this.aceptado.set(false);
    this.slotSeleccionado.set(null);
  }
}
