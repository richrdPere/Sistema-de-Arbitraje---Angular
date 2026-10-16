import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Izitoast
import iziToast from 'izitoast';

// Service
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-trazabilidad',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './trazabilidad.component.html',
})
export class TrazabilidadComponent implements OnInit {

  formTrazabilidad: FormGroup;
  resultado: any = null;


  public user: any = {};
  public token: any = '';

  loading = false;
  showPassword: boolean = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private _router: Router) {
    this.formTrazabilidad = this.fb.group({
      tipo: ['administracion'],   // ejemplo: radio/selector
      correo: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]     //  ahora sí existe
    });
  }

  ngOnInit(): void {

    const token = this.authService.getToken();

    if (token) {
      this._router.navigate(['/app']);
    }
    else {
      // Mantener en el componente login
    }
  }

  cargarCredencialesUsuario() {
    this.tipoUsuario = 'usuarios';
    this.formTrazabilidad.patchValue({
      correo: 'usuario@demo.com',
      password: 'user123'
    });

    // Efecto visual de confirmación
    this.mostrarConfirmacion('Credenciales de usuario cargadas');
  }

  mostrarConfirmacion(mensaje: string, event?: Event) {
    // Podrías implementar un toast o notificación aquí

    // Efecto visual simple
    const button = event?.target as HTMLElement;
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '✓ Cargadas';
      button.classList.add('btn-success');
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('btn-success');
        if (button.classList.contains('btn-info')) {
          button.classList.add('btn-info');
        } else if (button.classList.contains('btn-success')) {
          button.classList.add('btn-success');
        }
      }, 2000);
    }
  }


  cargarCredencialesAdmin() {
    this.tipoUsuario = 'administracion';
    this.formTrazabilidad.patchValue({
      correo: 'fernando@gmail.com',
      password: 'nueva123'
    });

    // Efecto visual de confirmación
    this.mostrarConfirmacion('Credenciales de administración cargadas');
  }


  login() {
    if (this.formTrazabilidad.invalid) return;
    this.loading = true;

    const { correo, password } = this.formTrazabilidad.value;

    this.authService.login(correo!, password!).subscribe({

      next: (res) => {
        // Save token & user
        iziToast.success({
          title: 'Exito',
          message: res.message || 'Inicio de sesión exitoso',
          position: 'bottomRight',
        });

        // Redirección según rol
        this._router.navigate(['/app']);
      },
      error: (err) => {
        // this.errorMessage = err.error?.message || 'Error en el inicio de sesión';
        this.loading = false;

        const error = err.error;


        // 🔥 Manejo inteligente de errores del backend
        let title = 'Error';
        let message = 'Ocurrió un error inesperado';
        let icon: any = 'error';

        switch (error?.code) {

          case 'EMAIL_NOT_VERIFIED':
            title = 'Correo no verificado';
            message = 'Debes verificar tu correo antes de iniciar sesión.';
            icon = 'warning';
            break;

          case 'ACCOUNT_DISABLED':
            title = 'Cuenta deshabilitada';
            message = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
            icon = 'error';
            break;

          default:
            // Manejo por status HTTP
            if (err.status === 404) {
              message = 'Usuario no encontrado';
            } else if (err.status === 401) {
              message = 'Contraseña incorrecta';
            } else if (err.status === 400) {
              message = error?.message || 'Datos inválidos';
            } else {
              message = error?.message || message;
            }
        }

        Swal.fire({
          icon: icon,
          title: title,
          text: message,
          confirmButtonText: 'Entendido'
        });

        console.error(err);


      },
      complete: () => this.loading = false
    });
  }



  // ==================================
  // Propiedad para guardar el tipo seleccionado
  // ==================================
  tipoUsuario: 'administracion' | 'usuarios' = 'administracion';

  seleccionarUsuario(tipo: 'administracion' | 'usuarios') {
    this.tipoUsuario = tipo;
    // aquí podrías resetear/calcular lo que necesites según tipo


    // Reiniciamos los valores del formulario sin destruir su estructura
    this.formTrazabilidad.reset({
      tipo: tipo,
      correo: null,
      password: null,
    });

    // Si quieres mantener el enfoque en el campo "monto"
    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="correo"]');
      montoInput?.focus();
    }, 100);

    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="correo"]');
      montoInput?.focus();
    }, 100);
  }

}
