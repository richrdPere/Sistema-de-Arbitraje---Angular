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
      monto: ['', [Validators.required, Validators.min(1), Validators.max(1999999)]],
      contrato: [null, [Validators.min(0), Validators.max(1999999)]],
      pretension: [null, [Validators.min(0), Validators.max(1999999)]]
    });
  }
  ngOnInit(): void {

    // PARA MONTO
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


    // PARA CONTRATO
    // cada vez que el valor del form cambia, reformatea
    this.formCalculadora.get('contrato')?.valueChanges.subscribe(value => {
      if (value == null || value === '') return;

      // eliminamos comas para evitar problemas
      const numericValue = value.toString().replace(/,/g, '');
      if (isNaN(numericValue)) return;

      // formateamos
      const formatted = Number(numericValue).toLocaleString('es-PE'); // 12,345
      // actualizamos sin disparar otro valueChanges
      this.formCalculadora.get('contrato')?.setValue(formatted, { emitEvent: false });
    });


    // PARA PRETENCION
    // cada vez que el valor del form cambia, reformatea
    this.formCalculadora.get('pretension')?.valueChanges.subscribe(value => {
      if (value == null || value === '') return;

      // eliminamos comas para evitar problemas
      const numericValue = value.toString().replace(/,/g, '');
      if (isNaN(numericValue)) return;

      // formateamos
      const formatted = Number(numericValue).toLocaleString('es-PE'); // 12,345
      // actualizamos sin disparar otro valueChanges
      this.formCalculadora.get('pretension')?.setValue(formatted, { emitEvent: false });
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

    // Reiniciamos los valores del formulario sin destruir su estructura
    this.formCalculadora.reset({
      tipo: tipo,
      monto: '',
      contrato: null,
      pretension: null
    });

    // Opcional: también reiniciamos el resultado mostrado
    this.resultado = null;

    // Si quieres mantener el enfoque en el campo "monto"
    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="monto"]');
      montoInput?.focus();
    }, 100);

    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="contrato"]');
      montoInput?.focus();
    }, 100);
  }

  // ==================================
  // Funciones
  // ==================================
  calcular(tipo: 'determinada' | 'indeterminada' | 'mixta') {
    const { monto, contrato, pretension } = this.formCalculadora.value;

    // Normalizamos valores
    const montoNum = parseFloat((monto || '0').toString().replace(/,/g, '')) || 0;
    const contratoNum = parseFloat((contrato || '0').toString().replace(/,/g, '')) || 0;
    const pretensionNum = parseFloat((pretension || '0').toString().replace(/,/g, '')) || 0;

    //  Validaciones generales
    if (montoNum >= 10701000 || contratoNum >= 10701000 || pretensionNum >= 10701000) {
      alert('No se puede calcular con valores iguales o mayores a 10,701,000.');
      return;
    }

    // Validaciones básicas según tipo
    if (tipo === 'determinada' && montoNum <= 0) {
      alert('Por favor ingresa un monto válido para la cuantía determinada.');
      return;
    }

    if (tipo === 'indeterminada' && (contratoNum <= 0 || pretensionNum <= 0)) {
      alert('Por favor ingresa los montos de contrato y pretensión.');
      return;
    }

    // Lógica según tipo
    let montoTotal = 0;

    if (tipo === 'determinada') {
      montoTotal = montoNum;
    } else if (tipo === 'indeterminada') {
      // Se estima la cuantía como el promedio o una fórmula de referencia
      // (ajustable según tu directiva de costos)
      montoTotal = (contratoNum + pretensionNum) * 0.025;
    } else {
      // caso mixto: suma de ambos tipos
      montoTotal = montoNum + (contratoNum + pretensionNum) * 0.025;
    }

    // Calculamos usando tu función principal
    this.resultado = this.calcularGastosArbitrales(montoTotal);
  }

  private calcularGastosArbitrales(cuantiaTotal: number) {
    const r: any = {
      monto_consulta: cuantiaTotal,
      honorarios_arbitro_unico: 0,
      honorarios_tribunal_arbitral: 0,
      gastos_secretaria: 0,
      gastos_administrativos: 0,
      total_arbitro_unico: 0,
      total_tribunal_arbitral: 0,
      cada_parte_arbitro_unico: 0,
      cada_parte_tribunal: 0
    };

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
    const porcentajeAdmin = 0.025;
    const subtotal = r.honorarios_arbitro_unico + r.gastos_secretaria;
    r.gastos_administrativos = subtotal * porcentajeAdmin * (1 + IGV);

    // ==============================
    // Totales
    // ==============================
    r.total_arbitro_unico = r.honorarios_arbitro_unico + r.gastos_secretaria + r.gastos_administrativos;
    r.total_tribunal_arbitral = r.honorarios_tribunal_arbitral + r.gastos_secretaria + r.gastos_administrativos;

    r.cada_parte_arbitro_unico = r.total_arbitro_unico / 2;
    r.cada_parte_tribunal = r.total_tribunal_arbitral / 2;

    Object.keys(r).forEach(k => {
      if (typeof r[k] === 'number') r[k] = parseFloat(r[k].toFixed(2));
    });

    return r;
  }


  formatearMoneda(monto: number) {
    return 'S/. ' + monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  reset() {
    this.resultado = null;


    // Reiniciamos todo el formulario
    this.formCalculadora.reset({
      tipo: this.tipoCuantia, // mantiene el tipo actual seleccionado
      monto: '',
      contrato: '',
      pretension: ''
    });

    // Opcional: enfocar nuevamente el campo monto
    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="monto"]');
      montoInput?.focus();
    }, 100);

    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="contrato"]');
      montoInput?.focus();
    }, 100);
  }
}
