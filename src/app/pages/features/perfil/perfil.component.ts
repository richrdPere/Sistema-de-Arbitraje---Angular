import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import type { AuthUsuario } from 'src/app/core/models/auth-session.model';
import { AuthService } from 'src/app/pages/auth/services/auth.service';

import type { UpdateMiPerfilRequest } from './interfaces';
import { PerfilService } from './services/perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly perfilService = inject(PerfilService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  readonly avatarPredeterminado = 'assets/img/default-avatar.png';

  readonly perfilForm = this.fb.group({
    nombres: '',
    apellidos: '',
    telefono: '',
  });

  readonly passwordForm = this.fb.group({
    passwordActual: ['', Validators.required],
    nuevaPassword: ['', Validators.required],
    repetirPassword: ['', Validators.required],
  });

  perfil: AuthUsuario | null = null;
  fotoPreview: string | null = null;

  loading = false;
  guardandoPerfil = false;
  subiendoFoto = false;
  cambiandoPassword = false;
  errorCarga = '';

  ngOnInit(): void {
    this.cargarPerfil();
  }

  get ocupado(): boolean {
    return this.loading ||
      this.guardandoPerfil ||
      this.subiendoFoto ||
      this.cambiandoPassword;
  }

  cargarPerfil(): void {
    if (this.ocupado) return;

    this.loading = true;
    this.errorCarga = '';

    this.perfilService.obtenerPerfil()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => { this.loading = false; }),
      )
      .subscribe({
        next: ({ data }) => {
          this.aplicarPerfil(data);
          this.fotoPreview = data.foto_perfil
            ? this.resolverUrlFoto(
              `/uploads/usuarios/${encodeURIComponent(data.foto_perfil)}`,
            )
            : null;
        },
        error: (error: unknown) => {
          this.errorCarga = this.mensajeError(
            error,
            'No se pudo cargar el perfil.',
          );
        },
      });
  }

  actualizarPerfil(): void {
    const perfil = this.perfil;
    if (!perfil || this.ocupado) return;

    const form = this.perfilForm.getRawValue();
    const telefono = form.telefono.trim() || null;
    const request: UpdateMiPerfilRequest = {};

    if (telefono !== perfil.persona.telefono) {
      request.telefono = telefono;
    }

    if (perfil.persona.tipo === 'NATURAL') {
      const nombres = form.nombres.trim();
      const apellidos = form.apellidos.trim();

      if (!nombres || !apellidos) {
        void Swal.fire('Atención', 'Completa los nombres y apellidos.', 'warning');
        return;
      }

      if (nombres !== perfil.persona.nombres) request.nombres = nombres;
      if (apellidos !== perfil.persona.apellidos) request.apellidos = apellidos;
    }

    if (Object.keys(request).length === 0) {
      this.perfilForm.markAsPristine();
      return;
    }

    this.guardandoPerfil = true;

    this.perfilService.actualizarPerfil(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => { this.guardandoPerfil = false; }),
      )
      .subscribe({
        next: ({ data, message }) => {
          this.aplicarPerfil(data);
          void Swal.fire('Éxito', message, 'success');
        },
        error: (error: unknown) => {
          this.mostrarError(error, 'No se pudo actualizar el perfil.');
        },
      });
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const foto = input.files?.[0];

    // Permite volver a seleccionar el mismo archivo después de un error.
    input.value = '';

    if (!foto || !this.perfil || this.ocupado) return;

    if (!['image/jpeg', 'image/png'].includes(foto.type)) {
      void Swal.fire('Atención', 'Selecciona una imagen JPEG o PNG.', 'warning');
      return;
    }

    if (foto.size > 2 * 1024 * 1024) {
      void Swal.fire('Atención', 'La imagen no puede superar los 2 MiB.', 'warning');
      return;
    }

    this.subiendoFoto = true;

    this.perfilService.subirFotoPerfil(foto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => { this.subiendoFoto = false; }),
      )
      .subscribe({
        next: ({ data, message }) => {
          if (this.perfil) {
            this.perfil = { ...this.perfil, foto_perfil: data.foto_perfil };
          }

          this.fotoPreview = this.resolverUrlFoto(data.foto_url);
          void Swal.fire('Éxito', message, 'success');
        },
        error: (error: unknown) => {
          this.mostrarError(error, 'No se pudo subir la foto.');
        },
      });
  }

  cambiarPassword(): void {
    if (!this.perfil || this.ocupado) return;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      void Swal.fire('Atención', 'Completa los campos de contraseña.', 'warning');
      return;
    }

    const { passwordActual, nuevaPassword, repetirPassword } =
      this.passwordForm.getRawValue();

    if (nuevaPassword !== repetirPassword) {
      void Swal.fire('Atención', 'Las nuevas contraseñas no coinciden.', 'warning');
      return;
    }

    this.cambiandoPassword = true;

    this.authService.changePassword({
      password_actual: passwordActual,
      password_nuevo: nuevaPassword,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.cambiandoPassword = false; }),
    ).subscribe({
      next: ({ data, message }) => {
        this.passwordForm.reset();

        if (data.requiere_nuevo_login) {
          // AuthService ya limpió la sesión anterior.
          void this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          void Swal.fire('Contraseña actualizada', 'Inicia sesión con tu nueva contraseña.', 'success');
          return;
        }

        if (this.perfil) {
          this.perfil = {
            ...this.perfil,
            password_reset_required: data.password_reset_required,
          };
        }

        // /auth/me actualiza el usuario que mantiene AuthService en memoria.
        this.authService.getPerfil()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: () => {
              void Swal.fire(
                'Contraseña actualizada',
                'El cambio se guardó. Si la sesión aún solicita el cambio, vuelve a iniciar sesión.',
                'info',
              );
            },
          });

        void Swal.fire('Éxito', message, 'success');
      },
      error: (error: unknown) => {
        this.mostrarError(error, 'No se pudo actualizar la contraseña.');
      },
    });
  }

  private aplicarPerfil(perfil: AuthUsuario): void {
    this.perfil = perfil;
    this.perfilForm.reset({
      nombres: perfil.persona.nombres ?? '',
      apellidos: perfil.persona.apellidos ?? '',
      telefono: perfil.persona.telefono ?? '',
    });
  }

  private resolverUrlFoto(ruta: string): string {
    const apiUrl = new URL(environment.main_url, this.document.baseURI);
    return new URL(ruta, apiUrl).href;
  }

  private mostrarError(error: unknown, respaldo: string): void {
    void Swal.fire('Error', this.mensajeError(error, respaldo), 'error');
  }

  private mensajeError(error: unknown, respaldo: string): string {
    const mensaje = (error as { message?: unknown } | null)?.message;
    return typeof mensaje === 'string' && mensaje.trim() ? mensaje : respaldo;
  }
}
