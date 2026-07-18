import { TestBed } from '@angular/core/testing';
import { AppointmentDraft, AppointmentsStore, calculateEndTime } from './appointments.store';

describe('AppointmentsStore', () => {
  let store: AppointmentsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AppointmentsStore);
  });

  it('should expose relative demo appointments as read-only state', () => {
    expect(store.appointments()).toHaveLength(10);
    expect(store.appointments().some((appointment) => appointment.date === todayIso())).toBe(true);
    expect(store.appointments().every((appointment) => appointment.endTime.length === 5)).toBe(
      true,
    );
  });

  it('should calculate the end time from the start and duration', () => {
    expect(calculateEndTime('09:15', 90)).toBe('10:45');
    expect(calculateEndTime('14:00', 30)).toBe('14:30');
  });

  it('should create and update appointments locally', () => {
    const created = store.createAppointment(draft({ startTime: '18:00' }));

    expect(store.appointments()).toHaveLength(11);
    expect(created.endTime).toBe('18:30');

    store.updateAppointment(created.id, draft({ startTime: '19:00', notes: 'Actualizada' }));
    expect(store.appointments().find((appointment) => appointment.id === created.id)).toMatchObject(
      {
        startTime: '19:00',
        endTime: '19:30',
        notes: 'Actualizada',
      },
    );
  });

  it('should detect overlaps and exclude the current appointment when editing', () => {
    const existing = store
      .appointments()
      .find(
        (appointment) =>
          appointment.employeeId === 'e1' &&
          appointment.date === todayIso() &&
          appointment.status !== 'Cancelada',
      );

    expect(existing).toBeTruthy();
    expect(
      store.hasConflict(
        draft({
          employeeId: 'e1',
          employeeName: 'Mariana López',
          startTime: '09:15',
        }),
      ),
    ).toBe(true);
    expect(store.hasConflict(existing as AppointmentDraft, existing?.id)).toBe(false);
  });

  it('should ignore cancelled appointments in conflict detection', () => {
    const created = store.createAppointment(draft({ startTime: '18:00' }));
    store.cancelAppointment(created.id);

    expect(store.hasConflict(draft({ startTime: '18:00' }))).toBe(false);
    expect(store.appointments()).toHaveLength(11);
    expect(store.appointments().find((appointment) => appointment.id === created.id)?.status).toBe(
      'Cancelada',
    );
  });
});

function draft(overrides: Partial<AppointmentDraft> = {}): AppointmentDraft {
  return {
    clientId: 'c1',
    clientName: 'Lucía Mendoza',
    serviceId: 's1',
    serviceName: 'Corte clásico',
    employeeId: 'e7',
    employeeName: 'Laura Pineda',
    date: todayIso(),
    startTime: '17:00',
    durationMinutes: 30,
    status: 'Programada',
    notes: '',
    ...overrides,
  };
}

function todayIso(): string {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}
