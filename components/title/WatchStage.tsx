'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { isValidSourceId } from '@/lib/api/video-sources';
import { isStaleBuildError, reloadForNewBuild } from '@/lib/client/stale-build';
import { parseWatchFragment, subscribeWatchFragment, writeWatchFragment, type WatchState } from '@/lib/client/watch-fragment';
import { useHistoryStore } from '@/lib/store/history-store';
import { findTitleHistory, useTitleHistory } from '@/lib/store/title-history';
import { getEpisodeDisplayInfo } from '@/lib/utils/episode-resolver';
import { seasonPlayTitle } from '@/lib/utils/season-resolver';

/*
 * The top of a title page: the player plays here, in place, without going to another page.
 * Before playback it is the still with a play button, the page's header under it and the
 * episode list (or the storyline) beside it; pressing play, an episode or play button further
 * down, or arriving with a fragment (#ep=3, #play: continue-watching links, old /player links)
 * puts the player in the still's place, with its own lines and episodes beside it. The episode
 * and line then live in the fragment (lib/client/watch-fragment.ts).
 */

// The player only ever mounts in the browser. The typeof guard is resolved at build time, which
// keeps its code out of the server bundle (the site's edge functions share a 25 MiB limit).
const loadPlayer = () =>
  typeof window === 'undefined'
    ? Promise.reject(new Error('The player loads in the browser only'))
    : import('@/components/player/containers/IkanPPPlayerContainer').then((m) => m.IkanPPPlayer);

// On a page from before a deploy the player's script is gone: reload onto the current build
// (the fragment keeps the episode), showing the skeleton meanwhile.
const Player = dynamic(
  () =>
    loadPlayer().catch((error: unknown) => {
      if (isStaleBuildError(error) && reloadForNewBuild()) return new Promise<never>(() => undefined);
      throw error;
    }),
  { ssr: false, loading: () => <StageSkeleton /> },
);

function StageSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 -mx-3 sm:mx-0 aspect-video sm:rounded-xl bg-black sm:border sm:border-white/10 grid place-items-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-red-500 animate-spin" aria-label="加载中" />
      </div>
    </div>
  );
}

interface WatchStageProps {
  entityId: string;
  /** The name the sources are searched by. */
  playTitle: string;
  displayTitle: string;
  type: string;
  year?: string | number | null;
  numberOfSeasons?: number;
  /** The season this page is about, when it is a season page. */
  season?: number | null;
  /** A 16:9 still (the backdrop); a poster is shown whole, on black. */
  still: string | null;
  stillIsPoster?: boolean;
  /** Under the still, and under the player once it plays: the title, facts and actions. */
  header: ReactNode;
  /** Beside the still until playback: the episode list, or the storyline for a film. */
  panel: ReactNode;
}

const serverHash = () => '';
const clientHash = () => window.location.hash;

