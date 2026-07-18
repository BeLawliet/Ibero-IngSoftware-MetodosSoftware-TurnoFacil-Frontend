import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let component: DashboardPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render the content heading', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(component).toBeTruthy();
    expect(text).toContain('Resumen de hoy');
    expect(text).toContain('Consulta la actividad y disponibilidad de tu equipo.');
    expect(text).toContain('Nueva cita');
  });

  it('should render the four summary metrics', () => {
    const element = fixture.nativeElement as HTMLElement;
    const metrics = element.querySelectorAll('[aria-label="Métricas del día"] article');
    const text = element.textContent;

    expect(metrics).toHaveLength(4);
    expect(text).toContain('Citas programadas');
    expect(text).toContain('18');
    expect(text).toContain('Empleados activos');
    expect(text).toContain('12');
    expect(text).toContain('Citas atendidas');
    expect(text).toContain('7');
    expect(text).toContain('Citas canceladas');
    expect(text).toContain('2');
  });

  it('should render all agenda data and accessible statuses', () => {
    const element = fixture.nativeElement as HTMLElement;
    const desktopRows = element.querySelectorAll('tbody tr');
    const text = element.textContent;

    expect(desktopRows).toHaveLength(5);
    expect(text).toContain('Laura Gómez');
    expect(text).toContain('Carlos Ruiz');
    expect(text).toContain('Sofía Martínez');
    expect(text).toContain('Miguel Sánchez');
    expect(text).toContain('Valentina Rojas');
    expect(text).toContain('Programada');
    expect(text).toContain('En atención');
    expect(text).toContain('Atendida');
    expect(text).toContain('Cancelada');
  });

  it('should render team availability and upcoming appointments', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(text).toContain('Mariana López');
    expect(text).toContain('Andrés Vega');
    expect(text).toContain('Daniela Torres');
    expect(text).toContain('Camila Romero');
    expect(text).toContain('Disponible');
    expect(text).toContain('Ocupado');
    expect(text).toContain('Fuera de turno');
    expect(text).toContain('Andrea Moreno');
    expect(text).toContain('Julián Pérez');
  });

  it('should keep the new appointment action local', () => {
    const element = fixture.nativeElement as HTMLElement;

    Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('Nueva cita'))
      ?.click();
    fixture.detectChanges();

    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'La creación de citas estará disponible próximamente.',
    );
  });
});
