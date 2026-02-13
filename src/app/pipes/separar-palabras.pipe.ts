import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'separarPalabras'
})
export class SepararPalabrasPipe implements PipeTransform {

   private conectores = [
    'de', 'del', 'la', 'el', 'los', 'las',
    'y', 'o', 'para', 'a', 'en', 'ala',
  ];

 transform(value: string): string {
    if (!value) return '';

    let texto = value
      // Separar camelCase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Separar snake_case
      .replace(/_/g, ' ')
      // Normalizar combinaciones tipo ALa, DeLa, ParaLa, etc.
      .replace(/\b(a|de|para)(la|el|los|las)\b/gi, '$1 $2')
      .toLowerCase();

    return texto
      .split(/\s+/)
      .map((word, index) => {
        if (this.conectores.includes(word) && index !== 0) {
          return word; // conector en minúscula
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}
