import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type ServiceCategory = 'Barbería' | 'Belleza' | 'Consulta' | 'Asesoría' | 'Otro';
type ServiceStatusFilter = 'Todos' | 'Activos' | 'Inactivos';
type ServiceCategoryFilter = 'Todas' | ServiceCategory;
type ServiceFormMode = 'create' | 'edit';
type ServiceColor = 'Turquesa' | 'Azul' | 'Violeta' | 'Ámbar' | 'Rosa';
type ServiceFormControlName = 'name' | 'description' | 'category' | 'duration' | 'price';

interface Service {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly category: ServiceCategory;
  readonly duration: number;
  readonly price: number;
  readonly color: ServiceColor;
  readonly active: boolean;
  readonly assignedEmployees: number;
  readonly appointmentCount: number;
}

interface ColorOption {
  readonly name: ServiceColor;
  readonly swatchClass: string;
}

const INITIAL_SERVICES: readonly Service[] = [
  {
    id: 1,
    name: 'Corte clásico',
    description: 'Corte personalizado con acabado y peinado.',
    category: 'Barbería',
    duration: 30,
    price: 25000,
    color: 'Turquesa',
    active: true,
    assignedEmployees: 3,
    appointmentCount: 46,
  },
  {
    id: 2,
    name: 'Corte y barba',
    description: 'Corte de cabello y perfilado completo de barba.',
    category: 'Barbería',
    duration: 60,
    price: 45000,
    color: 'Azul',
    active: true,
    assignedEmployees: 2,
    appointmentCount: 62,
  },
  {
    id: 3,
    name: 'Manicure semipermanente',
    description: 'Cuidado de manos y esmaltado de larga duración.',
    category: 'Belleza',
    duration: 60,
    price: 50000,
    color: 'Violeta',
    active: true,
    assignedEmployees: 2,
    appointmentCount: 51,
  },
  {
    id: 4,
    name: 'Limpieza facial',
    description: 'Limpieza profunda e hidratación según el tipo de piel.',
    category: 'Belleza',
    duration: 90,
    price: 85000,
    color: 'Rosa',
    active: true,
    assignedEmployees: 1,
    appointmentCount: 38,
  },
  {
    id: 5,
    name: 'Consulta general',
    description: 'Espacio de valoración y orientación profesional.',
    category: 'Consulta',
    duration: 45,
    price: 70000,
    color: 'Ámbar',
    active: true,
    assignedEmployees: 2,
    appointmentCount: 33,
  },
  {
    id: 6,
    name: 'Asesoría de imagen',
    description: 'Recomendaciones personalizadas de estilo e imagen.',
    category: 'Asesoría',
    duration: 60,
    price: 90000,
    color: 'Azul',
    active: true,
    assignedEmployees: 1,
    appointmentCount: 27,
  },
  {
    id: 7,
    name: 'Masaje relajante',
    description: 'Sesión corporal enfocada en descanso y bienestar.',
    category: 'Otro',
    duration: 90,
    price: 110000,
    color: 'Turquesa',
    active: true,
    assignedEmployees: 2,
    appointmentCount: 41,
  },
  {
    id: 8,
    name: 'Diseño de cejas',
    description: 'Diseño y definición de cejas según el rostro.',
    category: 'Belleza',
    duration: 30,
    price: 30000,
    color: 'Rosa',
    active: false,
    assignedEmployees: 0,
    appointmentCount: 19,
  },
];

