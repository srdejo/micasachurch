import { Component, ElementRef, HostListener, afterNextRender, input, output, viewChild } from '@angular/core';

/**
 * Diálogo de confirmación del panel. Reemplaza al `confirm()` del navegador, que además de romper
 * el estilo del panel bloquea el hilo y no se puede usar desde herramientas de automatización.
 *
 * El botón que recibe el foco al abrir es "Cancelar": la acción destructiva nunca debe dispararse
 * con un Enter reflejo.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input('');
  readonly confirmLabel = input('Eliminar');
  readonly cancelLabel = input('Cancelar');
  /** Mientras la petición está en curso: bloquea el botón y cambia su texto. */
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    afterNextRender(() => this.cancelButton()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  cancel(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }
}
