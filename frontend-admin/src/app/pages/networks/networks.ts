import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, NetworkItem } from '../../core/admin-api.service';

@Component({
  selector: 'app-networks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './networks.html',
})
export class Networks implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly networks = signal<NetworkItem[]>([]);

  ngOnInit(): void {
    this.api.listNetworks().subscribe((data) => this.networks.set(data));
  }

  save(network: NetworkItem): void {
    this.api.updateNetwork(network.id, { description: network.description, leadContact: network.leadContact }).subscribe();
  }
}
