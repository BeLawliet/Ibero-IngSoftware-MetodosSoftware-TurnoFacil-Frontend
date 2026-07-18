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

type ClientStatusFilter = 'Todos' | 'Activos' | 'Inactivos';
type ClientFormControlName = 'firstName' | 'lastName' | 'email' | 'phone';
type ClientFormMode = 'create' | 'edit';

interface Client {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly lastAppointment: string;
  readonly active: boolean;
  readonly notes: string;
  readonly newThisMonth: boolean;
}

const INITIAL_CLIENTS: readonly Client[] = [
  {
    id: 1,
    firstName: 'Lucía',
    lastName: 'Mendoza',
    email: 'lucia.mendoza@ejemplo.com',
    phone: '300 000 0001',
    lastAppointment: '18 jul 2026',
    active: true,
    notes: 'Prefiere citas en la mañana.',
    newThisMonth: true,
  },
  {
    id: 2,
    firstName: 'Mateo',
    lastName: 'Castro',
    email: 'mateo.castro@ejemplo.com',
    phone: '300 000 0002',
    lastAppointment: '17 jul 2026',
    active: true,
    notes: '',
    newThisMonth: true,
  },
  {
    id: 3,
    firstName: 'Valeria',
    lastName: 'Ríos',
    email: 'valeria.rios@ejemplo.com',
    phone: '300 000 0003',
    lastAppointment: '16 jul 2026',
    active: true,
    notes: '',
    newThisMonth: true,
  },
  {
    id: 4,
    firstName: 'Tomás',
    lastName: 'Herrera',
    email: 'tomas.herrera@ejemplo.com',
    phone: '300 000 0004',
    lastAppointment: '15 jul 2026',
    active: true,
    notes: '',
    newThisMonth: true,
  },
  {
    id: 5,
    firstName: 'Isabella',
    lastName: 'Navas',
    email: 'isabella.navas@ejemplo.com',
    phone: '300 000 0005',
    lastAppointment: '14 jul 2026',
    active: true,
    notes: '',
    newThisMonth: true,
  },
  {
    id: 6,
    firstName: 'Samuel',
    lastName: 'Pardo',
    email: 'samuel.pardo@ejemplo.com',
    phone: '300 000 0006',
    lastAppointment: '12 jul 2026',
    active: true,
    notes: '',
    newThisMonth: true,
  },
  {
    id: 7,
    firstName: 'Mariana',
    lastName: 'Cortés',
    email: 'mariana.cortes@ejemplo.com',
    phone: '300 000 0007',
    lastAppointment: '28 jun 2026',
    active: false,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 8,
    firstName: 'Emiliano',
    lastName: 'Duarte',
    email: 'emiliano.duarte@ejemplo.com',
    phone: '300 000 0008',
    lastAppointment: '10 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 9,
    firstName: 'Sara',
    lastName: 'Peña',
    email: 'sara.pena@ejemplo.com',
    phone: '300 000 0009',
    lastAppointment: '9 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 10,
    firstName: 'Nicolás',
    lastName: 'Suárez',
    email: 'nicolas.suarez@ejemplo.com',
    phone: '300 000 0010',
    lastAppointment: '8 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 11,
    firstName: 'Martina',
    lastName: 'Salazar',
    email: 'martina.salazar@ejemplo.com',
    phone: '300 000 0011',
    lastAppointment: '7 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 12,
    firstName: 'Gabriel',
    lastName: 'Mejía',
    email: 'gabriel.mejia@ejemplo.com',
    phone: '300 000 0012',
    lastAppointment: '5 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 13,
    firstName: 'Antonia',
    lastName: 'Becerra',
    email: 'antonia.becerra@ejemplo.com',
    phone: '300 000 0013',
    lastAppointment: '3 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 14,
    firstName: 'Joaquín',
    lastName: 'León',
    email: 'joaquin.leon@ejemplo.com',
    phone: '300 000 0014',
    lastAppointment: '1 jul 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 15,
    firstName: 'Elena',
    lastName: 'Mora',
    email: 'elena.mora@ejemplo.com',
    phone: '300 000 0015',
    lastAppointment: '30 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 16,
    firstName: 'Thiago',
    lastName: 'Acosta',
    email: 'thiago.acosta@ejemplo.com',
    phone: '300 000 0016',
    lastAppointment: '22 jun 2026',
    active: false,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 17,
    firstName: 'Renata',
    lastName: 'Vargas',
    email: 'renata.vargas@ejemplo.com',
    phone: '300 000 0017',
    lastAppointment: '29 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 18,
    firstName: 'Benjamín',
    lastName: 'Cabrera',
    email: 'benjamin.cabrera@ejemplo.com',
    phone: '300 000 0018',
    lastAppointment: '27 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 19,
    firstName: 'Julieta',
    lastName: 'Campos',
    email: 'julieta.campos@ejemplo.com',
    phone: '300 000 0019',
    lastAppointment: '25 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 20,
    firstName: 'Agustín',
    lastName: 'Fuentes',
    email: 'agustin.fuentes@ejemplo.com',
    phone: '300 000 0020',
    lastAppointment: '21 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 21,
    firstName: 'Josefina',
    lastName: 'Ospina',
    email: 'josefina.ospina@ejemplo.com',
    phone: '300 000 0021',
    lastAppointment: '18 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 22,
    firstName: 'Lucas',
    lastName: 'Vélez',
    email: 'lucas.velez@ejemplo.com',
    phone: '300 000 0022',
    lastAppointment: '15 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 23,
    firstName: 'Emma',
    lastName: 'Quintero',
    email: 'emma.quintero@ejemplo.com',
    phone: '300 000 0023',
    lastAppointment: 'Sin citas',
    active: false,
    notes: '',
    newThisMonth: false,
  },
  {
    id: 24,
    firstName: 'Daniel',
    lastName: 'Gallego',
    email: 'daniel.gallego@ejemplo.com',
    phone: '300 000 0024',
    lastAppointment: '12 jun 2026',
    active: true,
    notes: '',
    newThisMonth: false,
  },
];

