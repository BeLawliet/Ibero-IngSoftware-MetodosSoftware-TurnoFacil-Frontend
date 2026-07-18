import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  Appointment,
  AppointmentStatus,
  AppointmentsStore,
} from '../../../appointments/data/appointments.store';
import {
  addLocalDays,
  parseLocalIsoDate,
  startOfWeekMonday,
  toLocalIsoDate,
} from '../../../../shared/utils/date.utils';

type AgendaStatusFilter = 'Todos' | AppointmentStatus;

interface AgendaDay {
  readonly date: Date;
  readonly iso: string;
  readonly dayName: string;
  readonly dateLabel: string;
  readonly isToday: boolean;
}

const EMPLOYEES = [
  { id: 'e1', name: 'Mariana López' },
  { id: 'e2', name: 'Andrés Vega' },
  { id: 'e3', name: 'Daniela Torres' },
  { id: 'e4', name: 'Paula Cárdenas' },
  { id: 'e5', name: 'Felipe Rojas' },
  { id: 'e6', name: 'Natalia Suárez' },
  { id: 'e7', name: 'Laura Pineda' },
] as const;

@Component({
  selector: 'app-agenda-page',
  imports: [RouterLink],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPage {
  private readonly appointmentsStore = inject(AppointmentsStore);
  private readonly router = inject(Router);
  private readonly detailDialog = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');

  readonly employees = EMPLOYEES;
  readonly todayIso = toLocalIsoDate(new Date());
  readonly weekStart = signal(startOfWeekMonday(new Date()));
  readonly selectedDate = signal(this.todayIso);
  readonly employeeFilter = signal('Todos');
  readonly statusFilter = signal<AgendaStatusFilter>('Todos');
  readonly selectedAppointment = signal<Appointment | null>(null);
  readonly appointments = this.appointmentsStore.appointments;
  readonly slotTimes = createSlotTimes();
  readonly hourLabels = createHourLabels();

  readonly weekDays = computed<readonly AgendaDay[]>(() =>
    Array.from({ length: 7 }, (_, index) => {
      const date = addLocalDays(this.weekStart(), index);
      const iso = toLocalIsoDate(date);
      return {
        date,
        iso,
        dayName: new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date),
        dateLabel: new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(
          date,
        ),
        isToday: iso === this.todayIso,
      };
    }),
  );

  readonly rangeLabel = computed(() => {
    const start = this.weekStart();
    const end = addLocalDays(start, 6);
    const startLabel = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: start.getMonth() === end.getMonth() ? undefined : 'long',
    }).format(start);
    const endLabel = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(end);
    return `${startLabel} - ${endLabel}`;
  });

  readonly visibleAppointments = computed(() => {
    const start = toLocalIsoDate(this.weekStart());
    const end = toLocalIsoDate(addLocalDays(this.weekStart(), 6));
    const employee = this.employeeFilter();
    const status = this.statusFilter();
    return this.appointments()
      .filter(
        (appointment) =>
          appointment.date >= start &&
          appointment.date <= end &&
          (employee === 'Todos' || appointment.employeeId === employee) &&
          (status === 'Todos' || appointment.status === status),
      )
      .sort((first, second) =>
        `${first.date}T${first.startTime}`.localeCompare(`${second.date}T${second.startTime}`),
      );
  });

  readonly hasFilters = computed(
    () => this.employeeFilter() !== 'Todos' || this.statusFilter() !== 'Todos',
  );

  protected previousWeek(): void {
    this.setWeek(addLocalDays(this.weekStart(), -7));
  }

  protected nextWeek(): void {
    this.setWeek(addLocalDays(this.weekStart(), 7));
  }

  protected goToToday(): void {
    this.weekStart.set(startOfWeekMonday(new Date()));
    this.selectedDate.set(this.todayIso);
  }

  protected selectDate(date: string): void {
    this.selectedDate.set(date);
  }

  protected updateEmployeeFilter(event: Event): void {
    this.employeeFilter.set((event.target as HTMLSelectElement).value);
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as AgendaStatusFilter);
  }

  protected clearFilters(): void {
    this.employeeFilter.set('Todos');
    this.statusFilter.set('Todos');
  }

  protected appointmentsForDay(date: string): readonly Appointment[] {
    return this.visibleAppointments().filter((appointment) => appointment.date === date);
  }

  protected isSlotFree(date: string, startTime: string): boolean {
    const slotEnd = minutesToTime(timeToMinutes(startTime) + 30);
    return !this.appointments().some(
      (appointment) =>
        appointment.date === date &&
        appointment.status !== 'Cancelada' &&
        startTime < appointment.endTime &&
        slotEnd > appointment.startTime,
    );
  }

  protected createAt(date: string, startTime: string): void {
    void this.router.navigate(['/citas'], {
      queryParams: { nueva: true, fecha: date, hora: startTime },
    });
  }

  protected openDetail(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.openDialog(this.detailDialog()?.nativeElement);
  }

  protected closeDetail(): void {
    this.closeDialog(this.detailDialog()?.nativeElement);
    this.selectedAppointment.set(null);
  }

  protected handleDetailCancel(event: Event): void {
    event.preventDefault();
    this.closeDetail();
  }

  protected closeDetailFromBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) {
      this.closeDetail();
    }
  }

  protected manageAppointment(): void {
    this.closeDetail();
    void this.router.navigateByUrl('/citas');
  }

  protected appointmentTop(appointment: Appointment): number {
    return Math.max(0, ((timeToMinutes(appointment.startTime) - 7 * 60) / 30) * 2);
  }

  protected appointmentHeight(appointment: Appointment): number {
    const visibleStart = Math.max(timeToMinutes(appointment.startTime), 7 * 60);
    const visibleEnd = Math.min(timeToMinutes(appointment.endTime), 20 * 60);
    return Math.max(1.75, ((visibleEnd - visibleStart) / 30) * 2);
  }

  protected isInVisibleHours(appointment: Appointment): boolean {
    return (
      timeToMinutes(appointment.startTime) < 20 * 60 && timeToMinutes(appointment.endTime) > 7 * 60
    );
  }

  protected employeeColor(employeeId: string): string {
    const colors: Record<string, string> = {
      e1: 'border-teal-500 bg-teal-50 text-teal-950',
      e2: 'border-blue-500 bg-blue-50 text-blue-950',
      e3: 'border-violet-500 bg-violet-50 text-violet-950',
      e4: 'border-amber-500 bg-amber-50 text-amber-950',
      e5: 'border-cyan-500 bg-cyan-50 text-cyan-950',
      e6: 'border-pink-500 bg-pink-50 text-pink-950',
      e7: 'border-indigo-500 bg-indigo-50 text-indigo-950',
    };
    return colors[employeeId] ?? 'border-slate-500 bg-slate-50 text-slate-950';
  }

  protected statusClass(status: AppointmentStatus): string {
    const classes: Record<AppointmentStatus, string> = {
      Programada: 'bg-blue-100 text-blue-700',
      'En atención': 'bg-amber-100 text-amber-700',
      Atendida: 'bg-emerald-100 text-emerald-700',
      Cancelada: 'bg-rose-100 text-rose-700',
    };
    return classes[status];
  }

  protected formatLongDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parseLocalIsoDate(value));
  }

  protected formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours} h ${remaining} min` : `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  private setWeek(date: Date): void {
    const start = startOfWeekMonday(date);
    this.weekStart.set(start);
    this.selectedDate.set(toLocalIsoDate(start));
  }

  private openDialog(dialog: HTMLDialogElement | undefined): void {
    if (!dialog) {
      return;
    }
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  private closeDialog(dialog: HTMLDialogElement | undefined): void {
    if (!dialog) {
      return;
    }
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }
}

function createSlotTimes(): readonly string[] {
  return Array.from({ length: 26 }, (_, index) => minutesToTime(7 * 60 + index * 30));
}

function createHourLabels(): readonly string[] {
  return Array.from({ length: 14 }, (_, index) => minutesToTime((7 + index) * 60));
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
