import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppointmentsStore } from '../../../appointments/data/appointments.store';
import {
  addLocalDays,
  startOfWeekMonday,
  toLocalIsoDate,
} from '../../../../shared/utils/date.utils';
import { AgendaPage } from './agenda';

describe('AgendaPage', () => {
  let fixture: ComponentFixture<AgendaPage>;
  let component: AgendaPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render agenda with the shared appointments and seven days', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('Agenda');
    expect(text).toContain('Consulta la programación y disponibilidad de tu equipo.');
    expect(text).toContain('Nueva cita');
    expect(component.weekDays()).toHaveLength(7);
    expect(component.appointments()).toHaveLength(10);
    expect(element.querySelectorAll('[data-testid="calendar-appointment"]').length).toBeGreaterThan(
      0,
    );
  });

  it('should start the visible week on Monday and expose a Colombian date range', () => {
    expect(component.weekStart().getDay()).toBe(1);
    expect(component.weekDays()[0].dayName.toLocaleLowerCase('es')).toContain('lun');
    expect(component.rangeLabel()).toContain(`${new Date().getFullYear()}`);
  });

  it('should navigate to previous and next weeks', () => {
    const element = fixture.nativeElement as HTMLElement;
    const initial = toLocalIsoDate(component.weekStart());

    element.querySelector<HTMLButtonElement>('[aria-label="Ir a la semana anterior"]')?.click();
    fixture.detectChanges();
    expect(toLocalIsoDate(component.weekStart())).toBe(
      toLocalIsoDate(addLocalDays(startOfWeekMonday(new Date()), -7)),
    );

    element.querySelector<HTMLButtonElement>('[aria-label="Ir a la semana siguiente"]')?.click();
    fixture.detectChanges();
    expect(toLocalIsoDate(component.weekStart())).toBe(initial);
  });

  it('should return to the current week and select today', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('[aria-label="Ir a la semana siguiente"]')?.click();
    fixture.detectChanges();

    findButton(element, 'Hoy')?.click();
    fixture.detectChanges();

    expect(toLocalIsoDate(component.weekStart())).toBe(
      toLocalIsoDate(startOfWeekMonday(new Date())),
    );
    expect(component.selectedDate()).toBe(component.todayIso);
  });

  it('should group appointments by day in chronological order', () => {
    const todayAppointments = component
      .visibleAppointments()
      .filter((appointment) => appointment.date === component.todayIso);

    expect(todayAppointments).toHaveLength(5);
    expect(todayAppointments.map((appointment) => appointment.startTime)).toEqual([
      '09:00',
      '10:00',
      '11:30',
      '14:00',
      '15:00',
    ]);
  });

  it('should filter by employee and status without changing the store', () => {
    const element = fixture.nativeElement as HTMLElement;
    const initialStoreLength = component.appointments().length;
    setSelectValue(element.querySelector<HTMLSelectElement>('#agenda-employee-filter'), 'e1');
    setSelectValue(element.querySelector<HTMLSelectElement>('#agenda-status-filter'), 'Programada');
    fixture.detectChanges();

    expect(component.visibleAppointments().length).toBeGreaterThan(0);
    expect(
      component
        .visibleAppointments()
        .every(
          (appointment) => appointment.employeeId === 'e1' && appointment.status === 'Programada',
        ),
    ).toBe(true);
    expect(component.appointments()).toHaveLength(initialStoreLength);
  });

  it('should show cancelled appointments attenuated and clear filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    setSelectValue(element.querySelector<HTMLSelectElement>('#agenda-status-filter'), 'Cancelada');
    fixture.detectChanges();

    expect(component.visibleAppointments().length).toBeGreaterThan(0);
    expect(
      component.visibleAppointments().every((appointment) => appointment.status === 'Cancelada'),
    ).toBe(true);
    expect(
      element.querySelectorAll('[data-testid="calendar-appointment"].opacity-60').length,
    ).toBeGreaterThan(0);

    findButton(element, 'Limpiar filtros')?.click();
    fixture.detectChanges();
    expect(component.employeeFilter()).toBe('Todos');
    expect(component.statusFilter()).toBe('Todos');
  });

  it('should open and close the read-only appointment detail', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('[data-testid="calendar-appointment"]')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#appointment-detail-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(dialog?.textContent).toContain('Cliente');
    expect(dialog?.textContent).toContain('Servicio');
    expect(dialog?.textContent).toContain('Empleado');
    expect(dialog?.textContent).toContain('Duración');

    findButton(dialog ?? element, 'Cerrar')?.click();
    fixture.detectChanges();
    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(component.selectedAppointment()).toBeNull();
  });

  it('should navigate to appointments from the detail dialog', () => {
    const element = fixture.nativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    element.querySelector<HTMLButtonElement>('[data-testid="calendar-appointment"]')?.click();
    fixture.detectChanges();

    findButton(element, 'Administrar cita')?.click();

    expect(navigation).toHaveBeenCalledWith('/citas');
  });

  it('should navigate with date and time when selecting a free interval', () => {
    const element = fixture.nativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const slot = element.querySelector<HTMLButtonElement>('[data-testid="free-slot"]');

    slot?.click();

    expect(navigation).toHaveBeenCalledOnce();
    expect(navigation.mock.calls[0][0]).toEqual(['/citas']);
    expect(navigation.mock.calls[0][1]?.queryParams).toMatchObject({
      nueva: true,
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      hora: expect.stringMatching(/^\d{2}:\d{2}$/),
    });
  });

  it('should show the empty state for a period without matching appointments', () => {
    component.employeeFilter.set('empleado-inexistente');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(component.visibleAppointments()).toHaveLength(0);
    expect(text).toContain('No hay citas programadas');
    expect(text).toContain('Crear una cita');
  });

  it('should react to new appointments from the shared store', () => {
    const store = TestBed.inject(AppointmentsStore);
    const initialLength = component.visibleAppointments().length;
    store.createAppointment({
      clientId: 'c6',
      clientName: 'Samuel Pardo',
      serviceId: 's1',
      serviceName: 'Corte clásico',
      employeeId: 'e7',
      employeeName: 'Laura Pineda',
      date: component.todayIso,
      startTime: '19:00',
      durationMinutes: 30,
      status: 'Programada',
      notes: 'Creada desde el store compartido.',
    });
    fixture.detectChanges();

    expect(component.visibleAppointments()).toHaveLength(initialLength + 1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Samuel Pardo');
  });

  it('should not make HTTP requests while using agenda', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="calendar-appointment"]')
      ?.click();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

function findButton(container: ParentNode, text: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
    button.textContent?.includes(text),
  );
}

function setSelectValue(select: HTMLSelectElement | null, value: string): void {
  if (!select) {
    return;
  }
  select.value = value;
  select.dispatchEvent(new Event('change'));
}
