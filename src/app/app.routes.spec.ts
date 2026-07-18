import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LoginPage } from './features/auth/pages/login/login';
import { AuthenticatedShell } from './layouts/authenticated-shell/authenticated-shell';
import { routes } from './app.routes';

describe('application routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('should redirect the root path to login', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('');

    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('should load the login page lazily', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/login', LoginPage);

    expect(component).toBeInstanceOf(LoginPage);
  });

  it('should load the dashboard inside the authenticated shell', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/dashboard', AuthenticatedShell);

    expect(component).toBeInstanceOf(AuthenticatedShell);
    expect(document.querySelector('app-authenticated-shell')).toBeTruthy();
    expect(document.querySelector('app-dashboard-page')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('should load agenda inside the authenticated shell', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/agenda', AuthenticatedShell);

    expect(component).toBeInstanceOf(AuthenticatedShell);
    expect(document.querySelector('app-agenda-page')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/agenda');
  });

  it('should load appointments inside the authenticated shell', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/citas', AuthenticatedShell);

    expect(component).toBeInstanceOf(AuthenticatedShell);
    expect(document.querySelector('app-appointments-page')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/citas');
  });

  it('should open the appointment form from the dashboard query parameter and clean the URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/citas?nueva=true', AuthenticatedShell);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const dialog = document
      .querySelector<HTMLDialogElement>('#appointment-dialog-title')
      ?.closest('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(TestBed.inject(Router).url).toBe('/citas');
  });

  it('should prefill a valid date and time from agenda and remove the parameters', async () => {
    const harness = await RouterTestingHarness.create();
    const date = todayIso();

    await harness.navigateByUrl(`/citas?nueva=true&fecha=${date}&hora=16:30`, AuthenticatedShell);
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(document.querySelector<HTMLInputElement>('#appointment-date')?.value).toBe(date);
    expect(document.querySelector<HTMLInputElement>('#appointment-time')?.value).toBe('16:30');
    expect(TestBed.inject(Router).url).toBe('/citas');
  });

  it('should ignore invalid agenda parameters safely', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(
      '/citas?nueva=true&fecha=2026-99-99&hora=29:90',
      AuthenticatedShell,
    );
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(document.querySelector<HTMLInputElement>('#appointment-date')?.value).toBe('');
    expect(document.querySelector<HTMLInputElement>('#appointment-time')?.value).toBe('');
    expect(TestBed.inject(Router).url).toBe('/citas');
  });

  it('should load clients inside the authenticated shell', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/clientes', AuthenticatedShell);

    expect(component).toBeInstanceOf(AuthenticatedShell);
    expect(document.querySelector('app-clients-page')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/clientes');
  });

  it('should load employees inside the authenticated shell', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/empleados', AuthenticatedShell);

    expect(component).toBeInstanceOf(AuthenticatedShell);
    expect(document.querySelector('app-employees-page')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/empleados');
  });

  it('should load services inside the authenticated shell', async () => {
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/servicios', AuthenticatedShell);

    expect(component).toBeInstanceOf(AuthenticatedShell);
    expect(document.querySelector('app-services-page')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/servicios');
  });

  it('should redirect unknown paths to login', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/ruta-inexistente');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});

function todayIso(): string {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}
