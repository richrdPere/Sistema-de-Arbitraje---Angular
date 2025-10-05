import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculadora',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './calculadora.component.html',
})
export class CalculadoraComponent implements OnInit {
  formCalculadora: FormGroup;
  resultado: any = null;

  constructor(private fb: FormBuilder) {
    this.formCalculadora = this.fb.group({
      tipo: ['determinada'],   // ejemplo: radio/selector
      monto: ['', [Validators.required, Validators.min(1)]],
      contrato: [null],        //  ahora sí existe
      pretension: [null]       //  ahora sí existe
    });
  }
  ngOnInit(): void {
    // cada vez que el valor del form cambia, reformatea
    this.formCalculadora.get('monto')?.valueChanges.subscribe(value => {
      if (value == null || value === '') return;

      // eliminamos comas para evitar problemas
      const numericValue = value.toString().replace(/,/g, '');
      if (isNaN(numericValue)) return;

      // formateamos
      const formatted = Number(numericValue).toLocaleString('es-PE'); // 12,345
      // actualizamos sin disparar otro valueChanges
      this.formCalculadora.get('monto')?.setValue(formatted, { emitEvent: false });
    });
  }

  // ==================================
  // Propiedad para guardar el tipo seleccionado
  // ==================================
  tipoCuantia: 'determinada' | 'indeterminada' = 'determinada';

  seleccionarCuantia(tipo: 'determinada' | 'indeterminada') {
    this.tipoCuantia = tipo;
    // aquí podrías resetear/calcular lo que necesites según tipo
    console.log('Cuantía seleccionada:', this.tipoCuantia);
  }

  // ==================================
  // Funciones
  // ==================================
  calcular(tipo: 'determinada' | 'indeterminada' | 'mixta') {
    const raw = (this.formCalculadora.value.monto || '').toString().replace(/,/g, '');
    const monto = parseFloat(raw);

    // datos adicionales desde el formulario
    const pretensionesIndeterminadas = this.formCalculadora.value.pretensionesIndeterminadas || 0;
    const montoContrato = this.formCalculadora.value.montoContrato || 0;
    const montoPretension = this.formCalculadora.value.montoPretension || 0;


    if (isNaN(monto) && pretensionesIndeterminadas <= 0) {
      return;
    }
    this.resultado = this.calcularGastosArbitrales(monto, montoContrato, montoPretension, pretensionesIndeterminadas);
  }