@Component({
  selector: 'app-services-page',
  imports: [ReactiveFormsModule],
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly serviceDialog = viewChild<ElementRef<HTMLDialogElement>>('serviceDialog');
  private readonly statusDialog = viewChild<ElementRef<HTMLDialogElement>>('statusDialog');
  private readonly currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  readonly services = signal<Service[]>([...INITIAL_SERVICES]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<ServiceStatusFilter>('Todos');
  readonly categoryFilter = signal<ServiceCategoryFilter>('Todas');
  readonly formMode = signal<ServiceFormMode>('create');
  readonly editingServiceId = signal<number | null>(null);
  readonly pendingStatusService = signal<Service | null>(null);
  readonly formSubmitted = signal(false);
  readonly actionsServiceId = signal<number | null>(null);
  readonly confirmationMessage = signal('');

  readonly categories: readonly ServiceCategory[] = [
    'Barbería',
    'Belleza',
    'Consulta',
    'Asesoría',
    'Otro',
  ];
  readonly durations: readonly number[] = [15, 30, 45, 60, 90, 120];
  readonly colorOptions: readonly ColorOption[] = [
    { name: 'Turquesa', swatchClass: 'bg-brand-teal' },
    { name: 'Azul', swatchClass: 'bg-blue-500' },
    { name: 'Violeta', swatchClass: 'bg-violet-500' },
    { name: 'Ámbar', swatchClass: 'bg-amber-500' },
    { name: 'Rosa', swatchClass: 'bg-pink-500' },
  ];

  readonly serviceForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.maxLength(180)],
    category: ['' as ServiceCategory | '', Validators.required],
    duration: ['', [Validators.required, Validators.min(1)]],
    price: ['', [Validators.required, Validators.min(0)]],
    color: ['Turquesa' as ServiceColor],
    active: [true],
  });

  readonly summary = computed(() => {
    const services = this.services();
    const averageDuration = services.length
      ? Math.round(
          services.reduce((total, service) => total + service.duration, 0) / services.length,
        )
      : 0;
    const mostRequested = services.reduce<Service | null>(
      (current, service) =>
        !current || service.appointmentCount > current.appointmentCount ? service : current,
      null,
    );
    return {
      total: services.length,
      active: services.filter((service) => service.active).length,
      averageDuration,
      mostRequested: mostRequested?.name ?? 'Sin datos',
    };
  });

  readonly filteredServices = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    const status = this.statusFilter();
    const category = this.categoryFilter();

    return this.services().filter((service) => {
      const matchesSearch =
        !query ||
        service.name.toLocaleLowerCase('es').includes(query) ||
        service.category.toLocaleLowerCase('es').includes(query) ||
        service.description.toLocaleLowerCase('es').includes(query);
      const matchesStatus =
        status === 'Todos' ||
        (status === 'Activos' && service.active) ||
        (status === 'Inactivos' && !service.active);
      const matchesCategory = category === 'Todas' || service.category === category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  });

  readonly hasFilters = computed(
    () =>
      this.searchTerm().trim().length > 0 ||
      this.statusFilter() !== 'Todos' ||
      this.categoryFilter() !== 'Todas',
  );

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as ServiceStatusFilter);
  }

  protected updateCategoryFilter(event: Event): void {
    this.categoryFilter.set((event.target as HTMLSelectElement).value as ServiceCategoryFilter);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('Todos');
    this.categoryFilter.set('Todas');
  }

  protected openCreateDialog(): void {
    this.formMode.set('create');
    this.confirmationMessage.set('');
    this.resetForm();
    this.openDialog(this.serviceDialog()?.nativeElement);
  }

  protected openEditDialog(service: Service): void {
    this.formMode.set('edit');
    this.editingServiceId.set(service.id);
    this.confirmationMessage.set('');
    this.formSubmitted.set(false);
    this.serviceForm.setValue({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration.toString(),
      price: service.price.toString(),
      color: service.color,
      active: service.active,
    });
    this.actionsServiceId.set(null);
    this.openDialog(this.serviceDialog()?.nativeElement);
  }

  protected closeServiceDialog(): void {
    this.closeDialog(this.serviceDialog()?.nativeElement);
    this.resetForm();
  }

  protected handleServiceDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeServiceDialog();
  }

  protected saveService(): void {
    this.formSubmitted.set(true);
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const value = this.serviceForm.getRawValue();
    const serviceValue = {
      ...value,
      category: value.category as ServiceCategory,
      duration: Number(value.duration),
      price: Number(value.price),
    };
    const editingId = this.editingServiceId();
    if (this.formMode() === 'edit' && editingId !== null) {
      this.services.update((services) =>
        services.map((service) =>
          service.id === editingId ? { ...service, ...serviceValue } : service,
        ),
      );
      this.closeServiceDialog();
      this.confirmationMessage.set('Servicio actualizado correctamente.');
      return;
    }

    const nextId = Math.max(0, ...this.services().map((service) => service.id)) + 1;
    this.services.update((services) => [
      ...services,
      {
        id: nextId,
        ...serviceValue,
        assignedEmployees: 0,
        appointmentCount: 0,
      },
    ]);
    this.closeServiceDialog();
    this.confirmationMessage.set('Servicio creado correctamente.');
  }

  protected showError(controlName: ServiceFormControlName): boolean {
    const control = this.serviceForm.controls[controlName];
    return control.invalid && (control.touched || this.formSubmitted());
  }

  protected toggleActions(serviceId: number): void {
    this.actionsServiceId.update((current) => (current === serviceId ? null : serviceId));
  }

  protected requestStatusChange(service: Service): void {
    this.pendingStatusService.set(service);
    this.actionsServiceId.set(null);
    this.openDialog(this.statusDialog()?.nativeElement);
  }

  protected cancelStatusChange(): void {
    this.closeDialog(this.statusDialog()?.nativeElement);
    this.pendingStatusService.set(null);
  }

  protected handleStatusDialogCancel(event: Event): void {
    event.preventDefault();
    this.cancelStatusChange();
  }

  protected confirmStatusChange(): void {
    const pendingService = this.pendingStatusService();
    if (!pendingService) {
      return;
    }
    this.services.update((services) =>
      services.map((service) =>
        service.id === pendingService.id ? { ...service, active: !service.active } : service,
      ),
    );
    this.closeDialog(this.statusDialog()?.nativeElement);
    this.pendingStatusService.set(null);
    this.confirmationMessage.set(
      pendingService.active
        ? 'Servicio desactivado correctamente.'
        : 'Servicio activado correctamente.',
    );
  }

  protected closeFromBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target !== dialog) {
      return;
    }
    if (dialog === this.serviceDialog()?.nativeElement) {
      this.closeServiceDialog();
    } else {
      this.cancelStatusChange();
    }
  }

  protected formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hourLabel = hours === 1 ? '1 hora' : `${hours} horas`;
    return remainingMinutes ? `${hourLabel} ${remainingMinutes} min` : hourLabel;
  }

  protected formatPrice(price: number): string {
    return this.currencyFormatter.format(price);
  }

  protected indicatorClass(color: ServiceColor): string {
    const classes: Record<ServiceColor, string> = {
      Turquesa: 'bg-brand-teal',
      Azul: 'bg-blue-500',
      Violeta: 'bg-violet-500',
      Ámbar: 'bg-amber-500',
      Rosa: 'bg-pink-500',
    };
    return classes[color];
  }

  private resetForm(): void {
    this.serviceForm.reset({
      name: '',
      description: '',
      category: '',
      duration: '',
      price: '',
      color: 'Turquesa',
      active: true,
    });
    this.formSubmitted.set(false);
    this.editingServiceId.set(null);
  }

  private openDialog(dialog: HTMLDialogElement | undefined): void {
    if (!dialog) {
      return;
    }
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  private closeDialog(dialog: HTMLDialogElement | undefined): void {
    if (!dialog) {
      return;
    }
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }
}
