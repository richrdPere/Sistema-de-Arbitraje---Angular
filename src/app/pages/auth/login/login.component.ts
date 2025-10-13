import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';


// Izitoast
import iziToast from 'izitoast';

// Servicio
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  fb = inject(FormBuilder);

  public user: any = {};
  public token: any = '';

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private authService: AuthService,
    private _router: Router
  ) {
    //this.token = this._adminService.getToken();
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
    if (this.form.invalid) return;
    this.loading = true;

    const { correo, password } = this.form.value;

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
          case 'arbitro':
            this._router.navigate(['/dashboard/arbitro']);
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

}
