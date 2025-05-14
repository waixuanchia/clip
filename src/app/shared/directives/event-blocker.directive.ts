import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[app-event-blocker]',
})
export class EventBlockerDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  handleEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