export function WatchStage({ entityId, playTitle, displayTitle, type, year, numberOfSeasons = 1, season = null, still, stillIsPoster = false, header, panel }: WatchStageProps) {
  const router = useRouter();
  const hash = useSyncExternalStore(subscribeWatchFragment, clientHash, serverHash);
  const wanted = parseWatchFragment(hash);
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const titles = [playTitle, displayTitle];
  const saved = useTitleHistory(titles, { progress: false });
  const resume = saved ? getEpisodeDisplayInfo(saved.episodes, saved.episodeIndex) : null;

  /** The player's state for what the fragment asks for, where it names nothing: where the viewer left off. */
  const build = (w: WatchState): URLSearchParams => {
    const last = findTitleHistory(useHistoryStore.getState().viewingHistory, titles);
    // A show of several seasons plays its first unless told otherwise (as the episode list).
    const s = w.season ?? season ?? (numberOfSeasons > 1 ? 1 : null);
    const name = seasonPlayTitle(playTitle, s, numberOfSeasons);
    const p = new URLSearchParams({ entity: entityId, title: name, type: type === 'tv' ? 'tv' : 'movie' });
    if (year) p.set('year', String(year));
    p.set('episode', w.ep ?? (last ? getEpisodeDisplayInfo(last.episodes, last.episodeIndex).paramValue : '1'));
    if (s) p.set('season', String(s));
    // Played here before (this season): the same line and video, so a reload or a resume plays
    // on at once instead of searching the sources again. A line gone bad fails over as ever.
    const same = !!last && ((numberOfSeasons <= 1 && !s) || last.title.trim().toLowerCase() === name.trim().toLowerCase());
    const line = w.line ?? (same ? last.source : null);
    if (line && isValidSourceId(line)) {
      p.set('source', line);
      const id = same ? (line === last.source ? last.videoId : last.sourceMap?.[line]) : undefined;
      if (id != null && id !== '') p.set('id', String(id));
    }
    return p;
  };

  // The fragment asked for something the player is not showing yet: start, or follow it (an
  // episode link further down the page). The player's own changes are written with its state
  // already set, so they match and change nothing here.
  const current = params ? { ep: params.get('episode'), season: Number(params.get('season')) || null, line: params.get('source') } : null;
  const differs =
    current != null && ((wanted.ep != null && wanted.ep !== current.ep) || (wanted.season != null && wanted.season !== current.season) || (wanted.line != null && wanted.line !== current.line));
  if (wanted.requested && (!params || differs)) {
    if (!params) {
      setParams(build(wanted));
    } else {
      const next = new URLSearchParams(params);
      if (wanted.season != null && wanted.season !== current?.season) {
        // Another season is another search: drop the found line.
        next.set('season', String(wanted.season));
        next.set('title', seasonPlayTitle(playTitle, wanted.season, numberOfSeasons));
        next.delete('id');
        next.delete('source');
        next.delete('gsKey');
      }
      if (wanted.ep != null) next.set('episode', wanted.ep);
      if (wanted.line != null && wanted.line !== current?.line && isValidSourceId(wanted.line)) {
        next.set('source', wanted.line);
        next.delete('id');
      }
      setParams(next);
    }
  }

  // Stable for the memoized player: made once (setParams, and the app router, never change).
  const [replace] = useState(() => (query: string) => {
    const next = new URLSearchParams(query);
    setParams(next);
    writeWatchFragment({ ep: next.get('episode'), season: Number(next.get('season')) || null, line: next.get('source') }, { notify: false });
  });
  const [open] = useState(() => (query: string) => router.push(`/player?${query}`));

  // Get the player's script while the page is idle, so a press starts at once.
  useEffect(() => {
    const warm = () => void loadPlayer().catch(() => undefined);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(warm);
    else {
      const t = window.setTimeout(warm, 1500);
      return () => window.clearTimeout(t);
    }
  }, []);

  const start = () => writeWatchFragment(resume ? { ep: resume.paramValue, season } : { season });

  return (
    <div id="watch-stage" className="scroll-mt-24">
      {params ? (
        <Player params={params} replace={replace} open={open} variant="embedded" below={header} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 手机上贴边，和开播后的画面一致 */}
          <div className="lg:col-span-2 lg:row-start-1 -mx-3 sm:mx-0">
            <div className="relative aspect-video overflow-hidden sm:rounded-xl bg-black sm:border sm:border-white/10">
              {still ? (
                // Native <img> (铁律 9): the page's largest picture, painted before any script.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={still}
                  alt={`${displayTitle}剧照`}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full ${stillIsPoster ? 'object-contain' : 'object-cover opacity-80'}`}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
              <button type="button" onClick={start} aria-label={`播放《${displayTitle}》`} className="group absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer">
                <span className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-red-600 text-white shadow-xl shadow-black/40 transition group-hover:scale-105">
                  <Play className="ml-1 h-7 w-7 sm:h-9 sm:w-9 fill-white" />
                </span>
                {resume ? <span className="rounded-full bg-black/60 px-3 py-1 text-sm text-white">继续观看 {resume.label}</span> : null}
              </button>
            </div>
          </div>
          <div className="order-3 lg:order-none lg:col-start-3 lg:row-start-1 lg:row-span-2">{panel}</div>
          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2">{header}</div>
        </div>
      )}
    </div>
  );
}
