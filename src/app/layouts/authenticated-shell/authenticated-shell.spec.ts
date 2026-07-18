import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthenticatedShell } from './authenticated-shell';

describe('AuthenticatedShell', () => {
  let fixture: ComponentFixture<AuthenticatedShell>;
  let component: AuthenticatedShell;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticatedShell],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticatedShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    document.body.style.overflow = '';
  });

  it('should create and render the shell information', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('TurnoFácil');
    expect(text).toContain('Inicio');
    expect(text).toContain('Administrador');
    expect((fixture.nativeElement as HTMLElement).querySelector('time')?.textContent?.trim()).toBe(
      component.formattedDate,
    );
  });

  it('should render the implemented navigation links', () => {
    const navigation = (fixture.nativeElement as HTMLElement).querySelector(
      'nav[aria-label="Navegación principal"]',
    );
    const links = navigation?.querySelectorAll('a');
    const disabledItems = navigation?.querySelectorAll('[aria-disabled="true"]');

    expect(links).toHaveLength(6);
    expect(links?.[0].getAttribute('href')).toBe('/dashboard');
    expect(links?.[1].getAttribute('href')).toBe('/agenda');
    expect(links?.[2].getAttribute('href')).toBe('/citas');
    expect(links?.[3].getAttribute('href')).toBe('/clientes');
    expect(links?.[4].getAttribute('href')).toBe('/empleados');
    expect(links?.[5].getAttribute('href')).toBe('/servicios');
    expect(disabledItems).toHaveLength(0);
    expect(navigation?.textContent).not.toContain('Configuración');
  });

  it('should open the mobile menu and lock document scrolling', () => {
    const openButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-label="Abrir menú principal"]',
    );

    openButton?.click();
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(true);
    expect(openButton?.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should close the mobile menu from its close button', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('[aria-label="Abrir menú principal"]')?.click();
    fixture.detectChanges();

    element
      .querySelectorAll<HTMLButtonElement>('[aria-label="Cerrar menú principal"]')
      .item(1)
      .click();
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should close the mobile menu from the backdrop', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('[aria-label="Abrir menú principal"]')?.click();
    fixture.detectChanges();

    element
      .querySelector<HTMLButtonElement>('.fixed.inset-0[aria-label="Cerrar menú principal"]')
      ?.click();
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(false);
  });

  it('should close the mobile menu with Escape', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[aria-label="Abrir menú principal"]')
      ?.click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should navigate to login when logging out', () => {
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="logout"]')
      ?.click();

    expect(navigation).toHaveBeenCalledWith('/login');
  });
});
