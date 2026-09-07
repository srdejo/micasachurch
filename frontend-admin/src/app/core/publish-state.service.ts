import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PublishStateService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/publish`;

  readonly pendingCount = signal(0);
  readonly publishing = signal(false);
  /** Publicar puede fallar (token vencido, backend caido) y antes no se avisaba de nada. */
  readonly error = signal<string | null>(null);
  /**
   * Marca de tiempo de la ultima publicacion exitosa. Las vistas con borradores la observan
   * para recargarse: antes, tras publicar, la cabecera decia "Todo publicado" mientras las
   * filas seguian mostrando "Cambios sin publicar" con el `hasDraft` viejo.
   */
  readonly publishedAt = signal(0);

  refresh(): void {
    this.http.get<{ pendingCount: number }>(`${this.baseUrl}/pending`).subscribe({
      next: (res) => this.pendingCount.set(res.pendingCount),
      error: () => {},
    });
  }

  publish(onDone?: () => void): void {
    this.publishing.set(true);
    this.error.set(null);
    this.http.post<{ pendingCount: number }>(this.baseUrl, {}).subscribe({
      next: (res) => {
        this.publishing.set(false);
        this.pendingCount.set(res.pendingCount);
        this.publishedAt.set(Date.now());
        onDone?.();
      },
      error: () => {
        this.publishing.set(false);
        this.error.set('No se pudieron publicar los cambios. Intenta de nuevo.');
      },
    });
  }
}
