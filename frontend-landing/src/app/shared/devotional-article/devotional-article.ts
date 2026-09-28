import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { DevotionalEntry } from '../../core/devotional-api.service';
import { AudioPlayer } from '../audio-player/audio-player';

@Component({
  selector: 'app-devotional-article',
  standalone: true,
  imports: [CommonModule, AudioPlayer],
  templateUrl: './devotional-article.html',
})
export class DevotionalArticle {
  readonly entry = input<DevotionalEntry | null>(null);
  readonly loading = input(false);
  readonly error = input(false);
  readonly fontScale = input(1);
  readonly retry = output<void>();
}
