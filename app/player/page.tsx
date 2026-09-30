import { Suspense } from 'react';
import { permanentRedirect } from 'next/navigation';
import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { PlayerRouter } from './PlayerRouter';

export const runtime = 'edge';

type Query = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || '';

/**
 * A title's episodes play on its title page now (详情页即播放页): a link to one of the site's
 * titles (entity=…) goes there, with the episode, season and line in the fragment. Premium links
 * and links to a source's video without a title of ours keep this player.
 */
function titlePageFor(q: Query): string | null {
  const entity = first(q.entity);
  if (!entity || first(q.premium) === '1') return null;
  const title = first(q.title);
  const season = parseSeasonFromTitle(title);
  const id = /^ik\d{6}$/i.test(entity) ? entity.toLowerCase() : undefined;
  // Only a standard ID goes into the URL; a radar title's temporary ID never does (铁律 13.4).
  const path = getTitleCanonicalHref({ entityId: id, title: season ? season.baseTitle : title });
  if (path === '/') return null;

  const fragment = new URLSearchParams();
  const s = Number(first(q.season)) || season?.seasonNumber || 0;
  if (s > 0) fragment.set('s', String(s));
  const ep = first(q.episode) || first(q.ep);
  if (ep) fragment.set('ep', ep);
  const line = first(q.source);
  if (/^[a-z0-9_]{1,24}$/.test(line)) fragment.set('line', line);
  const f = fragment.toString();
  // The Location header takes ASCII only: the Chinese slug goes percent-encoded.
  return `/title/${encodeURIComponent(path.replace(/^\/title\//, ''))}#${f || 'play'}`;
}

export default async function PlayerPage({ searchParams }: { searchParams: Promise<Query> }) {
  const target = titlePageFor(await searchParams);
  if (target) permanentRedirect(target);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--bg-color)">
          <div className="brand-spinner" />
        </div>
      }
    >
      <PlayerRouter />
    </Suspense>
  );
}
