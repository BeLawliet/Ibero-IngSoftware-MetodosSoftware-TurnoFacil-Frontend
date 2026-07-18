import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsPage } from './clients';

describe('ClientsPage', () => {
  let fixture: ComponentFixture<ClientsPage>;
  let component: ClientsPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the page and initial summary', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('Clientes');
    expect(text).toContain('Administra la información de los clientes registrados.');
    expect(text).toContain('Nuevo cliente');
    expect(component.summary()).toEqual({ total: 24, active: 21, newThisMonth: 6 });
    expect(element.querySelectorAll('tbody tr')).toHaveLength(24);
    expect(text).toContain('Lucía Mendoza');
    expect(text).toContain('lucia.mendoza@ejemplo.com');
  });

  it('should filter clients by name, email or phone in real time', () => {
    const search = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#client-search',
    );

    if (search) {
      search.value = 'Lucía Mendoza';
      search.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    expect(component.filteredClients()).toHaveLength(1);
    expect(component.filteredClients()[0].email).toBe('lucia.mendoza@ejemplo.com');

    if (search) {
      search.value = '300 000 0024';
      search.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    expect(component.filteredClients()).toHaveLength(1);
    expect(component.filteredClients()[0].firstName).toBe('Daniel');
  });

  it('should filter by active status and clear filters', () => {
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector<HTMLSelectElement>('#client-status');

    if (select) {
      select.value = 'Inactivos';
      select.dispatchEvent(new Event('change'));
    }
    fixture.detectChanges();

    expect(component.filteredClients()).toHaveLength(3);
    expect(component.filteredClients().every((client) => !client.active)).toBe(true);

    Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('Limpiar filtros'))
      ?.click();
    fixture.detectChanges();

    expect(component.filteredClients()).toHaveLength(24);
    expect(component.statusFilter()).toBe('Todos');
  });

  it('should open and cancel the client form without changing data', () => {
    const element = fixture.nativeElement as HTMLElement;
    const initialCount = component.clients().length;

    findButton(element, 'Nuevo cliente')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#client-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);

    findButton(dialog ?? element, 'Cancelar')?.click();
    fixture.detectChanges();

    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(component.clients()).toHaveLength(initialCount);
    expect(component.clientForm.controls.firstName.value).toBe('');
  });

  it('should show required validation messages', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo cliente')?.click();
    fixture.detectChanges();

    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Los nombres son obligatorios.');
    expect(element.textContent).toContain('Los apellidos son obligatorios.');
    expect(element.textContent).toContain('El correo electrónico es obligatorio.');
    expect(element.textContent).toContain('El teléfono es obligatorio.');
    expect(component.clientForm.invalid).toBe(true);
  });

  it('should create a client locally', () => {
    const element = fixture.nativeElement as HTMLElement;
    findButton(element, 'Nuevo cliente')?.click();
    fixture.detectChanges();

    component.clientForm.setValue({
      firstName: 'Alma',
      lastName: 'Navarro',
      email: 'alma.navarro@ejemplo.com',
      phone: '300 000 0099',
      active: true,
      notes: 'Cliente demostrativo.',
    });
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.clients()).toHaveLength(25);
    expect(component.clients().at(-1)).toMatchObject({
      firstName: 'Alma',
      lastName: 'Navarro',
      email: 'alma.navarro@ejemplo.com',
      lastAppointment: 'Sin citas',
    });
    expect(component.confirmationMessage()).toBe('Cliente creado correctamente.');
  });

  it('should edit an existing client locally', () => {
    const element = fixture.nativeElement as HTMLElement;
    const firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');

    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Editar')?.click();
    fixture.detectChanges();

    expect(component.clientForm.controls.firstName.value).toBe('Lucía');
    component.clientForm.controls.firstName.setValue('Luisa');
    element.querySelector<HTMLFormElement>('dialog form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.clients()[0].firstName).toBe('Luisa');
    expect(component.confirmationMessage()).toBe('Cliente actualizado correctamente.');
  });

  it('should ask for confirmation before changing client status', () => {
    const element = fixture.nativeElement as HTMLElement;
    const firstRow = element.querySelector<HTMLTableRowElement>('tbody tr');

    firstRow?.querySelector<HTMLButtonElement>('[aria-label^="Acciones para"]')?.click();
    fixture.detectChanges();
    findButton(firstRow ?? element, 'Desactivar')?.click();
    fixture.detectChanges();

    const dialog = element
      .querySelector<HTMLDialogElement>('#status-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(element.textContent).toContain('¿Deseas desactivar a Lucía Mendoza?');
    expect(component.clients()[0].active).toBe(true);

    findButton(dialog ?? element, 'Confirmar')?.click();
    fixture.detectChanges();

    expect(component.clients()[0].active).toBe(false);
    expect(component.confirmationMessage()).toBe('Cliente desactivado correctamente.');
  });

  it('should keep client operations local without network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    component.clientForm.setValue({
      firstName: 'Eva',
      lastName: 'Ficticia',
      email: 'eva.ficticia@ejemplo.com',
      phone: '300 000 0088',
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
