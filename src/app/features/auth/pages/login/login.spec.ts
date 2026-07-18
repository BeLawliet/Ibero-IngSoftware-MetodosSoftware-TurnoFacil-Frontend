import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render every reference text exactly', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent?.replace(/\s+/g, ' ');
    const titleLines = Array.from(element.querySelectorAll('#login-presentation-title span')).map(
      (line) => line.textContent?.trim(),
    );

    expect(text).toContain('TurnoFácil');
    expect(titleLines).toEqual(['Gestiona los turnos', 'de tu equipo', 'sin esfuerzo']);
    expect(text).toContain(
      'Planifica, asigna y visualiza los horarios de tu equipo desde un solo lugar. Ahorra tiempo y evita conflictos.',
    );
    expect(text).toContain('Disponibilidad del equipo en tiempo real');
    expect(text).toContain('Calendario visual de turnos');
    expect(text).toContain('Reportes automáticos de asistencia');
    expect(text).toContain('+12 empleados activos hoy');
    expect(text).toContain('4 turnos en las próximas 2 horas');
    expect(text).toContain('Bienvenido de vuelta');
    expect(text).toContain('Ingresa tus credenciales para continuar');
    expect(text).toContain('¿Olvidaste tu contraseña?');
    expect(text).toContain('Iniciar sesión');
    expect(text).toContain('Demo: Usa cualquier email y contraseña para ingresar al panel.');
    expect(text).toContain('¿No tienes cuenta? Contáctanos');
  });

  it('should start with an invalid form', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('should require an email', () => {
    component.loginForm.controls.email.setValue('');

    expect(component.loginForm.controls.email.hasError('required')).toBe(true);
  });

  it('should reject an invalid email format', () => {
    component.loginForm.controls.email.setValue('correo-invalido');

    expect(component.loginForm.controls.email.hasError('email')).toBe(true);
  });

  it('should require a password', () => {
    component.loginForm.controls.password.setValue('');

    expect(component.loginForm.controls.password.hasError('required')).toBe(true);
  });

  it('should accept a valid form locally', () => {
    component.loginForm.setValue({
      email: 'admin@empresa.com',
      password: 'demo',
    });

    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.loginForm.valid).toBe(true);
    expect(component.demoSubmissionAccepted()).toBe(true);
  });

  it('should mark every field as touched after an invalid submission', () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.loginForm.controls.email.touched).toBe(true);
    expect(component.loginForm.controls.password.touched).toBe(true);
  });

  it('should associate labels and autocomplete attributes with both fields', () => {
    const element = fixture.nativeElement as HTMLElement;
    const email = element.querySelector<HTMLInputElement>('#email');
    const password = element.querySelector<HTMLInputElement>('#password');

    expect(element.querySelector('label[for="email"]')?.textContent).toContain(
      'Correo electrónico',
    );
    expect(element.querySelector('label[for="password"]')?.textContent).toContain('Contraseña');
    expect(email?.autocomplete).toBe('email');
    expect(password?.autocomplete).toBe('current-password');
    expect(email?.placeholder).toBe('admin@empresa.com');
    expect(password?.placeholder).toBe('');
  });

  it('should render four overlapping employee avatars', () => {
    const avatars = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[aria-label="Empleados activos"] > span',
    );

    expect(avatars).toHaveLength(4);
  });
});
