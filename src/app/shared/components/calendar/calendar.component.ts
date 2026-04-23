import { NgFor } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar',
  imports: [NgFor, FormsModule, MatButtonModule, MatIconModule, MatSelectModule],

  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private currentDate!: Date;
  private currentMonth!: number;
  private currentYear!: number;
  public currentMonthYear!: string;
  public days: any[] = [];
  public selectedDay: number | undefined = undefined;
  public selectedMonth: number | null = null;

  public selectedItem: any;
  public selectedFrom: any;
  public selectedTo: any;

  @Output() daySelected = new EventEmitter<Date>();

  visibleDays: Array<any> = [];
  currentDayIndex: number = 0; // Índice para navegar entre los días visibles

  private dialog = inject(MatDialog);

  public ngOnInit() {
    this.initializeDate();
    this.updateDays();
    this.updateCurrentMonthYear();
    this.selectCurrentDay();
    this.updateVisibleDays();
    // console.log(this.visibleDays, this.days);
  }

  prevDays() {
    // Determinar el número de días visibles según el dispositivo
    const visibleDaysCount = window.innerWidth <= 768 ? 4 : 8;

    // Desplazarse hacia atrás
    if (this.currentDayIndex > 0) {
      this.currentDayIndex -= visibleDaysCount;
      this.updateVisibleDays();
    }
  }

  nextDays() {
    // Determinar el número de días visibles según el dispositivo
    const visibleDaysCount = window.innerWidth <= 768 ? 4 : 8;

    // Desplazarse hacia adelante
    if (this.currentDayIndex + visibleDaysCount < this.days.length) {
      this.currentDayIndex += visibleDaysCount;
      this.updateVisibleDays();
    }
  }

  updateVisibleDays() {
    // Mostrar solo los 8 días a partir del índice actual
    // this.visibleDays = this.days.slice(this.currentDayIndex, this.currentDayIndex + 8);

    this.currentDayIndex = Math.max(0, this.currentDayIndex);

    // Determinar el número de días visibles según el dispositivo
    const visibleDaysCount = window.innerWidth <= 768 ? 4 : 8;

    // Asegurarse de que el índice no exceda el número de días
    this.currentDayIndex = Math.min(this.currentDayIndex, this.days.length - visibleDaysCount);

    // Mostrar solo los días visibles a partir del índice actual
    this.visibleDays = this.days.slice(
      this.currentDayIndex,
      this.currentDayIndex + visibleDaysCount,
    );
  }

  private initializeDate() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.currentDayIndex = this.currentDate.getDate() - 1 - 3; // Empezar 3 días antes del actual para centrarlo
  }

  private updateDays() {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayDate = new Date(this.currentYear, this.currentMonth, i + 1);
      return {
        number: i + 1,
        dayOfWeek: this.getDayOfWeek(dayDate),
      };
    });

    const today = new Date();
    if (this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth()) {
      this.currentDayIndex = Math.max(0, today.getDate() - 1 - 3);
      this.selectCurrentDay();
    } else {
      this.currentDayIndex = 0; // Empezar desde el primer día si no es el mes actual
    }

    this.updateVisibleDays();
  }

  private getDayOfWeek(date: Date): string {
    return date.toLocaleDateString('es-CO', { weekday: 'short' });
  }

  private updateCurrentMonthYear() {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    this.currentMonthYear = `${monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  public prevMonth() {
    if (this.currentMonth > 0) {
      this.currentMonth--;
    } else {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.updateDays();
    this.updateCurrentMonthYear();
    this.daySelected.emit(undefined);
  }

  public nextMonth() {
    if (this.currentMonth < 11) {
      this.currentMonth++;
    } else {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.updateDays();
    this.updateCurrentMonthYear();
    this.daySelected.emit(undefined);
  }

  public selectDay(index: number): void {

    this.selectedDay = this.visibleDays[index]?.number;
    this.selectedMonth = this.currentMonth + 1;

    if (this.selectedDay !== undefined) {
      const today = new Date();
      const dayNumber = today.getDate();
      if (
        this.currentYear > today.getFullYear() ||
        (this.currentYear === today.getFullYear() && this.currentMonth > today.getMonth()) ||
        (this.currentYear === today.getFullYear() &&
          this.currentMonth === today.getMonth() &&
          this.selectedDay >= dayNumber)
      ) {
        this.currentDate = new Date(this.currentYear, this.currentMonth, this.selectedDay);
        this.daySelected.emit(this.currentDate);
      } else {
        this.currentDate = today;
        this.selectedDay = dayNumber;
        this.daySelected.emit(undefined);
      }
    }
  }

  public selectCurrentDay() {
    const today = new Date();
    if (this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth()) {
      const dayNumber = today.getDate();

      this.selectedDay = dayNumber;
      this.selectedMonth = this.currentMonth + 1;
      this.currentDate = new Date(this.currentYear, this.currentMonth, dayNumber);
      this.daySelected.emit(this.currentDate);

      // Encontrar el índice del día actual en los días visibles
      const indexInVisible = this.visibleDays.findIndex((day) => day.number === dayNumber);
      if (indexInVisible === -1) {
        // Si el día actual no está visible, ajustar la vista
        this.currentDayIndex = Math.max(0, dayNumber - 1 - 3);
        this.updateVisibleDays();
      }
    }
  }

  public isDaySelected(index: number): boolean {
    return (
      this.selectedDay === this.visibleDays[index]?.number &&
      this.selectedMonth === this.currentMonth + 1
    );
  }

  public isCurrentDay(index: number): boolean {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;

    return (
      this.visibleDays[index]?.number === currentDay &&
      this.currentMonth + 1 === currentMonth &&
      this.currentYear === currentDate.getFullYear()
    );
  }
}
