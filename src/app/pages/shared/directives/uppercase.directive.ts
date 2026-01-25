import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appUppercase]'
})
export class UppercaseDirective {

  constructor(private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>) { }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = input.value.toUpperCase();

    // Mantener cursor
    input.setSelectionRange(start!, end!);

    // Disparar evento para Reactive Forms
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
