import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface DevotionalEntry {
  title: string;
  passage_reference: string;
  verse: string;
  content: string;
  audio_url?: string;
  bible_in_a_year_references?: string;
}

/**
 * "Nuestro Pan Diario" is fetched directly from the client to the public
 * Our Daily Bread API — this content is never persisted or proxied by our backend.
 * The API returns a plain JSON array (or a single object on some days), not
 * an { entry: [...] } envelope — see docs/ARCHITECTURE.md for the rationale.
 */
@Injectable({ providedIn: 'root' })
export class DevotionalApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.experience.odb.org/devotionals/v2';

  getByDate(date: Date): Observable<DevotionalEntry | null> {
    const mmddyyyy = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    const params = new URLSearchParams({
      site_id: '2',
      status: 'publish',
      country: 'CO',
      on: mmddyyyy,
    });
    return this.http
      .get<DevotionalEntry | DevotionalEntry[]>(`${this.baseUrl}?${params.toString()}`)
      .pipe(map((res) => (Array.isArray(res) ? (res[0] ?? null) : res)));
  }
}