  private calcularGastosArbitrales(monto: number, montoContrato: number, montoPretension: number, pretensionesIndeterminadas: number) {
    const r: any = {
      monto_consulta: monto,
      honorarios_arbitro_unico: 0,
      honorarios_tribunal_arbitral: 0,
      gastos_secretaria: 0,
      gastos_administrativos: 0,
      total_arbitro_unico: 0,
      total_tribunal_arbitral: 0,
      cada_parte_arbitro_unico: 0,
      cada_parte_tribunal: 0
    };

    // 1. Calcular cuantía indeterminada si aplica
    let montoIndeterminado = 0;
    if (pretensionesIndeterminadas > 0) {
      montoIndeterminado = (montoContrato + montoPretension) * 0.025 * pretensionesIndeterminadas;
    }

    // 2. Calcular cuantía mixta (suma determinada + indeterminada)
    const cuantiaTotal = monto + montoIndeterminado;

    // ==============================
    // Honorarios Árbitro Único
    // ==============================
    if (cuantiaTotal <= 36000) {
      r.honorarios_arbitro_unico = 3819;
    } else if (cuantiaTotal <= 72000) {
      r.honorarios_arbitro_unico = 3819 + (cuantiaTotal - 36000) * 0.025;
    } else if (cuantiaTotal <= 108000) {
      r.honorarios_arbitro_unico = 4719 + (cuantiaTotal - 72000) * 0.0289;
    } else if (cuantiaTotal <= 180000) {
      r.honorarios_arbitro_unico = 5760 + (cuantiaTotal - 108000) * 0.0183;
    } else if (cuantiaTotal <= 360000) {
      r.honorarios_arbitro_unico = 7080 + (cuantiaTotal - 180000) * 0.008;
    } else if (cuantiaTotal <= 1800000) {
      r.honorarios_arbitro_unico = 8518 + (cuantiaTotal - 360000) * 0.0083;
    } else if (cuantiaTotal <= 3600000) {
      r.honorarios_arbitro_unico = 20408 + (cuantiaTotal - 1800000) * 0.0054;
    } else {
      r.honorarios_arbitro_unico = 30156 + (cuantiaTotal - 3600000) * 0.0031;
    }
    r.honorarios_arbitro_unico = Math.min(r.honorarios_arbitro_unico, 151011);

    // ==============================
    // Honorarios Tribunal Arbitral
    // ==============================
    if (cuantiaTotal <= 36000) {
      r.honorarios_tribunal_arbitral = 6219;
    } else if (cuantiaTotal <= 72000) {
      r.honorarios_tribunal_arbitral = 6219 + (cuantiaTotal - 36000) * 0.0976;
    } else if (cuantiaTotal <= 108000) {
      r.honorarios_tribunal_arbitral = 9734 + (cuantiaTotal - 72000) * 0.0653;
    } else if (cuantiaTotal <= 180000) {
      r.honorarios_tribunal_arbitral = 12083 + (cuantiaTotal - 108000) * 0.0445;
    } else if (cuantiaTotal <= 360000) {
      r.honorarios_tribunal_arbitral = 15284 + (cuantiaTotal - 180000) * 0.0156;
    } else if (cuantiaTotal <= 1800000) {
      r.honorarios_tribunal_arbitral = 18092 + (cuantiaTotal - 360000) * 0.017;
    } else if (cuantiaTotal <= 3600000) {
      r.honorarios_tribunal_arbitral = 42606 + (cuantiaTotal - 1800000) * 0.0109;
    } else {
      r.honorarios_tribunal_arbitral = 62253 + (cuantiaTotal - 3600000) * 0.0063;
    }
    r.honorarios_tribunal_arbitral = Math.min(r.honorarios_tribunal_arbitral, 306584);

    // ==============================
    // Gastos Secretaría
    // ==============================
    if (cuantiaTotal <= 36000) {
      r.gastos_secretaria = 1793;
    } else if (cuantiaTotal <= 72000) {
      r.gastos_secretaria = 1793 + (cuantiaTotal - 36000) * 0.0266;
    } else if (cuantiaTotal <= 108000) {
      r.gastos_secretaria = 2749 + (cuantiaTotal - 72000) * 0.0219;
    } else if (cuantiaTotal <= 180000) {
      r.gastos_secretaria = 3536 + (cuantiaTotal - 108000) * 0.0121;
    } else if (cuantiaTotal <= 360000) {
      r.gastos_secretaria = 4407 + (cuantiaTotal - 180000) * 0.0071;
    } else if (cuantiaTotal <= 1800000) {
      r.gastos_secretaria = 5689 + (cuantiaTotal - 360000) * 0.0042;
    } else if (cuantiaTotal <= 3600000) {
      r.gastos_secretaria = 11679 + (cuantiaTotal - 1800000) * 0.003;
    } else {
      r.gastos_secretaria = 17071 + (cuantiaTotal - 3600000) * 0.0019;
    }
    r.gastos_secretaria = Math.min(r.gastos_secretaria, 129382);

    // ==============================
    // Gastos Administrativos + IGV
    // ==============================
    const IGV = 0.18;
    const porcentajeAdmin = 0.025; // 2.5%
    const subtotal = r.honorarios_arbitro_unico + r.gastos_secretaria;
    r.gastos_administrativos = subtotal * porcentajeAdmin * (1 + IGV);

    // ==============================
    // Totales
    // ==============================
    r.total_arbitro_unico = r.honorarios_arbitro_unico + r.gastos_secretaria + r.gastos_administrativos;
    r.total_tribunal_arbitral = r.honorarios_tribunal_arbitral + r.gastos_secretaria + r.gastos_administrativos;

    // Cada parte paga 50 %
    r.cada_parte_arbitro_unico = r.total_arbitro_unico / 2;
    r.cada_parte_tribunal = r.total_tribunal_arbitral / 2;

    // ==============================
    // Salida con 2 decimales
    // ==============================
    Object.keys(r).forEach(k => {
      if (typeof r[k] === 'number') {
        r[k] = parseFloat(r[k].toFixed(2));
      }
    });

    return r;
  }


  formatearMoneda(monto: number) {
    return 'S/. ' + monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  reset() {
    this.resultado = null;
    this.formCalculadora.value.monto = 0;
  }

}
