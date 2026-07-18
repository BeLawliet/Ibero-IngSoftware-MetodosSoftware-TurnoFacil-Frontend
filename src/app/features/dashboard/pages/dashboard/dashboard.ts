import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AppointmentStatus,
  AppointmentsStore,
} from '../../../appointments/data/appointments.store';
import { toLocalIsoDate } from '../../../../shared/utils/date.utils';

type MetricIcon = 'calendar' | 'team' | 'completed' | 'cancelled';
type AvailabilityStatus = 'Disponible' | 'Ocupado' | 'Fuera de turno';

interface SummaryMetric {
  readonly label: string;
  readonly value: number;
  readonly detail: string;
  readonly icon: MetricIcon;
  readonly iconClass: string;
}

interface TeamMember {
  readonly name: string;
  readonly initials: string;
  readonly specialty: string;
  readonly status: AvailabilityStatus;
  readonly nextAvailability?: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly appointmentsStore = inject(AppointmentsStore);
  private readonly todayIso = toLocalIsoDate(new Date());

  protected readonly metrics = computed<readonly SummaryMetric[]>(() => {
    const appointments = this.appointmentsStore.appointments();
    return [
      {
        label: 'Citas programadas',
        value: appointments.filter((appointment) => appointment.status === 'Programada').length,
        detail: `${appointments.filter((appointment) => appointment.status === 'Programada' && appointment.date === this.todayIso).length} para hoy`,
        icon: 'calendar',
        iconClass: 'bg-brand-teal-soft text-brand-teal',
      },
      {
        label: 'Empleados activos',
        value: 12,
        detail: 'De 15 empleados registrados',
        icon: 'team',
        iconClass: 'bg-blue-50 text-blue-600',
      },
      {
        label: 'Citas atendidas',
        value: appointments.filter((appointment) => appointment.status === 'Atendida').length,
        detail: 'Registradas en el historial',
        icon: 'completed',
        iconClass: 'bg-emerald-50 text-emerald-600',
      },
      {
        label: 'Citas canceladas',
        value: appointments.filter((appointment) => appointment.status === 'Cancelada').length,
        detail: 'Registradas en el historial',
        icon: 'cancelled',
        iconClass: 'bg-rose-50 text-rose-600',
      },
    ];
  });

  protected readonly appointments = computed(() =>
    this.appointmentsStore
      .appointments()
      .filter((appointment) => appointment.date === this.todayIso)
      .sort((first, second) => first.startTime.localeCompare(second.startTime)),
  );

  protected readonly team = [
    {
      name: 'Mariana López',
      initials: 'ML',
      specialty: 'Estilista',
      status: 'Ocupado',
      nextAvailability: 'Disponible a las 10:30',
    },
    {
      name: 'Andrés Vega',
      initials: 'AV',
      specialty: 'Barbero',
      status: 'Disponible',
      nextAvailability: undefined,
    },
    {
      name: 'Daniela Torres',
      initials: 'DT',
      specialty: 'Manicurista',
      status: 'Disponible',
      nextAvailability: undefined,
    },
    {
      name: 'Camila Romero',
      initials: 'CR',
      specialty: 'Recepción',
      status: 'Fuera de turno',
      nextAvailability: 'Inicia a las 14:00',
    },
  ] as const satisfies readonly TeamMember[];

  protected readonly upcomingAppointments = computed(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const currentDateTime = `${this.todayIso}T${currentTime}`;
    return this.appointmentsStore
      .appointments()
      .filter(
        (appointment) =>
          appointment.status !== 'Cancelada' &&
          `${appointment.date}T${appointment.startTime}` >= currentDateTime,
      )
      .sort((first, second) =>
        `${first.date}T${first.startTime}`.localeCompare(`${second.date}T${second.startTime}`),
      )
      .slice(0, 3);
  });

  protected readonly appointmentStatusClasses: Readonly<Record<AppointmentStatus, string>> = {
    Programada: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    'En atención': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Atendida: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    Cancelada: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  };

  protected readonly availabilityClasses: Readonly<Record<AvailabilityStatus, string>> = {
    Disponible: 'bg-emerald-500',
    Ocupado: 'bg-amber-500',
    'Fuera de turno': 'bg-slate-400',
  };
}
