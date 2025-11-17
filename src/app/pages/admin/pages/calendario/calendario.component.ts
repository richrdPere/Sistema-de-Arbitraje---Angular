import { Component, OnInit } from '@angular/core';

// Interface
interface CalendarEvent {
  event_date: Date;
  event_title: string;
  event_theme: string;
}

interface CalendarEvent {
  event_date: Date;
  event_title: string;
  event_theme: string;
}

@Component({
  selector: 'app-calendario',
  imports: [],
  templateUrl: './calendario.component.html',
})
export class CalendarioComponent implements OnInit {

  days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();

  emptyDays: number[] = [];
  numOfDays: number[] = [];

  events: CalendarEvent[] = [
    { event_date: new Date(2021, 9, 4), event_title: 'My Birthday :)', event_theme: 'red' },
    { event_date: new Date(2021, 11, 25), event_title: 'Xmas Day', event_theme: 'green' },
    { event_date: new Date(2021, 9, 31), event_title: 'Halloween', event_theme: 'yellow' },
    { event_date: new Date(2021, 11, 31), event_title: 'New Years Eve', event_theme: 'yellow' }
  ];

  get currentMonthName(): string {
    return new Date(this.year, this.month).toLocaleString('default', { month: 'long' });
  }

  ngOnInit(): void {
    this.getNoOfDays();
  }

  isToday(date: number): boolean {
    const d = new Date(this.year, this.month, date);
    return this.today.toDateString() === d.toDateString();
  }

  getNoOfDays(): void {
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const dayOfWeek = new Date(this.year, this.month).getDay();

    this.emptyDays = Array.from({ length: dayOfWeek }, (_, i) => i);
    this.numOfDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  nextMonth(): void {
    if (this.month < 11) {
      this.month++;
      this.getNoOfDays();
    }
  }

  prevMonth(): void {
    if (this.month > 0) {
      this.month--;
      this.getNoOfDays();
    }
  }

  eventClass(theme: string): string {
    switch (theme) {
      case 'blue': return 'border-blue-200 text-blue-800 bg-blue-100';
      case 'red': return 'border-red-200 text-red-800 bg-red-100';
      case 'yellow': return 'border-yellow-200 text-yellow-800 bg-yellow-100';
      case 'green': return 'border-green-200 text-green-800 bg-green-100';
      default: return 'border-purple-200 text-purple-800 bg-purple-100';
    }
  }
}
