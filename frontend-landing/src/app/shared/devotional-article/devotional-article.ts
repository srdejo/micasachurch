import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { BibleApiService } from '../../core/bible-api.service';
import { parseBibleReferences } from '../../core/bible-reference';
import { DevotionalEntry } from '../../core/devotional-api.service';
import { AudioPlayer } from '../audio-player/audio-player';
import { BibleReader } from '../bible-reader/bible-reader';
import { TrackClick } from '../track-click/track-click';

@Component({
  selector: 'app-devotional-article',
  standalone: true,
  imports: [CommonModule, AudioPlayer, BibleReader, TrackClick],
  templateUrl: './devotional-article.html',
})
export class DevotionalArticle {
  private readonly bibleApi = inject(BibleApiService);

  readonly entry = input<DevotionalEntry | null>(null);
  readonly loading = input(false);
  readonly error = input(false);
  readonly fontScale = input(1);
  readonly retry = output<void>();

  readonly bibleReferences = computed(() => {
    const references = parseBibleReferences(this.entry()?.bible_in_a_year_references);
    return this.bibleApi.isEnabled ? references : references.map((reference) => ({ ...reference, passages: [] }));
  });
  readonly readableReferences = computed(() => this.bibleReferences().filter((reference) => reference.passages.length));
  readonly readerIndex = signal<number | null>(null);

  openReader(label: string): void {
    this.readerIndex.set(this.readableReferences().findIndex((reference) => reference.label === label));
  }
}
