import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppointmentsPage } from './appointments';

describe('AppointmentsPage', () => {
  let fixture: ComponentFixture<AppointmentsPage>;
  let component: AppointmentsPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the page, demo appointments and calculated summary', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('Citas');
    expect(text).toContain('Administra las citas programadas y realiza seguimiento a su estado.');
    expect(text).toContain('Nueva cita');
    expect(component.appointments()).toHaveLength(10);
    expect(component.summary()).toEqual({ today: 5, scheduled: 5, inProgress: 1, cancelled: 2 });
    expect(element.querySelectorAll('tbody tr')).toHaveLength(10);
    expect(text).toContain('Lucía Mendoza');
    expect(text).toContain('Corte clásico');
    expect(text).toContain('Mariana López');
  });

  it('should search and combine status, employee and date filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    setInputValue(element.querySelector<HTMLInputElement>('#appointment-search'), 'Manicure');
    fixture.detectChanges();
    expect(component.filteredAppointments()).toHaveLength(2);

    setInputValue(element.querySelector<HTMLInputElement>('#appointment-search'), '');
    setSelectValue(
      element.querySelector<HTMLSelectElement>('#appointment-status-filter'),
      'Programada',
    );
    setSelectValue(element.querySelector<HTMLSelectElement>('#appointment-employee-filter'), 'e1');
    setSelectValue(element.querySelector<HTMLSelectElement>('#appointment-date-filter'), 'Hoy');
    fixture.detectChanges();

    expect(component.filteredAppointments()).toHaveLength(1);
    expect(component.filteredAppointments()[0].clientName).toBe('Lucía Mendoza');
  });

  it('should filter relative dates and clear all filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    setSelectValue(element.querySelector<HTMLSelectElement>('#appointment-date-filter'), 'Mañana');
    fixture.detectChanges();
    expect(component.filteredAppointments()).toHaveLength(2);

    findButton(element, 'Limpiar filtros')?.click();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('');
    expect(component.statusFilter()).toBe('Todos');
    expect(component.employeeFilter()).toBe('Todos');
    expect(component.dateFilter()).toBe('Todas');
    expect(component.filteredAppointments()).toHaveLength(10);
  });

  it('should open and close an empty form with Programada as initial status', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nueva cita')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#appointment-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(component.appointmentForm.controls.status.value).toBe('Programada');

    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(component.appointments()).toHaveLength(10);
  });

  it('should show required validation messages and reject past dates on creation', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nueva cita')?.click();
    fixture.detectChanges();
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.textContent).toContain('El cliente es obligatorio.');
    expect(element.textContent).toContain('El servicio es obligatorio.');
    expect(element.textContent).toContain('El empleado es obligatorio.');
    expect(element.textContent).toContain('La fecha es obligatoria.');
    expect(element.textContent).toContain('La hora de inicio es obligatoria.');

    component.appointmentForm.setValue({
      clientId: 'c1',
      serviceId: 's1',
      employeeId: 'e7',
      date: addDaysIso(-1),
      startTime: '18:00',
      status: 'Programada',
      notes: '',
    });
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.textContent).toContain('La fecha no puede ser anterior al día de hoy.');
    expect(component.appointments()).toHaveLength(10);
  });

  it('should calculate and display the estimated end time', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nueva cita')?.click();
    fixture.detectChanges();

    setSelectValue(element.querySelector<HTMLSelectElement>('#appointment-service'), 's4');
    setInputValue(element.querySelector<HTMLInputElement>('#appointment-time'), '09:15');
    fixture.detectChanges();

    expect(component.previewDuration()).toBe(90);
    expect(component.estimatedEndTime()).toBe('10:45');
    expect(element.textContent).toContain('Finaliza aproximadamente a las 10:45');
  });

  it('should create an appointment locally', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nueva cita')?.click();
    fixture.detectChanges();

    component.appointmentForm.setValue({
      clientId: 'c6',
      serviceId: 's1',
      employeeId: 'e7',
      date: component.todayIso,
      startTime: '18:00',
      status: 'Programada',
      notes: 'Cita demostrativa.',
    });
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.appointments()).toHaveLength(11);
    expect(component.appointments().at(-1)).toMatchObject({
      clientName: 'Samuel Pardo',
      serviceName: 'Corte clásico',
      employeeName: 'Laura Pineda',
      startTime: '18:00',
      endTime: '18:30',
    });
    expect(component.confirmationMessage()).toBe('Cita creada correctamente.');
  });

  it('should edit an appointment and exclude itself from conflict detection', () => {
    const element = fixture.nativeElement as HTMLElement;
    const row = findTableRow(element, 'Lucía Mendoza');
    row?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para la cita"]')?.click();
    fixture.detectChanges();
    findButton(row ?? element, 'Editar')?.click();
    fixture.detectChanges();

    expect(component.appointmentForm.controls.clientId.value).toBe('c1');
    component.appointmentForm.controls.notes.setValue('Preferencia actualizada.');
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.appointments().find((appointment) => appointment.id === 1)?.notes).toBe(
      'Preferencia actualizada.',
    );
    expect(component.confirmationMessage()).toBe('Cita actualizada correctamente.');
  });

  it('should preserve form values and reject overlapping appointments', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nueva cita')?.click();
    fixture.detectChanges();
    component.appointmentForm.setValue({
      clientId: 'c2',
      serviceId: 's1',
      employeeId: 'e1',
      date: component.todayIso,
      startTime: '09:15',
      status: 'Programada',
      notes: '',
    });
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.appointments()).toHaveLength(10);
    expect(component.conflictMessage()).toContain('se cruza con este horario');
    expect(component.appointmentForm.controls.startTime.value).toBe('09:15');
    expect(
      element.querySelector<HTMLDialogElement>('#appointment-dialog-title')?.closest('dialog')
        ?.open,
    ).toBe(true);
  });

  it('should change state through the available actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    const row = findTableRow(element, 'Lucía Mendoza');
    row?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para la cita"]')?.click();
    fixture.detectChanges();
    findButton(row ?? element, 'Marcar como En atención')?.click();
    fixture.detectChanges();

    expect(component.appointments().find((appointment) => appointment.id === 1)?.status).toBe(
      'En atención',
    );
    expect(component.confirmationMessage()).toContain('En atención');
  });

  it('should cancel with confirmation without deleting the appointment', () => {
    const element = fixture.nativeElement as HTMLElement;
    const row = findTableRow(element, 'Lucía Mendoza');
    row?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para la cita"]')?.click();
    fixture.detectChanges();
    findButton(row ?? element, 'Cancelar cita')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#cancel-appointment-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(element.textContent).toContain('¿Deseas cancelar la cita de Lucía Mendoza?');

    findButton(dialog ?? element, 'Confirmar cancelación')?.click();
    fixture.detectChanges();

    expect(component.appointments()).toHaveLength(10);
    expect(component.appointments().find((appointment) => appointment.id === 1)?.status).toBe(
      'Cancelada',
    );
    expect(component.confirmationMessage()).toBe('Cita cancelada correctamente.');
  });

  it('should keep appointment operations local without network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    component.appointmentForm.setValue({
      clientId: 'c6',
      serviceId: 's1',
      employeeId: 'e7',
      date: component.todayIso,
      startTime: '18:00',
      status: 'Programada',
      notes: '',
    });

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLFormElement>('dialog form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

function findButton(container: ParentNode, text: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
    button.textContent?.includes(text),
  );
}

function findTableRow(element: HTMLElement, text: string): HTMLTableRowElement | undefined {
  return Array.from(element.querySelectorAll<HTMLTableRowElement>('tbody tr')).find((row) =>
    row.textContent?.includes(text),
  );
}

function setInputValue(input: HTMLInputElement | null, value: string): void {
  if (!input) {
    return;
  }
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function setSelectValue(select: HTMLSelectElement | null, value: string): void {
  if (!select) {
    return;
  }
  select.value = value;
  select.dispatchEvent(new Event('change'));
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
