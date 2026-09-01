import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, NetworkItem } from '../../core/admin-api.service';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-networks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './networks.html',
})
export class Networks implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly networks = signal<NetworkItem[]>([]);
  readonly status = signal<Record<string, SaveStatus>>({});

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

  add(): void {
    this.api
      .createNetwork({ name: 'Nueva red', description: '', leadContact: null })
      .subscribe(() => this.reload());
  }

  remove(network: NetworkItem): void {
    if (!confirm(`¿Eliminar la red "${network.name}"?`)) {
      return;
    }
    this.api.deleteNetwork(network.id).subscribe(() => this.reload());
  }
}
