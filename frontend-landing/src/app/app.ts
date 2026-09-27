import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandThemeService } from './core/brand-theme.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly brandTheme = inject(BrandThemeService);

  ngOnInit(): void {
    this.brandTheme.load();
  }
}
