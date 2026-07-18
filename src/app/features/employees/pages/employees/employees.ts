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

type EmployeeStatusFilter = 'Todos' | 'Activos' | 'Inactivos';
type EmployeeAvailability = 'Disponible' | 'Ocupado' | 'Fuera de turno';
type AvailabilityFilter = 'Todos' | EmployeeAvailability;
type EmployeeFormMode = 'create' | 'edit';
type EmployeeFormControlName = 'firstName' | 'lastName' | 'email' | 'phone' | 'specialty';
type IdentifierColor = 'Turquesa' | 'Azul' | 'Violeta' | 'Ámbar' | 'Rosa';

interface Employee {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly specialty: string;
  readonly color: IdentifierColor;
  readonly active: boolean;
  readonly availability: EmployeeAvailability;
  readonly todaySchedule: string;
  readonly notes: string;
}

interface ColorOption {
  readonly name: IdentifierColor;
  readonly swatchClass: string;
}

const INITIAL_EMPLOYEES: readonly Employee[] = [
  {
    id: 1,
    firstName: 'Mariana',
    lastName: 'López',
    email: 'mariana.lopez@ejemplo.com',
    phone: '310 000 0001',
    specialty: 'Estilista',
    color: 'Turquesa',
    active: true,
    availability: 'Disponible',
    todaySchedule: '08:00 - 17:00',
    notes: 'Especialista en cortes y peinados.',
  },
  {
    id: 2,
    firstName: 'Andrés',
    lastName: 'Vega',
    email: 'andres.vega@ejemplo.com',
    phone: '310 000 0002',
    specialty: 'Barbero',
    color: 'Azul',
    active: true,
    availability: 'Ocupado',
    todaySchedule: '09:00 - 18:00',
    notes: '',
  },
  {
    id: 3,
    firstName: 'Daniela',
    lastName: 'Torres',
    email: 'daniela.torres@ejemplo.com',
    phone: '310 000 0003',
    specialty: 'Manicurista',
    color: 'Violeta',
    active: true,
    availability: 'Disponible',
    todaySchedule: '08:00 - 16:00',
    notes: '',
  },
  {
    id: 4,
    firstName: 'Camila',
    lastName: 'Romero',
    email: 'camila.romero@ejemplo.com',
    phone: '310 000 0004',
    specialty: 'Recepción',
    color: 'Ámbar',
    active: true,
    availability: 'Disponible',
    todaySchedule: '07:30 - 16:30',
    notes: '',
  },
  {
    id: 5,
    firstName: 'Sergio',
    lastName: 'Molina',
    email: 'sergio.molina@ejemplo.com',
    phone: '310 000 0005',
    specialty: 'Colorista',
    color: 'Rosa',
    active: true,
    availability: 'Disponible',
    todaySchedule: '10:00 - 19:00',
    notes: '',
  },
  {
    id: 6,
    firstName: 'Paula',
    lastName: 'Cárdenas',
    email: 'paula.cardenas@ejemplo.com',
    phone: '310 000 0006',
    specialty: 'Esteticista',
    color: 'Turquesa',
    active: true,
    availability: 'Ocupado',
    todaySchedule: '09:00 - 17:00',
    notes: '',
  },
  {
    id: 7,
    firstName: 'Felipe',
    lastName: 'Rojas',
    email: 'felipe.rojas@ejemplo.com',
    phone: '310 000 0007',
    specialty: 'Barbero',
    color: 'Azul',
    active: true,
    availability: 'Disponible',
    todaySchedule: '08:00 - 17:00',
    notes: '',
  },
  {
    id: 8,
    firstName: 'Natalia',
    lastName: 'Suárez',
    email: 'natalia.suarez@ejemplo.com',
    phone: '310 000 0008',
    specialty: 'Manicurista',
    color: 'Violeta',
    active: true,
    availability: 'Disponible',
    todaySchedule: '10:00 - 18:00',
    notes: '',
  },
  {
    id: 9,
    firstName: 'Laura',
    lastName: 'Pineda',
    email: 'laura.pineda@ejemplo.com',
    phone: '310 000 0009',
    specialty: 'Estilista',
    color: 'Ámbar',
    active: true,
    availability: 'Disponible',
    todaySchedule: '09:00 - 18:00',
    notes: '',
  },
  {
    id: 10,
    firstName: 'Miguel',
    lastName: 'Durán',
    email: 'miguel.duran@ejemplo.com',
    phone: '310 000 0010',
    specialty: 'Masajista',
    color: 'Rosa',
    active: true,
    availability: 'Disponible',
    todaySchedule: '11:00 - 19:00',
    notes: '',
  },
  {
    id: 11,
    firstName: 'Andrea',
    lastName: 'Lozano',
    email: 'andrea.lozano@ejemplo.com',
    phone: '310 000 0011',
    specialty: 'Recepción',
    color: 'Turquesa',
    active: false,
    availability: 'Fuera de turno',
    todaySchedule: 'Sin turno asignado',
    notes: '',
  },
  {
    id: 12,
    firstName: 'Julián',
    lastName: 'Mesa',
    email: 'julian.mesa@ejemplo.com',
    phone: '310 000 0012',
    specialty: 'Estilista',
    color: 'Azul',
    active: false,
    availability: 'Fuera de turno',
    todaySchedule: 'Sin turno asignado',
    notes: '',
  },
];

