import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type MetricIcon = 'calendar' | 'team' | 'completed' | 'cancelled';
type AppointmentStatus = 'Programada' | 'En atención' | 'Atendida' | 'Cancelada';
type AvailabilityStatus = 'Disponible' | 'Ocupado' | 'Fuera de turno';

interface SummaryMetric {
  readonly label: string;
  readonly value: number;
  readonly detail: string;
  readonly icon: MetricIcon;
  readonly iconClass: string;
}

interface Appointment {
  readonly time: string;
  readonly client: string;
  readonly service: string;
  readonly employee: string;
  readonly status: AppointmentStatus;
}

interface TeamMember {
  readonly name: string;
  readonly initials: string;
  readonly specialty: string;
  readonly status: AvailabilityStatus;
  readonly nextAvailability?: string;
}

interface UpcomingAppointment {
  readonly time: string;
  readonly client: string;
  readonly service: string;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly announcement = signal('');

  protected readonly metrics = [
    {
      label: 'Citas programadas',
      value: 18,
      detail: '4 en las próximas 2 horas',
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
      value: 7,
      detail: 'Durante la jornada de hoy',
      icon: 'completed',
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Citas canceladas',
      value: 2,
      detail: 'Durante la jornada de hoy',
      icon: 'cancelled',
      iconClass: 'bg-rose-50 text-rose-600',
    },
  ] as const satisfies readonly SummaryMetric[];

  protected readonly appointments = [
    {
      time: '09:00',
      client: 'Laura Gómez',
      service: 'Corte y peinado',
      employee: 'Mariana López',
      status: 'En atención',
    },
    {
      time: '10:00',
      client: 'Carlos Ruiz',
      service: 'Consulta',
      employee: 'Andrés Vega',
      status: 'Programada',
    },
    {
      time: '11:30',
      client: 'Sofía Martínez',
      service: 'Manicura',
      employee: 'Daniela Torres',
      status: 'Programada',
    },
    {
      time: '13:00',
      client: 'Miguel Sánchez',
      service: 'Barbería',
      employee: 'Andrés Vega',
      status: 'Atendida',
    },
    {
      time: '14:30',
      client: 'Valentina Rojas',
      service: 'Coloración',
      employee: 'Mariana López',
      status: 'Cancelada',
    },
  ] as const satisfies readonly Appointment[];

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

  protected readonly upcomingAppointments = [
    { time: '10:00', client: 'Carlos Ruiz', service: 'Consulta' },
    { time: '10:30', client: 'Andrea Moreno', service: 'Corte' },
    { time: '11:00', client: 'Julián Pérez', service: 'Barbería' },
  ] as const satisfies readonly UpcomingAppointment[];

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

  protected announceNewAppointment(): void {
    this.announcement.set('La creación de citas estará disponible próximamente.');
  }
}
