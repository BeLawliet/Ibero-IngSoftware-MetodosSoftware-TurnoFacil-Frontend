import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type LoginControlName = 'email' | 'password';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly demoSubmissionAccepted = signal(false);
  protected readonly announcement = signal('');
  protected readonly submitAttempted = signal(false);

  protected showError(controlName: LoginControlName): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || this.submitAttempted());
  }

  protected onSubmit(): void {
    this.submitAttempted.set(true);
    this.demoSubmissionAccepted.set(false);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.announcement.set('Revisa los campos indicados.');
      return;
    }

    this.demoSubmissionAccepted.set(true);
    this.announcement.set('Inicio de sesión de demostración validado localmente.');
  }

  protected announceUnavailable(action: string): void {
    this.announcement.set(`${action} estará disponible próximamente.`);
  }
}
