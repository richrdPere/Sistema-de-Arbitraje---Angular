import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private _router: Router) {
    this.formTrazabilidad = this.fb.group({
      tipo: ['administracion'],   // ejemplo: radio/selector
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]     //  ahora sí existe
      // nro: [null],       //  ahora sí existe
      // anio: [null],       //  ahora sí existe
      // codigo: [null],       //  ahora sí existe
    });
  }

  ngOnInit(): void {
    console.log(this.token);

    if (this.token) {
      this._router.navigate(['/admin']);
    }
    else {
      // Mantener en el componente login
    }
  }

  login() {
    if (this.formTrazabilidad.invalid) return;
    this.loading = true;

    const { correo, password } = this.formTrazabilidad.value;

    this.authService.login(correo!, password!).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        iziToast.success({
          title: 'Exito',
          message: res.message || 'Inicio de sesión exitoso',
          position: 'bottomRight',
        });


        // Guardar token en localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.usuario.rol);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        // Redirección según rol
        switch (res.usuario.rol) {
          case 'secretaria':
            console.log("Redirigiendo a panel de secretaria...");
            this._router.navigate(['/admin']); // Lazy load admin -> redirige a expedientes
            break;
          case 'participe':
            this._router.navigate(['/participe']);
            break;
          case 'cliente':
            this._router.navigate(['/panel/cliente']);
            break;
          default:
            this._router.navigate(['/']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error en el inicio de sesión';
        this.loading = false;
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
    console.log('Tipo Usuario seleccionada:', this.tipoUsuario);

    // Reiniciamos los valores del formulario sin destruir su estructura
    this.formTrazabilidad.reset({
      tipo: tipo,
      email: '',
      nro: null,
      anio: null,
      codigo: null,
      contraseña: null
    });

    // Si quieres mantener el enfoque en el campo "monto"
    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="email"]');
      montoInput?.focus();
    }, 100);

    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="nro"]');
      montoInput?.focus();
    }, 100);
  }

}
