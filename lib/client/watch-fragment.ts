'use client';

/*
 * Playback on a title page lives in the URL fragment: #ep=3, #s=2&ep=3, #ep=3&line=modu, or
 * #play for the default episode. The fragment never reaches the server, so the title page stays
 * one cacheable, indexable URL however many episodes there are. Play buttons and episode links
 * anywhere on the page only write it; the page's WatchStage plays what it says.
 */

export interface WatchState {
  /** Episode as the player takes it: a number ("3") or a special's name. */
  ep?: string | null;
  season?: number | null;
  /** Source id of the line to prefer. */
  line?: string | null;
}

/** Fired after the fragment is written here (replaceState fires no hashchange). */
export const WATCH_EVENT = 'ikanpp:watch';

export function parseWatchFragment(hash: string): WatchState & { requested: boolean } {
  const raw = hash.replace(/^#/, '');
  const q = new URLSearchParams(raw);
  const season = Number(q.get('s'));
  const line = q.get('line');
  return {
    requested: raw.length > 0 && (q.has('play') || q.has('ep') || q.has('s') || q.has('line')),
    ep: q.get('ep') || null,
    season: Number.isInteger(season) && season > 0 ? season : null,
    line: line && /^[a-z0-9_]{1,24}$/.test(line) ? line : null,
  };
}

export function watchFragment(state: WatchState): string {
  const q = new URLSearchParams();
  if (state.season) q.set('s', String(state.season));
  if (state.ep) q.set('ep', state.ep);
  if (state.line) q.set('line', state.line);
  const s = q.toString();
  return s ? `#${s}` : '#play';
}

/**
 * Writes the fragment without a history entry or a Next.js navigation. `notify`: tell the page
 * (off for the player's own changes, which it already shows). `reveal`: bring the player into
 * view (for buttons and links further down the page).
 */
export function writeWatchFragment(state: WatchState, { notify = true, reveal = false }: { notify?: boolean; reveal?: boolean } = {}): void {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search}${watchFragment(state)}`);
  if (notify) window.dispatchEvent(new Event(WATCH_EVENT));
  if (reveal) document.getElementById('watch-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * For play buttons further down the page: start playing `state`, or, when the page already
 * plays, only bring the player into view (keeping the episode and line it is on).
 */
export function startWatching(state: WatchState = {}): void {
  if (parseWatchFragment(window.location.hash).requested) {
    document.getElementById('watch-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  writeWatchFragment(state, { reveal: true });
}

export function subscribeWatchFragment(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  window.addEventListener(WATCH_EVENT, listener);
  return () => {
    window.removeEventListener('hashchange', listener);
    window.removeEventListener(WATCH_EVENT, listener);
  };
}