@Component({
  selector: 'app-clients-page',
  imports: [ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly clientDialog = viewChild<ElementRef<HTMLDialogElement>>('clientDialog');
  private readonly statusDialog = viewChild<ElementRef<HTMLDialogElement>>('statusDialog');

  readonly clients = signal<Client[]>([...INITIAL_CLIENTS]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<ClientStatusFilter>('Todos');
  readonly formMode = signal<ClientFormMode>('create');
  readonly editingClientId = signal<number | null>(null);
  readonly pendingStatusClient = signal<Client | null>(null);
  readonly formSubmitted = signal(false);
  readonly actionsClientId = signal<number | null>(null);
  readonly confirmationMessage = signal('');

  readonly clientForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    active: [true],
    notes: [''],
  });

  readonly summary = computed(() => {
    const clients = this.clients();
    return {
      total: clients.length,
      active: clients.filter((client) => client.active).length,
      newThisMonth: clients.filter((client) => client.newThisMonth).length,
    };
  });

  readonly filteredClients = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('es');
    const filter = this.statusFilter();

    return this.clients().filter((client) => {
      const matchesSearch =
        !query ||
        `${client.firstName} ${client.lastName}`.toLocaleLowerCase('es').includes(query) ||
        client.email.toLocaleLowerCase('es').includes(query) ||
        client.phone.toLocaleLowerCase('es').includes(query);
      const matchesStatus =
        filter === 'Todos' ||
        (filter === 'Activos' && client.active) ||
        (filter === 'Inactivos' && !client.active);
      return matchesSearch && matchesStatus;
    });
  });

  readonly hasFilters = computed(
    () => this.searchTerm().trim().length > 0 || this.statusFilter() !== 'Todos',
  );

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as ClientStatusFilter);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('Todos');
  }

  protected openCreateDialog(): void {
    this.formMode.set('create');
    this.editingClientId.set(null);
    this.confirmationMessage.set('');
    this.resetForm();
    this.openDialog(this.clientDialog()?.nativeElement);
  }

  protected openEditDialog(client: Client): void {
    this.formMode.set('edit');
    this.editingClientId.set(client.id);
    this.confirmationMessage.set('');
    this.formSubmitted.set(false);
    this.clientForm.setValue({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      active: client.active,
      notes: client.notes,
    });
    this.actionsClientId.set(null);
    this.openDialog(this.clientDialog()?.nativeElement);
  }

  protected closeClientDialog(): void {
    this.closeDialog(this.clientDialog()?.nativeElement);
    this.resetForm();
  }

  protected handleClientDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeClientDialog();
  }

  protected saveClient(): void {
    this.formSubmitted.set(true);
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const value = this.clientForm.getRawValue();
    const editingId = this.editingClientId();
    if (this.formMode() === 'edit' && editingId !== null) {
      this.clients.update((clients) =>
        clients.map((client) => (client.id === editingId ? { ...client, ...value } : client)),
      );
      this.closeClientDialog();
      this.confirmationMessage.set('Cliente actualizado correctamente.');
      return;
    }

    const nextId = Math.max(0, ...this.clients().map((client) => client.id)) + 1;
    this.clients.update((clients) => [
      ...clients,
      {
        id: nextId,
        ...value,
        lastAppointment: 'Sin citas',
        newThisMonth: true,
      },
    ]);
    this.closeClientDialog();
    this.confirmationMessage.set('Cliente creado correctamente.');
  }

  protected showError(controlName: ClientFormControlName): boolean {
    const control = this.clientForm.controls[controlName];
    return control.invalid && (control.touched || this.formSubmitted());
  }

  protected toggleActions(clientId: number): void {
    this.actionsClientId.update((current) => (current === clientId ? null : clientId));
  }

  protected requestStatusChange(client: Client): void {
    this.pendingStatusClient.set(client);
    this.actionsClientId.set(null);
    this.openDialog(this.statusDialog()?.nativeElement);
  }

  protected cancelStatusChange(): void {
    this.closeDialog(this.statusDialog()?.nativeElement);
    this.pendingStatusClient.set(null);
  }

  protected handleStatusDialogCancel(event: Event): void {
    event.preventDefault();
    this.cancelStatusChange();
  }

  protected confirmStatusChange(): void {
    const pendingClient = this.pendingStatusClient();
    if (!pendingClient) {
      return;
    }

    this.clients.update((clients) =>
      clients.map((client) =>
        client.id === pendingClient.id ? { ...client, active: !client.active } : client,
      ),
    );
    this.closeDialog(this.statusDialog()?.nativeElement);
    this.pendingStatusClient.set(null);
    this.confirmationMessage.set(
      pendingClient.active
        ? 'Cliente desactivado correctamente.'
        : 'Cliente activado correctamente.',
    );
  }

  protected closeFromBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target !== dialog) {
      return;
    }

    if (dialog === this.clientDialog()?.nativeElement) {
      this.closeClientDialog();
    } else {
      this.cancelStatusChange();
    }
  }

  protected initials(client: Client): string {
    return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
  }

  private resetForm(): void {
    this.clientForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      active: true,
      notes: '',
    });
    this.formSubmitted.set(false);
    this.editingClientId.set(null);
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
