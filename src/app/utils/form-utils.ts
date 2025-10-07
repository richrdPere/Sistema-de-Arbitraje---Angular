import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

async function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 20);
  });
}

export class FormUtils {

  static namePattern = '^([A-Za-zÁÉÍÓÚáéíóúÑñ]+)(\\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$';
  static lastNamePattern = '([a-zA-Z]+) ([a-zA-Z]+)';
  static dniPattern = '^[0-9]\{8}$';
  static phonePattern = '^[0-9]\{9}$';
  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';

  // Funciones especificas
  static isAdult(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthdate = new Date(control.value);
      if (isNaN(birthdate.getTime())) {
        return { invalidDate: true };
      }

      const today = new Date();
      const age = today.getFullYear() - birthdate.getFullYear();
      const m = today.getMonth() - birthdate.getMonth();

      const isBirthdayPassed = m > 0 || (m === 0 && today.getDate() >= birthdate.getDate());
      const finalAge = isBirthdayPassed ? age : age - 1;

      return finalAge >= minAge ? null : { underage: true };
    };
  }

  // Expresiones regulares
  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';

        case 'minlength':
          return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;

        case 'min':
          return `El valor mínimo permitido es ${errors['min'].min}`;

        case 'invalidDate':
          return 'La fecha ingresada no es válida';

        case 'underage':
          return 'Debe tener al menos 18 años';

        case 'email':
          return `El correo electrónico no es válido`;

        case 'emailTaken':
          return `El correo ya está registrado por otro usuario`;

        case 'noStrider':
          return `No se puede usar ese username en la app`;

        case 'pattern':
          const pattern = errors['pattern'].requiredPattern;

          if (pattern === FormUtils.emailPattern) {
            return 'El valor ingresado no es un correo electrónico válido';
          } else if (pattern === FormUtils.dniPattern) {
            return 'El DNI debe tener 8 dígitos numéricos';
          } else if (pattern === FormUtils.phonePattern) {
            return 'El número de celular deben ser un numero de 9 dígitos';
          } else if (pattern === FormUtils.namePattern) {
            return 'Solo se permiten letras (sin números ni símbolos)';
          } else if (pattern === FormUtils.notOnlySpacesPattern) {
            return 'No puede contener solo espacios';
          }

          return 'El formato ingresado no es válido';

        default:
          return `Error de validación no controlado ${key}`;
      }
    }

    return null;
  }

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return !!form.controls[fieldName].errors && form.controls[fieldName].touched
  };


  static getFieldError(form: FormGroup, fieldName: string): string | null {

    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextError(errors);

  }

  static isValidFieldinArray(FormArray: FormArray, index: number) {
    return (
      FormArray.controls[index].errors && FormArray.controls[index].touched
    )
  }


  static getFieldErrorinArray(formArray: FormArray, index: number): string | null {

    if (formArray.controls.length === 0) return null;

    const errors = formArray.controls[index].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  static isFieldOneEqualFieldTwo(field1: string, field2: string) {
    return (formGroup: AbstractControl) => {

      const field1Value = formGroup.get(field1)?.value;
      const field2Value = formGroup.get(field2)?.value;

      return field1Value === field2Value ? null : { passwordsNotEqual: true }
    };
  }

  static async checkingServerResponse(control: AbstractControl): Promise<ValidationErrors | null> {

    console.log('Validando contra servidor');

    await sleep(); // 2 segundfos y medio

    const formValue = control.value;

    if (formValue === 'hola@mundo.com') {
      return {
        emailTaken: true,
      }

    }


    return null;
  }

  static notStrider(control: AbstractControl): ValidationErrors | null {

    const value = control.value;

    return value === 'strider' ? { noStrider: true } : null;
  }
}
