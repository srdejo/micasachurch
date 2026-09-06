import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, NetworkItem } from '../../core/admin-api.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-networks',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './networks.html',
})
export class Networks implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly networks = signal<NetworkItem[]>([]);
  readonly status = signal<Record<string, SaveStatus>>({});
  readonly pendingDelete = signal<NetworkItem | null>(null);
  readonly deleting = signal(false);

  readonly newName = signal('');
  readonly newDescription = signal('');
  readonly newLeadContact = signal('');
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.api.listNetworks().subscribe((data) => this.networks.set(data));
  }

  save(network: NetworkItem): void {
    this.status.update((s) => ({ ...s, [network.id]: 'saving' }));
    this.api
      .updateNetwork(network.id, {
        name: network.name,
        description: network.description,
        leadContact: network.leadContact,
      })
      .subscribe({
        next: () => {
          this.status.update((s) => ({ ...s, [network.id]: 'saved' }));
          setTimeout(() => this.status.update((s) => ({ ...s, [network.id]: 'idle' })), 2000);
        },
        error: () => this.status.update((s) => ({ ...s, [network.id]: 'error' })),
      });
  }

  /**
   * La red se crea sólo cuando el formulario está lleno. Antes el botón creaba una "Nueva red"
   * vacía en el servidor, y como las redes no pasan por publicación, esa tarjeta sin contenido
   * aparecía de inmediato en el sitio público mientras se llenaba.
   */
  add(): void {
    const name = this.newName().trim();
    const description = this.newDescription().trim();
    if (!name || !description) {
      return;
    }
    this.creating.set(true);
    this.createError.set(null);
    this.api
      .createNetwork({ name, description, leadContact: this.newLeadContact().trim() || null })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.newName.set('');
          this.newDescription.set('');
          this.newLeadContact.set('');
          this.reload();
        },
        error: () => {
          this.creating.set(false);
          this.createError.set('No se pudo agregar la red.');
        },
      });
  }

  askDelete(network: NetworkItem): void {
    this.pendingDelete.set(network);
  }

  confirmDelete(): void {
    const network = this.pendingDelete();
    if (!network) {
      return;
    }
    this.deleting.set(true);
    this.api.deleteNetwork(network.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.reload();
      },
      error: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.status.update((s) => ({ ...s, [network.id]: 'error' }));
      },
    });
  }
}
