import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Appointment,
  AppointmentDraft,
  AppointmentStatus,
  AppointmentsStore,
  calculateEndTime,
} from '../../data/appointments.store';
import {
  addLocalDays,
  isValidLocalIsoDate,
  isValidTime,
  parseLocalIsoDate,
  toLocalIsoDate,
} from '../../../../shared/utils/date.utils';

type AppointmentStatusFilter = 'Todos' | AppointmentStatus;
type AppointmentDateFilter = 'Todas' | 'Hoy' | 'Mañana' | 'Esta semana';
type AppointmentFormMode = 'create' | 'edit';
type AppointmentFormControlName =
  'clientId' | 'serviceId' | 'employeeId' | 'date' | 'startTime' | 'status';

interface CatalogItem {
  readonly id: string;
  readonly name: string;
}

interface ServiceCatalogItem extends CatalogItem {
  readonly durationMinutes: number;
}

const CLIENTS: readonly CatalogItem[] = [
  { id: 'c1', name: 'Lucía Mendoza' },
  { id: 'c2', name: 'Mateo Castro' },
  { id: 'c3', name: 'Valeria Ríos' },
  { id: 'c4', name: 'Tomás Herrera' },
  { id: 'c5', name: 'Isabella Navas' },
  { id: 'c6', name: 'Samuel Pardo' },
];

const EMPLOYEES: readonly CatalogItem[] = [
  { id: 'e1', name: 'Mariana López' },
  { id: 'e2', name: 'Andrés Vega' },
  { id: 'e3', name: 'Daniela Torres' },
  { id: 'e4', name: 'Paula Cárdenas' },
  { id: 'e5', name: 'Felipe Rojas' },
  { id: 'e6', name: 'Natalia Suárez' },
  { id: 'e7', name: 'Laura Pineda' },
];

const SERVICES: readonly ServiceCatalogItem[] = [
  { id: 's1', name: 'Corte clásico', durationMinutes: 30 },
  { id: 's2', name: 'Corte y barba', durationMinutes: 60 },
  { id: 's3', name: 'Manicure semipermanente', durationMinutes: 60 },
  { id: 's4', name: 'Limpieza facial', durationMinutes: 90 },
  { id: 's5', name: 'Consulta general', durationMinutes: 45 },
  { id: 's6', name: 'Asesoría de imagen', durationMinutes: 60 },
];

