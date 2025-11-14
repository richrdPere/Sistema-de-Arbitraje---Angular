import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-confirmar-cuenta',
  imports: [],
  templateUrl: './confirmar-cuenta.component.html',
})
export class ConfirmarCuentaComponent implements OnInit {

  token: string | null = null;
  mensaje: string = '';
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (this.token) {
      this.confirmarCuenta(this.token);
    }
  }

  confirmarCuenta(token: string) {
    this.http
      .get(`http://localhost:4000/api/usuarios/confirmar/${token}`)
      .subscribe({
        next: (res: any) => {
          this.mensaje = res.message || 'Cuenta confirmada con éxito ';
          setTimeout(() => {
            this.router.navigate(['/trazabilidad']);
          }, 3000);
        },
        error: (err) => {
          this.error = true;
          this.mensaje =
            err.error?.message || 'Token inválido o cuenta ya confirmada ';
        },
      });
  }
}
