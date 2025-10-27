import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';

@Component({
  selector: 'app-consulta-expedientes',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './consulta_expedientes.component.html',
})
export class ConsultaExpedientesComponent {
  formConsulta: FormGroup;
  resultado: any = null;
  cargando = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private tramiteService: TramiteMPVService) {
    this.formConsulta = this.fb.group({
      numeroExpediente: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  consultarExpediente() {
    if (this.formConsulta.invalid) return;

    const numero = this.formConsulta.value.numeroExpediente.trim();
    this.resultado = null;
    this.errorMsg = '';
    this.cargando = true;

    // console.log(`CONSULTANDO: ${numero}`);

    this.tramiteService.obtenerPorNumero(numero)
      .subscribe({
        next: (data: any) => {
          this.cargando = false;
          if (data) {
            this.resultado = data;
          } else {
            this.errorMsg = 'No se encontró ningún expediente con ese número.';
          }
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = 'Error al consultar el expediente. Intente nuevamente.';
          console.error(err);
        }
      });

    //  Ajusta la URL a tu backend (ejemplo)
    // this.tramiteService.obtenerPorNumero(numero).subscribe({
    //   next: r => { this.resultado = r; this.loading = false; },
    //   error: e => { this.resultado = null; this.loading = false; alert('No encontrado'); }
    // });
  }

  reset() {
    this.resultado = null;
    this.errorMsg = '';
    this.formConsulta.reset();
  }


}