@Component({
  selector: 'app-appointments-page',
  imports: [ReactiveFormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsPage implements AfterViewInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly appointmentsStore = inject(AppointmentsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentDialog =
    viewChild<ElementRef<HTMLDialogElement>>('appointmentDialog');
  private readonly cancelDialog = viewChild<ElementRef<HTMLDialogElement>>('cancelDialog');

  readonly clients = CLIENTS;
  readonly employees = EMPLOYEES;
  readonly services = SERVICES;
  readonly editableStatuses: readonly AppointmentStatus[] = [
    'Programada',
    'En atención',
    'Atendida',
  ];
  readonly todayIso = toLocalIsoDate(new Date());
  readonly tomorrowIso = toLocalIsoDate(addLocalDays(new Date(), 1));
  readonly weekEndIso = toLocalIsoDate(addLocalDays(new Date(), 6));
  readonly appointments = this.appointmentsStore.appointments;

  readonly searchTerm = signal('');
  readonly statusFilter = signal<AppointmentStatusFilter>('Todos');
  readonly employeeFilter = signal('Todos');
  readonly dateFilter = signal<AppointmentDateFilter>('Todas');
  readonly formMode = signal<AppointmentFormMode>('create');
  readonly editingAppointmentId = signal<number | null>(null);
  readonly pendingCancellation = signal<Appointment | null>(null);
  readonly actionsAppointmentId = signal<number | null>(null);
  readonly formSubmitted = signal(false);
  readonly confirmationMessage = signal('');
  readonly conflictMessage = signal('');
  readonly pastDateError = signal(false);
  readonly previewDuration = signal(0);
  readonly previewStartTime = signal('');

  readonly appointmentForm = this.formBuilder.group({
    clientId: ['', Validators.required],
    serviceId: ['', Validators.required],
    employeeId: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    status: ['Programada' as AppointmentStatus, Validators.required],
    notes: [''],
  });

  readonly estimatedEndTime = computed(() => {
    const startTime = this.previewStartTime();
    const duration = this.previewDuration();
    return startTime && duration ? calculateEndTime(startTime, duration) : '';
  });

  readonly summary = computed(() => {
    const appointments = this.appointments();
    return {
      today: appointments.filter((appointment) => appointment.date === this.todayIso).length,
      scheduled: appointments.filter((appointment) => appointment.status === 'Programada').length,
      inProgress: appointments.filter((appointment) => appointment.status === 'En atención').length,
      cancelled: appointments.filter((appointment) => appointment.status === 'Cancelada').length,
    };
  });

  readonly filteredAppointments = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    const status = this.statusFilter();
    const employee = this.employeeFilter();
    const date = this.dateFilter();

    return this.appointments()
      .filter((appointment) => {
        const matchesSearch =
          !query ||
          appointment.clientName.toLocaleLowerCase('es').includes(query) ||
          appointment.serviceName.toLocaleLowerCase('es').includes(query) ||
          appointment.employeeName.toLocaleLowerCase('es').includes(query);
        const matchesStatus = status === 'Todos' || appointment.status === status;
        const matchesEmployee = employee === 'Todos' || appointment.employeeId === employee;
        const matchesDate =
          date === 'Todas' ||
          (date === 'Hoy' && appointment.date === this.todayIso) ||
          (date === 'Mañana' && appointment.date === this.tomorrowIso) ||
          (date === 'Esta semana' &&
            appointment.date >= this.todayIso &&
            appointment.date <= this.weekEndIso);
        return matchesSearch && matchesStatus && matchesEmployee && matchesDate;
      })
      .sort((first, second) =>
        `${first.date}T${first.startTime}`.localeCompare(`${second.date}T${second.startTime}`),
      );
  });

  readonly hasFilters = computed(
    () =>
      this.searchTerm().trim().length > 0 ||
      this.statusFilter() !== 'Todos' ||
      this.employeeFilter() !== 'Todos' ||
      this.dateFilter() !== 'Todas',
  );

  ngAfterViewInit(): void {
    if (this.route.snapshot.queryParamMap.get('nueva') !== 'true') {
      return;
    }
    const date = this.route.snapshot.queryParamMap.get('fecha');
    const startTime = this.route.snapshot.queryParamMap.get('hora');
    queueMicrotask(() => {
      this.openCreateDialog();
      if (isValidLocalIsoDate(date) && date >= this.todayIso) {
        this.appointmentForm.controls.date.setValue(date);
      }
      if (isValidTime(startTime)) {
        this.appointmentForm.controls.startTime.setValue(startTime);
        this.previewStartTime.set(startTime);
      }
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { nueva: null, fecha: null, hora: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as AppointmentStatusFilter);
  }

  protected updateEmployeeFilter(event: Event): void {
    this.employeeFilter.set((event.target as HTMLSelectElement).value);
  }

  protected updateDateFilter(event: Event): void {
    this.dateFilter.set((event.target as HTMLSelectElement).value as AppointmentDateFilter);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('Todos');
    this.employeeFilter.set('Todos');
    this.dateFilter.set('Todas');
  }

  protected updateServicePreview(event: Event): void {
    const serviceId = (event.target as HTMLSelectElement).value;
    this.previewDuration.set(
      this.services.find((service) => service.id === serviceId)?.durationMinutes ?? 0,
    );
    this.conflictMessage.set('');
  }

  protected updateTimePreview(event: Event): void {
    this.previewStartTime.set((event.target as HTMLInputElement).value);
    this.conflictMessage.set('');
  }

  protected openCreateDialog(): void {
    this.formMode.set('create');
    this.confirmationMessage.set('');
    this.resetForm();
    this.openDialog(this.appointmentDialog()?.nativeElement);
  }

  protected openEditDialog(appointment: Appointment): void {
    if (appointment.status === 'Cancelada') {
      return;
    }
    this.formMode.set('edit');
    this.editingAppointmentId.set(appointment.id);
    this.formSubmitted.set(false);
    this.confirmationMessage.set('');
    this.conflictMessage.set('');
    this.pastDateError.set(false);
    this.appointmentForm.setValue({
      clientId: appointment.clientId,
      serviceId: appointment.serviceId,
      employeeId: appointment.employeeId,
      date: appointment.date,
      startTime: appointment.startTime,
      status: appointment.status,
      notes: appointment.notes,
    });
    this.previewDuration.set(appointment.durationMinutes);
    this.previewStartTime.set(appointment.startTime);
    this.actionsAppointmentId.set(null);
    this.openDialog(this.appointmentDialog()?.nativeElement);
  }

  protected closeAppointmentDialog(): void {
    this.closeDialog(this.appointmentDialog()?.nativeElement);
    this.resetForm();
  }

  protected handleAppointmentDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeAppointmentDialog();
  }

  protected saveAppointment(): void {
    this.formSubmitted.set(true);
    this.conflictMessage.set('');
    this.pastDateError.set(false);
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const value = this.appointmentForm.getRawValue();
    if (this.formMode() === 'create' && value.date < this.todayIso) {
      this.pastDateError.set(true);
      return;
    }

    const client = this.clients.find((item) => item.id === value.clientId);
    const service = this.services.find((item) => item.id === value.serviceId);
    const employee = this.employees.find((item) => item.id === value.employeeId);
    if (!client || !service || !employee) {
      return;
    }

    const draft: AppointmentDraft = {
      clientId: client.id,
      clientName: client.name,
      serviceId: service.id,
      serviceName: service.name,
      employeeId: employee.id,
      employeeName: employee.name,
      date: value.date,
      startTime: value.startTime,
      durationMinutes: service.durationMinutes,
      status: value.status,
      notes: value.notes,
    };
    const editingId = this.editingAppointmentId();
    if (this.appointmentsStore.hasConflict(draft, editingId ?? undefined)) {
      this.conflictMessage.set(
        'El empleado seleccionado ya tiene una cita que se cruza con este horario.',
      );
      return;
    }

    if (this.formMode() === 'edit' && editingId !== null) {
      this.appointmentsStore.updateAppointment(editingId, draft);
      this.closeAppointmentDialog();
      this.confirmationMessage.set('Cita actualizada correctamente.');
      return;
    }

    this.appointmentsStore.createAppointment(draft);
    this.closeAppointmentDialog();
    this.confirmationMessage.set('Cita creada correctamente.');
  }

  protected showError(controlName: AppointmentFormControlName): boolean {
    const control = this.appointmentForm.controls[controlName];
    return control.invalid && (control.touched || this.formSubmitted());
  }

  protected toggleActions(appointmentId: number): void {
    this.actionsAppointmentId.update((current) =>
      current === appointmentId ? null : appointmentId,
    );
  }

  protected changeStatus(appointment: Appointment, status: AppointmentStatus): void {
    if (appointment.status === 'Cancelada') {
      return;
    }
    this.appointmentsStore.changeStatus(appointment.id, status);
    this.actionsAppointmentId.set(null);
    this.confirmationMessage.set(`Cita marcada como “${status}”.`);
  }

  protected requestCancellation(appointment: Appointment): void {
    if (appointment.status === 'Cancelada') {
      return;
    }
    this.pendingCancellation.set(appointment);
    this.actionsAppointmentId.set(null);
    this.openDialog(this.cancelDialog()?.nativeElement);
  }

  protected cancelCancellation(): void {
    this.closeDialog(this.cancelDialog()?.nativeElement);
    this.pendingCancellation.set(null);
  }

  protected handleCancelDialogCancel(event: Event): void {
    event.preventDefault();
    this.cancelCancellation();
  }

  protected confirmCancellation(): void {
    const appointment = this.pendingCancellation();
    if (!appointment) {
      return;
    }
    this.appointmentsStore.cancelAppointment(appointment.id);
    this.closeDialog(this.cancelDialog()?.nativeElement);
    this.pendingCancellation.set(null);
    this.confirmationMessage.set('Cita cancelada correctamente.');
  }

  protected closeFromBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target !== dialog) {
      return;
    }
    if (dialog === this.appointmentDialog()?.nativeElement) {
      this.closeAppointmentDialog();
    } else {
      this.cancelCancellation();
    }
  }

  protected formatDate(date: string): string {
    const prefix = date === this.todayIso ? 'Hoy' : date === this.tomorrowIso ? 'Mañana' : '';
    const formatted = new Intl.DateTimeFormat('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(parseLocalIsoDate(date));
    return prefix ? `${prefix}, ${formatted}` : formatted;
  }

  protected formatDuration(durationMinutes: number): string {
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    }
    const hours = Math.floor(durationMinutes / 60);
    const remaining = durationMinutes % 60;
    return remaining ? `${hours} h ${remaining} min` : `${hours} h`;
  }

  protected statusClass(status: AppointmentStatus): string {
    const classes: Record<AppointmentStatus, string> = {
      Programada: 'bg-blue-50 text-blue-700 ring-blue-600/15',
      'En atención': 'bg-amber-50 text-amber-700 ring-amber-600/20',
      Atendida: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
      Cancelada: 'bg-rose-50 text-rose-700 ring-rose-600/15',
    };
    return classes[status];
  }

  protected canCancel(appointment: Appointment): boolean {
    return appointment.status === 'Programada' || appointment.status === 'En atención';
  }

  private resetForm(): void {
    this.appointmentForm.reset({
      clientId: '',
      serviceId: '',
      employeeId: '',
      date: '',
      startTime: '',
      status: 'Programada',
      notes: '',
    });
    this.formSubmitted.set(false);
    this.editingAppointmentId.set(null);
    this.conflictMessage.set('');
    this.pastDateError.set(false);
    this.previewDuration.set(0);
    this.previewStartTime.set('');
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
