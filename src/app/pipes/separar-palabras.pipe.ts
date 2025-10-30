import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'separarPalabras'
})
export class SepararPalabrasPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    // Reemplaza mayúsculas por espacio + letra
    const separado = value.replace(/([A-Z])/g, ' $1');
    // Corrige el espacio inicial si existe y aplica Titlecase
    return separado.trim().replace(/\b\w/g, l => l.toUpperCase());
  }
}
