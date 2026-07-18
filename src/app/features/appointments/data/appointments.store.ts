import { Injectable, signal } from '@angular/core';

export type AppointmentStatus = 'Programada' | 'En atención' | 'Atendida' | 'Cancelada';

export interface AppointmentDraft {
  readonly clientId: string;
  readonly clientName: string;
  readonly serviceId: string;
  readonly serviceName: string;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly date: string;
  readonly startTime: string;
  readonly durationMinutes: number;
  readonly status: AppointmentStatus;
  readonly notes: string;
}

export interface Appointment extends AppointmentDraft {
  readonly id: number;
  readonly endTime: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsStore {
  private readonly appointmentsState = signal<Appointment[]>(createDemoAppointments());

  readonly appointments = this.appointmentsState.asReadonly();

  createAppointment(draft: AppointmentDraft): Appointment {
    const appointment: Appointment = {
      id: Math.max(0, ...this.appointmentsState().map((item) => item.id)) + 1,
      ...draft,
      endTime: calculateEndTime(draft.startTime, draft.durationMinutes),
    };
    this.appointmentsState.update((appointments) => [...appointments, appointment]);
    return appointment;
  }

  updateAppointment(id: number, draft: AppointmentDraft): void {
    this.appointmentsState.update((appointments) =>
      appointments.map((appointment) =>
        appointment.id === id
          ? {
              id,
              ...draft,
              endTime: calculateEndTime(draft.startTime, draft.durationMinutes),
            }
          : appointment,
      ),
    );
  }

  cancelAppointment(id: number): void {
    this.changeStatus(id, 'Cancelada');
  }

  changeStatus(id: number, status: AppointmentStatus): void {
    this.appointmentsState.update((appointments) =>
      appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    );
  }

  hasConflict(candidate: AppointmentDraft, excludedAppointmentId?: number): boolean {
    const candidateEnd = calculateEndTime(candidate.startTime, candidate.durationMinutes);
    return this.appointmentsState().some(
      (appointment) =>
        appointment.id !== excludedAppointmentId &&
        appointment.status !== 'Cancelada' &&
        appointment.employeeId === candidate.employeeId &&
        appointment.date === candidate.date &&
        candidate.startTime < appointment.endTime &&
        candidateEnd > appointment.startTime,
    );
  }
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

function createDemoAppointments(): Appointment[] {
  const today = startOfDay(new Date());
  const drafts: readonly AppointmentDraft[] = [
    demoDraft(
      'c1',
      'Lucía Mendoza',
      's1',
      'Corte clásico',
      'e1',
      'Mariana López',
      today,
      '09:00',
      30,
      'Programada',
    ),
    demoDraft(
      'c2',
      'Mateo Castro',
      's2',
      'Corte y barba',
      'e2',
      'Andrés Vega',
      today,
      '10:00',
      60,
      'En atención',
    ),
    demoDraft(
      'c3',
      'Valeria Ríos',
      's3',
      'Manicure semipermanente',
      'e3',
      'Daniela Torres',
      today,
      '11:30',
      60,
      'Atendida',
    ),
    demoDraft(
      'c4',
      'Tomás Herrera',
      's5',
      'Consulta general',
      'e1',
      'Mariana López',
      today,
      '14:00',
      45,
      'Cancelada',
    ),
    demoDraft(
      'c5',
      'Isabella Navas',
      's4',
      'Limpieza facial',
      'e4',
      'Paula Cárdenas',
      today,
      '15:00',
      90,
      'Programada',
    ),
    demoDraft(
      'c6',
      'Samuel Pardo',
      's1',
      'Corte clásico',
      'e5',
      'Felipe Rojas',
      addDays(today, 1),
      '08:30',
      30,
      'Programada',
    ),
    demoDraft(
      'c1',
      'Lucía Mendoza',
      's3',
      'Manicure semipermanente',
      'e6',
      'Natalia Suárez',
      addDays(today, 1),
      '10:30',
      60,
      'Programada',
    ),
    demoDraft(
      'c2',
      'Mateo Castro',
      's4',
      'Limpieza facial',
      'e7',
      'Laura Pineda',
      addDays(today, 2),
      '13:00',
      90,
      'Atendida',
    ),
    demoDraft(
      'c3',
      'Valeria Ríos',
      's6',
      'Asesoría de imagen',
      'e1',
      'Mariana López',
      addDays(today, 4),
      '09:00',
      60,
      'Programada',
    ),
    demoDraft(
      'c4',
      'Tomás Herrera',
      's2',
      'Corte y barba',
      'e2',
      'Andrés Vega',
      addDays(today, -1),
      '16:00',
      60,
      'Cancelada',
    ),
  ];

  return drafts.map((draft, index) => ({
    id: index + 1,
    ...draft,
    endTime: calculateEndTime(draft.startTime, draft.durationMinutes),
  }));
}

function demoDraft(
  clientId: string,
  clientName: string,
  serviceId: string,
  serviceName: string,
  employeeId: string,
  employeeName: string,
  date: Date,
  startTime: string,
  durationMinutes: number,
  status: AppointmentStatus,
): AppointmentDraft {
  return {
    clientId,
    clientName,
    serviceId,
    serviceName,
    employeeId,
    employeeName,
    date: toIsoDate(date),
    startTime,
    durationMinutes,
    status,
    notes: '',
  };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
