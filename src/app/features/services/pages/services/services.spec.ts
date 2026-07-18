import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicesPage } from './services';

describe('ServicesPage', () => {
  let fixture: ComponentFixture<ServicesPage>;
  let component: ServicesPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the page, demo data and calculated summary', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('Servicios');
    expect(text).toContain('Administra los servicios ofrecidos y su duración.');
    expect(text).toContain('Nuevo servicio');
    expect(component.summary()).toEqual({
      total: 8,
      active: 7,
      averageDuration: 58,
      mostRequested: 'Corte y barba',
    });
    expect(element.querySelectorAll('tbody tr')).toHaveLength(8);
    expect(text).toContain('Corte clásico');
    expect(text).toContain('Diseño de cejas');
  });

  it('should filter services by name, category or description in real time', () => {
    const search = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#service-search',
    );

    setInputValue(search, 'Corte y barba');
    fixture.detectChanges();
    expect(component.filteredServices()).toHaveLength(1);
    expect(component.filteredServices()[0].category).toBe('Barbería');

    setInputValue(search, 'Consulta');
    fixture.detectChanges();
    expect(component.filteredServices()).toHaveLength(1);

    setInputValue(search, 'hidratación');
    fixture.detectChanges();
    expect(component.filteredServices()).toHaveLength(1);
    expect(component.filteredServices()[0].name).toBe('Limpieza facial');
  });

  it('should combine category and status filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    setSelectValue(element.querySelector<HTMLSelectElement>('#service-category-filter'), 'Belleza');
    setSelectValue(element.querySelector<HTMLSelectElement>('#service-status'), 'Activos');
    fixture.detectChanges();

    expect(component.filteredServices()).toHaveLength(2);
    expect(
      component
        .filteredServices()
        .every((service) => service.category === 'Belleza' && service.active),
    ).toBe(true);

    setSelectValue(element.querySelector<HTMLSelectElement>('#service-status'), 'Inactivos');
    fixture.detectChanges();
    expect(component.filteredServices()).toHaveLength(1);
    expect(component.filteredServices()[0].name).toBe('Diseño de cejas');
  });

  it('should clear every filter', () => {
    const element = fixture.nativeElement as HTMLElement;
    setInputValue(element.querySelector<HTMLInputElement>('#service-search'), 'corte');
    setSelectValue(element.querySelector<HTMLSelectElement>('#service-status'), 'Activos');
    setSelectValue(
      element.querySelector<HTMLSelectElement>('#service-category-filter'),
      'Barbería',
    );
    fixture.detectChanges();

    findButton(element, 'Limpiar filtros')?.click();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('');
    expect(component.statusFilter()).toBe('Todos');
    expect(component.categoryFilter()).toBe('Todas');
    expect(component.filteredServices()).toHaveLength(8);
  });

  it('should open and close the service form without changing data', () => {
    const element = fixture.nativeElement as HTMLElement;
    const initialCount = component.services().length;

    findButton(element, 'Nuevo servicio')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#service-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);

    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();

    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(component.services()).toHaveLength(initialCount);
    expect(component.serviceForm.controls.name.value).toBe('');
  });

  it('should validate name, category, duration and price', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo servicio')?.click();
    fixture.detectChanges();

    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.textContent).toContain('El nombre del servicio es obligatorio.');
    expect(element.textContent).toContain('La categoría es obligatoria.');
    expect(element.textContent).toContain('Selecciona una duración mayor que cero.');
    expect(element.textContent).toContain('El precio es obligatorio.');

    setInputValue(element.querySelector<HTMLInputElement>('#service-price'), '-1');
    fixture.detectChanges();
    expect(element.textContent).toContain('El precio debe ser igual o mayor que cero.');
    expect(component.serviceForm.invalid).toBe(true);
  });

  it('should enforce the reasonable description length', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo servicio')?.click();
    fixture.detectChanges();

    setInputValue(
      element.querySelector<HTMLTextAreaElement>('#service-description'),
      'a'.repeat(181),
    );
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.serviceForm.controls.description.hasError('maxlength')).toBe(true);
    expect(element.textContent).toContain('La descripción no puede superar los 180 caracteres.');
  });

  it('should create a service locally with no assigned employees', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo servicio')?.click();
    fixture.detectChanges();

    component.serviceForm.setValue({
      name: 'Diagnóstico capilar',
      description: 'Valoración demostrativa.',
      category: 'Consulta',
      duration: '45',
      price: '40000',
      color: 'Violeta',
      active: true,
    });
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.services()).toHaveLength(9);
    expect(component.services().at(-1)).toMatchObject({
      name: 'Diagnóstico capilar',
      category: 'Consulta',
      duration: 45,
      price: 40000,
      assignedEmployees: 0,
      appointmentCount: 0,
    });
    expect(component.confirmationMessage()).toBe('Servicio creado correctamente.');
  });

  it('should edit an existing service locally', () => {
    const element = fixture.nativeElement as HTMLElement;
    const firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');

    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Editar')?.click();
    fixture.detectChanges();

    expect(component.serviceForm.controls.name.value).toBe('Corte clásico');
    component.serviceForm.controls.price.setValue('28000');
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.services()[0].price).toBe(28000);
    expect(component.confirmationMessage()).toBe('Servicio actualizado correctamente.');
  });

  it('should confirm deactivation and activation without deleting the service', () => {
    const element = fixture.nativeElement as HTMLElement;
    let firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');

    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Desactivar')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#service-status-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(element.textContent).toContain('¿Deseas desactivar Corte clásico?');
    findButton(dialog ?? element, 'Confirmar')?.click();
    fixture.detectChanges();

    expect(component.services()).toHaveLength(8);
    expect(component.services()[0].active).toBe(false);
    expect(component.confirmationMessage()).toBe('Servicio desactivado correctamente.');

    firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');
    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Activar')?.click();
    fixture.detectChanges();
    findButton(dialog ?? element, 'Confirmar')?.click();
    fixture.detectChanges();

    expect(component.services()[0].active).toBe(true);
    expect(component.confirmationMessage()).toBe('Servicio activado correctamente.');
  });

  it('should format durations and prices for display', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('30 min');
    expect(text).toContain('1 hora 30 min');
    expect(text).toContain('$');
    expect(text).toContain('25.000');
  });

  it('should keep service operations local without network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    component.serviceForm.setValue({
      name: 'Servicio local',
      description: '',
      category: 'Otro',
      duration: '15',
      price: '0',
      color: 'Turquesa',
      active: true,
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

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement | null, value: string): void {
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
