import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';

/**
 * A title's episodes play on its title page (详情页即播放页). For a /player link to one of the
 * site's titles (entity=…): that page, with the episode, season and line in the fragment.
 * Null for links without a title of ours (a source's video: history, favorites, search results),
 * which keep /player.
 */
export function titlePageForPlayerLink(q: URLSearchParams): string | null {
  const entity = q.get('entity')?.trim();
  if (!entity) return null;
  const title = q.get('title')?.trim() || '';
  const season = parseSeasonFromTitle(title);
  // Only a standard ID goes into the URL; a radar title's temporary ID never does (铁律 13.4).
  const id = /^ik\d{6}$/i.test(entity) ? entity.toLowerCase() : undefined;
  const path = getTitleCanonicalHref({ entityId: id, title: season ? season.baseTitle : title });
  if (path === '/') return null;

  const fragment = new URLSearchParams();
  const s = Number(q.get('season')) || season?.seasonNumber || 0;
  if (s > 0) fragment.set('s', String(s));
  const ep = q.get('episode')?.trim() || q.get('ep')?.trim();
  if (ep) fragment.set('ep', ep);
  const line = q.get('source')?.trim() || '';
  if (/^[a-z0-9_]{1,24}$/.test(line)) fragment.set('line', line);
  return `${path}#${fragment.toString() || 'play'}`;
}
