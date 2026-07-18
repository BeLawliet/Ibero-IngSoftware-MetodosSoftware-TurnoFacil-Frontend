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
