import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppointmentsStore } from '../../../appointments/data/appointments.store';
import { DashboardPage } from './dashboard';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let component: DashboardPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([])],
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
    expect(metricValue(element, 'Citas programadas')).toBe('5');
    expect(metricValue(element, 'Empleados activos')).toBe('12');
    expect(metricValue(element, 'Citas atendidas')).toBe('2');
    expect(metricValue(element, 'Citas canceladas')).toBe('2');
    expect(text).toContain('Registradas en el historial');
  });

  it('should render all agenda data and accessible statuses', () => {
    const element = fixture.nativeElement as HTMLElement;
    const desktopRows = element.querySelectorAll('tbody tr');
    const text = element.textContent;

    expect(desktopRows).toHaveLength(5);
    expect(text).toContain('Lucía Mendoza');
    expect(text).toContain('Mateo Castro');
    expect(text).toContain('Valeria Ríos');
    expect(text).toContain('Tomás Herrera');
    expect(text).toContain('Isabella Navas');
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
    const upcomingSection = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('section'),
    ).find((section) => section.textContent?.includes('Próximos turnos'));
    expect(upcomingSection?.querySelectorAll('li')).toHaveLength(3);
  });

  it('should react to changes in the shared appointment store', () => {
    const store = TestBed.inject(AppointmentsStore);
    const element = fixture.nativeElement as HTMLElement;

    store.changeStatus(1, 'Cancelada');
    fixture.detectChanges();

    expect(metricValue(element, 'Citas programadas')).toBe('4');
    expect(metricValue(element, 'Citas canceladas')).toBe('3');
    expect(element.textContent).toContain('Lucía Mendoza');
  });

  it('should link the new appointment action to the appointments form', () => {
    const element = fixture.nativeElement as HTMLElement;
    const link = Array.from(element.querySelectorAll<HTMLAnchorElement>('a')).find((anchor) =>
      anchor.textContent?.includes('Nueva cita'),
    );

    expect(link?.getAttribute('href')).toBe('/citas?nueva=true');
  });
});

function metricValue(element: HTMLElement, label: string): string | undefined {
  const article = Array.from(
    element.querySelectorAll<HTMLElement>('[aria-label="Métricas del día"] article'),
  ).find((item) => item.textContent?.includes(label));
  return article?.querySelectorAll('p').item(1).textContent?.trim();
}
