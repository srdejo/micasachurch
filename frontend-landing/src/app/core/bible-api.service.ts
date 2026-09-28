import { isPlatformBrowser } from '@angular/common';
import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import type { BibleClient } from '@youversion/platform-core';
import { environment } from '../../environments/environment';

export interface BibleVersionOption {
  id: number;
  abbreviation: string;
  title: string;
}

export interface BiblePassageText {
  html: string;
  attribution: string;
}

type BibleSdk = Pick<typeof import('@youversion/platform-core'), 'ApiClient' | 'BibleClient'>;

/** Loaded on first use so the SDK stays out of the initial and server bundles. */
export const BIBLE_SDK_LOADER = new InjectionToken<() => Promise<BibleSdk>>('BIBLE_SDK_LOADER', {
  providedIn: 'root',
  factory: () => () => import('@youversion/platform-core'),
});

export const BIBLE_APP_KEY = new InjectionToken<string>('BIBLE_APP_KEY', {
  providedIn: 'root',
  factory: () => environment.youversionAppKey,
});

const STORAGE_KEY = 'mcc.bibleVersion';
const PREFERRED_ABBREVIATIONS = ['NTV', 'PDT'];
// Listed for our App Key but unreadable: GlossSP returns 404 for passages and RVES has no attribution.
const HIDDEN_VERSION_IDS = new Set([4212, 147]);

/**
 * Bible text comes straight from the YouVersion Platform to the visitor's
 * browser, like the devotional — our backend never sees or stores it.
 */
@Injectable({ providedIn: 'root' })
export class BibleApiService {
  private readonly loadSdk = inject(BIBLE_SDK_LOADER);
  private readonly appKey = inject(BIBLE_APP_KEY);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isEnabled = !!this.appKey;

  private client?: Promise<BibleClient>;
  private versions?: Promise<BibleVersionOption[]>;
  private readonly unusable = new Set<number>();

  async listSpanishVersions(): Promise<BibleVersionOption[]> {
    this.versions ??= this.fetchSpanishVersions().catch((error) => {
      this.versions = undefined;
      throw error;
    });
    return (await this.versions).filter((version) => !this.unusable.has(version.id));
  }

  async getPassage(versionId: number, passageId: string): Promise<BiblePassageText> {
    const client = await this.bibleClient();
    try {
      const display = await client.getPassageDisplay({ versionId, passageId, includeHeadings: true });
      const attribution = display.attribution.text.trim();
      if (!attribution) throw new MissingAttributionError();
      return { html: display.html, attribution };
    } catch (error) {
      if (error instanceof MissingAttributionError || (error as { code?: string })?.code === 'missing_passage_attribution') {
        this.unusable.add(versionId);
        throw new MissingAttributionError();
      }
      throw error;
    }
  }

  preferredVersion(versions: BibleVersionOption[]): BibleVersionOption | null {
    const stored = Number(this.readStorage());
    const remembered = versions.find((version) => version.id === stored);
    if (remembered) return remembered;
    for (const abbreviation of PREFERRED_ABBREVIATIONS) {
      const match = versions.find((version) => version.abbreviation.toUpperCase() === abbreviation);
      if (match) return match;
    }
    return versions[0] ?? null;
  }

  rememberVersion(versionId: number): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(versionId));
    } catch {
      // Storage can be blocked (private mode, site data disabled); the choice just isn't remembered.
    }
  }

  private readStorage(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private async fetchSpanishVersions(): Promise<BibleVersionOption[]> {
    const client = await this.bibleClient();
    const page = await client.getVersions('es', undefined, { page_size: 99 });
    return page.data
      .filter((version) => !HIDDEN_VERSION_IDS.has(version.id))
      .map((version) => ({
        id: version.id,
        abbreviation: version.localized_abbreviation || version.abbreviation,
        title: version.localized_title || version.title,
      }));
  }

  private bibleClient(): Promise<BibleClient> {
    this.client ??= this.loadSdk()
      .then(({ ApiClient, BibleClient }) => new BibleClient(new ApiClient({ appKey: this.appKey })))
      .catch((error) => {
        this.client = undefined;
        throw error;
      });
    return this.client;
  }
}

export class MissingAttributionError extends Error {
  constructor() {
    super('bible.missing_attribution');
  }
}
