import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeesPage } from './employees';

describe('EmployeesPage', () => {
  let fixture: ComponentFixture<EmployeesPage>;
  let component: EmployeesPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the page, demo data and calculated summary', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('Empleados');
    expect(text).toContain('Gestiona el equipo de trabajo y consulta su disponibilidad.');
    expect(text).toContain('Nuevo empleado');
    expect(component.summary()).toEqual({
      total: 12,
      active: 10,
      availableToday: 8,
      offShift: 2,
    });
    expect(element.querySelectorAll('tbody tr')).toHaveLength(12);
    expect(text).toContain('Mariana López');
    expect(text).toContain('mariana.lopez@ejemplo.com');
  });

  it('should filter employees by name, email, phone or specialty in real time', () => {
    const search = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#employee-search',
    );

    setInputValue(search, 'Andrés Vega');
    fixture.detectChanges();
    expect(component.filteredEmployees()).toHaveLength(1);
    expect(component.filteredEmployees()[0].specialty).toBe('Barbero');

    setInputValue(search, '310 000 0008');
    fixture.detectChanges();
    expect(component.filteredEmployees()).toHaveLength(1);
    expect(component.filteredEmployees()[0].firstName).toBe('Natalia');

    setInputValue(search, 'Manicurista');
    fixture.detectChanges();
    expect(component.filteredEmployees()).toHaveLength(2);
  });

  it('should combine status and availability filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('#employee-status');
    const availability = element.querySelector<HTMLSelectElement>('#employee-availability');

    setSelectValue(status, 'Activos');
    setSelectValue(availability, 'Ocupado');
    fixture.detectChanges();

    expect(component.filteredEmployees()).toHaveLength(2);
    expect(
      component
        .filteredEmployees()
        .every((employee) => employee.active && employee.availability === 'Ocupado'),
    ).toBe(true);

    setSelectValue(status, 'Inactivos');
    setSelectValue(availability, 'Fuera de turno');
    fixture.detectChanges();
    expect(component.filteredEmployees()).toHaveLength(2);
  });

  it('should clear every filter', () => {
    const element = fixture.nativeElement as HTMLElement;
    setInputValue(element.querySelector<HTMLInputElement>('#employee-search'), 'barbero');
    setSelectValue(element.querySelector<HTMLSelectElement>('#employee-status'), 'Activos');
    setSelectValue(
      element.querySelector<HTMLSelectElement>('#employee-availability'),
      'Disponible',
    );
    fixture.detectChanges();

    findButton(element, 'Limpiar filtros')?.click();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('');
    expect(component.statusFilter()).toBe('Todos');
    expect(component.availabilityFilter()).toBe('Todos');
    expect(component.filteredEmployees()).toHaveLength(12);
  });

  it('should open and close the employee form without changing data', () => {
    const element = fixture.nativeElement as HTMLElement;
    const initialCount = component.employees().length;

    findButton(element, 'Nuevo empleado')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#employee-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);

    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();

    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(component.employees()).toHaveLength(initialCount);
    expect(component.employeeForm.controls.firstName.value).toBe('');
  });

  it('should show clear required and email validation messages', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo empleado')?.click();
    fixture.detectChanges();

    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Los nombres son obligatorios.');
    expect(element.textContent).toContain('Los apellidos son obligatorios.');
    expect(element.textContent).toContain('El correo electrónico es obligatorio.');
    expect(element.textContent).toContain('El teléfono es obligatorio.');
    expect(element.textContent).toContain('La especialidad es obligatoria.');

    setInputValue(element.querySelector<HTMLInputElement>('#employee-email'), 'correo-invalido');
    fixture.detectChanges();
    expect(element.textContent).toContain('Introduce un correo electrónico válido.');
    expect(component.employeeForm.invalid).toBe(true);
  });

  it('should create an employee locally', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo empleado')?.click();
    fixture.detectChanges();

    component.employeeForm.setValue({
      firstName: 'Alma',
      lastName: 'Navarro',
      email: 'alma.navarro@ejemplo.com',
      phone: '310 000 0099',
      specialty: 'Podóloga',
      color: 'Violeta',
      active: true,
      notes: 'Registro demostrativo.',
    });
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.employees()).toHaveLength(13);
    expect(component.employees().at(-1)).toMatchObject({
      firstName: 'Alma',
      specialty: 'Podóloga',
      color: 'Violeta',
      availability: 'Disponible',
      todaySchedule: 'Sin turno asignado',
    });
    expect(component.confirmationMessage()).toBe('Empleado creado correctamente.');
  });

  it('should edit an existing employee locally', () => {
    const element = fixture.nativeElement as HTMLElement;
    const firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');

    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Editar')?.click();
    fixture.detectChanges();

    expect(component.employeeForm.controls.firstName.value).toBe('Mariana');
    component.employeeForm.controls.specialty.setValue('Directora creativa');
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.employees()[0].specialty).toBe('Directora creativa');
    expect(component.confirmationMessage()).toBe('Empleado actualizado correctamente.');
  });

  it('should confirm activation and deactivation and keep inactive employees unavailable', () => {
    const element = fixture.nativeElement as HTMLElement;
    let firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');

    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Desactivar')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#employee-status-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(element.textContent).toContain('¿Deseas desactivar a Mariana López?');
    expect(component.employees()[0].active).toBe(true);

    findButton(dialog ?? element, 'Confirmar')?.click();
    fixture.detectChanges();

    expect(component.employees()[0]).toMatchObject({
      active: false,
      availability: 'Fuera de turno',
      todaySchedule: 'Sin turno asignado',
    });
    expect(component.confirmationMessage()).toBe('Empleado desactivado correctamente.');
    expect(
      component
        .employees()
        .filter((employee) => !employee.active)
        .every((employee) => employee.availability !== 'Disponible'),
    ).toBe(true);

    firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');
    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Activar')?.click();
    fixture.detectChanges();
    findButton(dialog ?? element, 'Confirmar')?.click();
    fixture.detectChanges();

    expect(component.employees()[0].active).toBe(true);
    expect(component.employees()[0].availability).toBe('Fuera de turno');
    expect(component.confirmationMessage()).toBe('Empleado activado correctamente.');
  });

  it('should keep employee operations local without network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    component.employeeForm.setValue({
      firstName: 'Eva',
      lastName: 'Ficticia',
      email: 'eva.ficticia@ejemplo.com',
      phone: '310 000 0088',
      specialty: 'Asistente',
      color: 'Rosa',
      active: true,
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
