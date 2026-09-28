import {
  Component,
  DOCUMENT,
  DestroyRef,
  OnInit,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { BibleApiService, BibleVersionOption, MissingAttributionError } from '../../core/bible-api.service';
import { BibleReference } from '../../core/bible-reference';

interface ChapterText {
  chapter: string;
  html: string;
}

@Component({
  selector: 'app-bible-reader',
  standalone: true,
  templateUrl: './bible-reader.html',
  host: {
    '(document:keydown.escape)': 'close.emit()',
    '(keydown)': 'trapFocus($event)',
  },
})
export class BibleReader implements OnInit {
  private readonly api = inject(BibleApiService);
  private readonly document = inject(DOCUMENT);

  readonly references = input.required<BibleReference[]>();
  readonly initialIndex = input(0);
  readonly close = output<void>();

  readonly activeIndex = signal(0);
  readonly versions = signal<BibleVersionOption[]>([]);
  readonly versionId = signal<number | null>(null);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly chapters = signal<ChapterText[]>([]);
  readonly attribution = signal('');

  readonly active = computed(() => this.references()[this.activeIndex()]);

  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');
  private request = 0;

  constructor() {
    const opener = this.document.activeElement as HTMLElement | null;
    const body = this.document.body;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      this.closeButton().nativeElement.focus();
      destroyRef.onDestroy(() => {
        body.style.overflow = previousOverflow;
        opener?.focus();
      });
    });
  }

  ngOnInit(): void {
    this.activeIndex.set(this.initialIndex());
    this.load();
  }

  selectTab(index: number): void {
    if (index === this.activeIndex()) return;
    this.activeIndex.set(index);
    this.load();
  }

  selectVersion(value: string): void {
    const id = Number(value);
    this.versionId.set(id);
    this.api.rememberVersion(id);
    this.load();
  }

  async load(): Promise<void> {
    const request = ++this.request;
    const reference = this.active();
    this.status.set('loading');
    try {
      const versions = await this.api.listSpanishVersions();
      if (request !== this.request) return;
      this.versions.set(versions);
      if (!versions.some((version) => version.id === this.versionId())) {
        this.versionId.set(this.api.preferredVersion(versions)?.id ?? null);
      }
      const versionId = this.versionId();
      if (versionId === null) throw new Error('bible.no_versions');

      const texts = await Promise.all(reference.passages.map((passage) => this.api.getPassage(versionId, passage)));
      if (request !== this.request) return;
      this.chapters.set(
        texts.map((text, i) => ({ chapter: reference.passages[i].split('.')[1], html: text.html })),
      );
      this.attribution.set(texts[0].attribution);
      this.status.set('ready');
    } catch (error) {
      if (request !== this.request) return;
      // The service drops a version without attribution from the list, so retrying picks the next one.
      if (error instanceof MissingAttributionError) {
        this.load();
        return;
      }
      this.status.set('error');
    }
  }

  trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const focusable = [
      ...this.dialog().nativeElement.querySelectorAll<HTMLElement>('button:not([disabled]), select, [href], [tabindex]:not([tabindex="-1"])'),
    ];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const backwards = event.shiftKey;
    const current = this.document.activeElement;
    if (backwards && (current === first || !this.dialog().nativeElement.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!backwards && current === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
