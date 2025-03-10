import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

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
  public initialHours: string[] = [];
  public hours: string[] = [];
  public totalDaysWidth: number = 0;
  public selectedDay: number | null = null;
  public selectedMonth: number | null = null;

  public selectedItem: any;
  public selectedFrom: any;
  public selectedTo: any;

  public ngOnInit() {
    this.initializeDate();
    this.updateDays();
    this.calculateTotalDaysWidth();
    this.updateCurrentMonthYear();
    this.generateHoursArray();
    this.generateInitialHoursArray();
    this.selectCurrentDay();
  }

  private getDateTime(date: Date, hourStr: string) {
    const [hour, minute] = hourStr.split(':').map(Number);
    date.setUTCHours(hour, minute, 0, 0);
    return date;
  }

  private addMinutesToDate(originalDate: Date, minutesToAdd: number): Date {
    const newDate: Date = new Date(originalDate.getTime() + minutesToAdd * 60000); // 60000 milliseconds in a minute
    return newDate;
  }

  private initializeDate() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
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
  }

  private getDayOfWeek(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  private calculateTotalDaysWidth() {
    this.totalDaysWidth = this.days.length * 60;
  }

  private updateCurrentMonthYear() {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
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
    this.calculateTotalDaysWidth();
    this.updateCurrentMonthYear();
  }

  public nextMonth() {
    if (this.currentMonth < 11) {
      this.currentMonth++;
    } else {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.updateDays();
    this.calculateTotalDaysWidth();
    this.updateCurrentMonthYear();
  }



}