@Component({
  selector: 'app-employees-page',
  imports: [ReactiveFormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly employeeDialog = viewChild<ElementRef<HTMLDialogElement>>('employeeDialog');
  private readonly statusDialog = viewChild<ElementRef<HTMLDialogElement>>('statusDialog');

  readonly employees = signal<Employee[]>([...INITIAL_EMPLOYEES]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<EmployeeStatusFilter>('Todos');
  readonly availabilityFilter = signal<AvailabilityFilter>('Todos');
  readonly formMode = signal<EmployeeFormMode>('create');
  readonly editingEmployeeId = signal<number | null>(null);
  readonly pendingStatusEmployee = signal<Employee | null>(null);
  readonly formSubmitted = signal(false);
  readonly actionsEmployeeId = signal<number | null>(null);
  readonly confirmationMessage = signal('');

  readonly colorOptions: readonly ColorOption[] = [
    { name: 'Turquesa', swatchClass: 'bg-brand-teal' },
    { name: 'Azul', swatchClass: 'bg-blue-500' },
    { name: 'Violeta', swatchClass: 'bg-violet-500' },
    { name: 'Ámbar', swatchClass: 'bg-amber-500' },
    { name: 'Rosa', swatchClass: 'bg-pink-500' },
  ];

  readonly employeeForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    specialty: ['', Validators.required],
    color: ['Turquesa' as IdentifierColor],
    active: [true],
    notes: [''],
  });

  readonly summary = computed(() => {
    const employees = this.employees();
    return {
      total: employees.length,
      active: employees.filter((employee) => employee.active).length,
      availableToday: employees.filter(
        (employee) => employee.active && employee.availability === 'Disponible',
      ).length,
      offShift: employees.filter((employee) => employee.availability === 'Fuera de turno').length,
    };
  });

  readonly filteredEmployees = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    const status = this.statusFilter();
    const availability = this.availabilityFilter();

    return this.employees().filter((employee) => {
      const matchesSearch =
        !query ||
        `${employee.firstName} ${employee.lastName}`.toLocaleLowerCase('es').includes(query) ||
        employee.email.toLocaleLowerCase('es').includes(query) ||
        employee.phone.toLocaleLowerCase('es').includes(query) ||
        employee.specialty.toLocaleLowerCase('es').includes(query);
      const matchesStatus =
        status === 'Todos' ||
        (status === 'Activos' && employee.active) ||
        (status === 'Inactivos' && !employee.active);
      const matchesAvailability =
        availability === 'Todos' || employee.availability === availability;
      return matchesSearch && matchesStatus && matchesAvailability;
    });
  });

  readonly hasFilters = computed(
    () =>
      this.searchTerm().trim().length > 0 ||
      this.statusFilter() !== 'Todos' ||
      this.availabilityFilter() !== 'Todos',
  );

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as EmployeeStatusFilter);
  }

  protected updateAvailabilityFilter(event: Event): void {
    this.availabilityFilter.set((event.target as HTMLSelectElement).value as AvailabilityFilter);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('Todos');
    this.availabilityFilter.set('Todos');
  }

  protected openCreateDialog(): void {
    this.formMode.set('create');
    this.confirmationMessage.set('');
    this.resetForm();
    this.openDialog(this.employeeDialog()?.nativeElement);
  }

  protected openEditDialog(employee: Employee): void {
    this.formMode.set('edit');
    this.editingEmployeeId.set(employee.id);
    this.confirmationMessage.set('');
    this.formSubmitted.set(false);
    this.employeeForm.setValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      specialty: employee.specialty,
      color: employee.color,
      active: employee.active,
      notes: employee.notes,
    });
    this.actionsEmployeeId.set(null);
    this.openDialog(this.employeeDialog()?.nativeElement);
  }

  protected closeEmployeeDialog(): void {
    this.closeDialog(this.employeeDialog()?.nativeElement);
    this.resetForm();
  }

  protected handleEmployeeDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeEmployeeDialog();
  }

  protected saveEmployee(): void {
    this.formSubmitted.set(true);
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const value = this.employeeForm.getRawValue();
    const editingId = this.editingEmployeeId();
    if (this.formMode() === 'edit' && editingId !== null) {
      this.employees.update((employees) =>
        employees.map((employee) => {
          if (employee.id !== editingId) {
            return employee;
          }
          return {
            ...employee,
            ...value,
            availability: value.active ? employee.availability : 'Fuera de turno',
            todaySchedule: value.active ? employee.todaySchedule : 'Sin turno asignado',
          };
        }),
      );
      this.closeEmployeeDialog();
      this.confirmationMessage.set('Empleado actualizado correctamente.');
      return;
    }

    const nextId = Math.max(0, ...this.employees().map((employee) => employee.id)) + 1;
    this.employees.update((employees) => [
      ...employees,
      {
        id: nextId,
        ...value,
        availability: value.active ? 'Disponible' : 'Fuera de turno',
        todaySchedule: 'Sin turno asignado',
      },
    ]);
    this.closeEmployeeDialog();
    this.confirmationMessage.set('Empleado creado correctamente.');
  }

  protected showError(controlName: EmployeeFormControlName): boolean {
    const control = this.employeeForm.controls[controlName];
    return control.invalid && (control.touched || this.formSubmitted());
  }

  protected toggleActions(employeeId: number): void {
    this.actionsEmployeeId.update((current) => (current === employeeId ? null : employeeId));
  }

  protected requestStatusChange(employee: Employee): void {
    this.pendingStatusEmployee.set(employee);
    this.actionsEmployeeId.set(null);
    this.openDialog(this.statusDialog()?.nativeElement);
  }

  protected cancelStatusChange(): void {
    this.closeDialog(this.statusDialog()?.nativeElement);
    this.pendingStatusEmployee.set(null);
  }

  protected handleStatusDialogCancel(event: Event): void {
    event.preventDefault();
    this.cancelStatusChange();
  }

  protected confirmStatusChange(): void {
    const pendingEmployee = this.pendingStatusEmployee();
    if (!pendingEmployee) {
      return;
    }

    this.employees.update((employees) =>
      employees.map((employee) => {
        if (employee.id !== pendingEmployee.id) {
          return employee;
        }
        const active = !employee.active;
        return {
          ...employee,
          active,
          availability: 'Fuera de turno',
          todaySchedule: active ? employee.todaySchedule : 'Sin turno asignado',
        };
      }),
    );
    this.closeDialog(this.statusDialog()?.nativeElement);
    this.pendingStatusEmployee.set(null);
    this.confirmationMessage.set(
      pendingEmployee.active
        ? 'Empleado desactivado correctamente.'
        : 'Empleado activado correctamente.',
    );
  }

  protected closeFromBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target !== dialog) {
      return;
    }
    if (dialog === this.employeeDialog()?.nativeElement) {
      this.closeEmployeeDialog();
    } else {
      this.cancelStatusChange();
    }
  }

  protected initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  protected avatarClass(color: IdentifierColor): string {
    const classes: Record<IdentifierColor, string> = {
      Turquesa: 'bg-brand-teal-soft text-brand-teal',
      Azul: 'bg-blue-100 text-blue-700',
      Violeta: 'bg-violet-100 text-violet-700',
      Ámbar: 'bg-amber-100 text-amber-700',
      Rosa: 'bg-pink-100 text-pink-700',
    };
    return classes[color];
  }

  protected availabilityClass(availability: EmployeeAvailability): string {
    const classes: Record<EmployeeAvailability, string> = {
      Disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
      Ocupado: 'bg-amber-50 text-amber-700 ring-amber-600/15',
      'Fuera de turno': 'bg-slate-100 text-slate-600 ring-slate-500/15',
    };
    return classes[availability];
  }

  private resetForm(): void {
    this.employeeForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      color: 'Turquesa',
      active: true,
      notes: '',
    });
    this.formSubmitted.set(false);
    this.editingEmployeeId.set(null);
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
