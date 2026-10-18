import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import iziToast from 'izitoast';

// Services
import { AuthService } from '../services/auth.service';

// Interfaces
import { LoginRequest } from '../interfaces';
import { AuthRol } from 'src/app/core/models/auth-session.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.component.html',
  styles: ``,
})
export class LoginPageComponent implements OnInit {
  // =========================================================
  // FORMULARIO
  // =========================================================
  readonly formLogin;

  // =========================================================
  // ESTADO
  // =========================================================
  loading = false;
  showPassword = false;
  errorMessage = '';

  // Coinciden con los roles autorizados en app.routes.
  private readonly rolesPermitidos: readonly AuthRol[] = [
    'ADMIN',
    'SECRETARIA',
    'ARBITRO',
    'PARTICIPE',
    'ADJUDICADOR',
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.formLogin = this.fb.nonNullable.group({
      correo: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
        ],
      ],
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectByRole(
        this.authService.getCurrentRole(),
      );
    }
  }

  // =========================================================
  // MOSTRAR / OCULTAR CONTRASEÑA
  // =========================================================
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // =========================================================
  // LOGIN
  // =========================================================
  login(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';

    // Normalizar el correo antes de validarlo.
    const correoControl = this.formLogin.controls.correo;

    correoControl.setValue(
      correoControl.value.trim(),
    );

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const { correo, password } =
      this.formLogin.getRawValue();

    const request: LoginRequest = {
      correo,
      // Conservar exactamente la contraseña ingresada.
      password,
      dispositivo:
        this.authService.getOrCreateDeviceId(),
    };

    this.loading = true;

    this.authService.login(request)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          // AuthService ya validó la respuesta,
          // guardó la sesión y actualizó currentUser$.
          iziToast.success({
            title: 'Éxito',
            message:
              response.message ||
              'Inicio de sesión exitoso.',
            position: 'bottomRight',
          });

          this.redirectByRole(
            response.data.usuario.rol,
          );
        },

        error: (error: unknown) => {
          this.errorMessage =
            this.getErrorMessage(error);

          iziToast.error({
            title: 'Error',
            message: this.errorMessage,
            position: 'bottomRight',
          });
        },
      });
  }

  // =========================================================
  // VALIDACIÓN DE CAMPOS
  // =========================================================
  campoInvalido(
    campo: 'correo' | 'password',
  ): boolean {
    const control = this.formLogin.controls[campo];

    return (
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  obtenerError(
    campo: 'correo' | 'password',
  ): string {
    const control = this.formLogin.controls[campo];

    if (control.hasError('required')) {
      return campo === 'correo'
        ? 'El correo electrónico es obligatorio.'
        : 'La contraseña es obligatoria.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }

    return '';
  }

  // =========================================================
  // REDIRECCIÓN SEGÚN ROL
  // =========================================================
  private redirectByRole(
    rol: AuthRol | null,
  ): void {
    if (
      rol !== null &&
      this.rolesPermitidos.includes(rol)
    ) {
      void this.router.navigateByUrl('/admin');
      return;
    }

    void this.router.navigateByUrl(
      '/acceso-denegado',
    );
  }

  // =========================================================
  // MENSAJES DE ERROR
  // Compatible con errores normalizados por el helper
  // y con respuestas HttpErrorResponse.
  // =========================================================
  private getErrorMessage(
    error: unknown,
  ): string {
    const fallback = 'No se pudo iniciar sesión.';

    if (
      typeof error !== 'object' ||
      error === null
    ) {
      return fallback;
    }

    const normalized = error as Record<string, unknown>;

    const backendError = normalized['error'];

    if (typeof backendError === 'object' && backendError !== null) {
      const body = backendError as Record<string, unknown>;

      const message = body['message'];

      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      const detail = body['error'];

      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }

    const message = normalized['message'];

    return (
      typeof message === 'string' &&
      message.trim()
    )
      ? message
      : fallback;
  }
}
