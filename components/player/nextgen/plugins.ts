import type Hls from 'hls.js';
import { BasePlugin, Events, langZhCn, Plugin, SimplePlayer, Sniffer, type IBasePluginOptions } from 'xgplayer';
import CssFullScreen from 'xgplayer/es/plugins/cssFullScreen';
import Enter from 'xgplayer/es/plugins/enter';
import Fullscreen from 'xgplayer/es/plugins/fullscreen';
import Keyboard from 'xgplayer/es/plugins/keyboard';
import Loading from 'xgplayer/es/plugins/loading';
import MobilePlugin from 'xgplayer/es/plugins/mobile';
import PCPlugin from 'xgplayer/es/plugins/pc';
import PIP from 'xgplayer/es/plugins/pip';
import PlayIcon from 'xgplayer/es/plugins/play';
import PlaybackRate from 'xgplayer/es/plugins/playbackRate';
import Poster from 'xgplayer/es/plugins/poster';
import Progress from 'xgplayer/es/plugins/progress';
import MiniProgress from 'xgplayer/es/plugins/progress/miniProgress';
import Start from 'xgplayer/es/plugins/start';
import Time from 'xgplayer/es/plugins/time';
import Volume from 'xgplayer/es/plugins/volume';

import { createHlsConfig, type HlsConfigOptions } from '@/lib/player/hls-config-factory';
import { checkIsIPadOS } from '@/lib/hooks/mobile/useDeviceDetection';
import { isStaleBuildError, reloadForNewBuild } from '@/lib/client/stale-build';

export type LoadMode = 'hls' | 'native' | 'unsupported';

/** Apple 设备（Safari 及 iOS 浏览器）内置支持原生 HLS，只有原生 HLS 才能支持 AirPlay 投屏且更加省电 */
function prefersNativeHls(media: HTMLVideoElement): boolean {
  return /Apple/.test(navigator.vendor) && media.canPlayType('application/vnd.apple.mpegurl') !== '';
}

/**
 * 起播截止看门狗阈值（15秒）
 * 若发出播放请求后 15 秒内仍未拿到第一帧画面（loadeddata），视为线路不可达并向外抛出错误，
 * 由容器中间层自动切换至下一条可用线路，彻底避免用户无限等待。
 */
const START_TIMEOUT = 15_000;

export interface HlsSourcePluginConfig {
  hlsOptions?: HlsConfigOptions;
  onFatal?: ((details: string) => void) | null;
}

/**
 * 新一代内核核心流媒体调度源插件 (Nextgen HlsSource Plugin)
 * 统一接管 <video> 元素的流加载与异常恢复；切换集数或换线路时复用同一实例与全屏状态
 */
export class HlsSource extends BasePlugin {
  static get pluginName() {
    return 'ngSource';
  }

  static get defaultConfig(): HlsSourcePluginConfig {
    return {
      hlsOptions: {},
      onFatal: null,
    };
  }

  private hls: Hls | null = null;
  private generation = 0;
  private startWatch: AbortController | null = null;

  constructor(args: IBasePluginOptions) {
    super(args);
    // 由本插件全权管理媒体源加载，禁用 xgplayer 内部的默认修改行为
    this.player.handleSource = false;
  }

  get usingHls(): boolean {
    return this.hls !== null;
  }

  /**
   * 监控起播阶段耗时：
   * - hls.js 引擎无论是否点击播放都会蓄水缓冲，因此从 load() 开始计时；
   * - 苹果原生 HLS 仅在明确播放时才会请求切片，因此仅在处于播放意图状态时计时。
   */
  private watchStart(media: HTMLVideoElement, generation: number, whilePlaying: boolean) {
    this.startWatch?.abort();
    const watch = new AbortController();
    this.startWatch = watch;
    let timer = 0;
    const halt = () => window.clearTimeout(timer);
    const arm = () => {
      halt();
      timer = window.setTimeout(() => {
        if (generation !== this.generation || (whilePlaying && media.paused) || media.readyState >= 2) return;
        watch.abort();
        this.config.onFatal?.('start-timeout');
      }, START_TIMEOUT);
    };

    watch.signal.addEventListener('abort', halt);
    media.addEventListener('loadeddata', () => watch.abort(), { signal: watch.signal });

    if (!whilePlaying) {
      arm();
      return;
    }

    media.addEventListener('play', arm, { signal: watch.signal });
    media.addEventListener('pause', halt, { signal: watch.signal });
    if (!media.paused) arm();
  }

  async load(url: string): Promise<LoadMode | null> {
    const generation = ++this.generation;
    this.hls?.destroy();
    this.hls = null;
    const media = this.player.media as HTMLVideoElement;
    if (!media) return null;

    const native = prefersNativeHls(media);
    this.watchStart(media, generation, native);

    if (native) {
      media.src = url;
      return 'native';
    }

    let HlsCtor: typeof import('hls.js').default;
    try {
      ({ default: HlsCtor } = await import('hls.js'));
    } catch (error) {
      // 旧版本页面：刷新到新版本，不当作线路故障（不触发换线路，也不上报失败）
      if (isStaleBuildError(error) && reloadForNewBuild()) return null;
      throw error;
    }
    if (generation !== this.generation) return null; // 存在更新的加载或已被销毁

    if (HlsCtor.isSupported()) {
      // 严格使用工程统一的 HLS 配置工厂
      const hlsConfig = createHlsConfig(this.config.hlsOptions || {});
      const hls = new HlsCtor(hlsConfig);
      this.hls = hls;

      let mediaRecoveries = 0;
      hls.on(HlsCtor.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === HlsCtor.ErrorTypes.MEDIA_ERROR && mediaRecoveries < 1) {
          mediaRecoveries++;
          hls.recoverMediaError();
          return;
        }
        this.config.onFatal?.(data.details);
      });

      hls.loadSource(url);
      hls.attachMedia(media);
      return 'hls';
    }

    if (media.canPlayType('application/vnd.apple.mpegurl')) {
      media.src = url;
      return 'native';
    }

    return 'unsupported';
  }

  destroy() {
    this.generation++;
    this.startWatch?.abort();
    this.hls?.destroy();
    this.hls = null;
  }
}

const tap = () => (Sniffer.device === 'mobile' ? 'touchend' : 'click');

abstract class ActionButton extends Plugin {
  afterCreate() {
    this.bind(tap(), (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.config.onClick?.();
    });
  }
}

export class PrevButton extends ActionButton {
  static get pluginName() {
    return 'ngPrev';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.CONTROLS_LEFT, index: 0, onClick: null as (() => void) | null };
  }

  render() {
    return `<xg-icon class="ng-prev" aria-label="上一集">
      <div class="xgplayer-icon"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#fff" d="M18 5.5v13L8.5 12zM5.3 5.5h2.2v13H5.3z"/></svg></div>
      <div class="xg-tips">上一集</div>
    </xg-icon>`;
  }
}

abstract class SeekButton extends Plugin {
  abstract get seconds(): number;

  afterCreate() {
    this.bind(tap(), (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const media = this.player.media as HTMLVideoElement;
      if (!media) return;
      // 用户主动点击快进快退交互（区别于卡顿检测）
      const nextTime = media.currentTime + this.seconds;
      media.currentTime = Math.max(0, Math.min(media.duration || Infinity, nextTime));
    });
  }

  render() {
    const back = this.seconds < 0;
    return `<xg-icon class="ng-seek" aria-label="${back ? '快退' : '快进'} 10 秒">
      <div class="xgplayer-icon"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"${back ? '' : ' style="transform:scaleX(-1)"'}>
        <path fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" d="M5.6 8.2A8 8 0 1 1 4 12"/><path fill="#fff" d="M4.2 3.8 5.8 9l5-1.9z"/>
      </svg><span class="ng-seek-n">10</span></div>
    </xg-icon>`;
  }
}

export class BackTenButton extends SeekButton {
  static get pluginName() {
    return 'ngBack10';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.CONTROLS_LEFT, index: 1 };
  }

  get seconds() {
    return -10;
  }
}

export class ForwardTenButton extends SeekButton {
  static get pluginName() {
    return 'ngForward10';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.CONTROLS_LEFT, index: 3 };
  }

  get seconds() {
    return 10;
  }
}

export class NextButton extends ActionButton {
  static get pluginName() {
    return 'ngNext';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.CONTROLS_LEFT, index: 4, onClick: null as (() => void) | null };
  }

  render() {
    return `<xg-icon class="ng-next" aria-label="下一集">
      <div class="xgplayer-icon"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#fff" d="M6 5.5v13l9.5-6.5zM16.5 5.5h2.2v13h-2.2z"/></svg></div>
      <div class="xg-tips">下一集</div>
    </xg-icon>`;
  }
}

export class SourcesButton extends ActionButton {
  static get pluginName() {
    return 'ngSources';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.CONTROLS_RIGHT, index: 1, onClick: null as (() => void) | null };
  }

  render() {
    return `<xg-icon class="ng-sources" aria-label="切换线路"><div class="xgplayer-icon btn-text"><span class="icon-text">线路</span></div></xg-icon>`;
  }
}

export class EpisodesButton extends ActionButton {
  static get pluginName() {
    return 'ngEpisodes';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.CONTROLS_RIGHT, index: 2, onClick: null as (() => void) | null };
  }

  render() {
    return `<xg-icon class="ng-episodes"><div class="xgplayer-icon btn-text"><span class="icon-text">选集</span></div></xg-icon>`;
  }
}

export class TitleBar extends Plugin {
  static get pluginName() {
    return 'ngTitle';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.ROOT_TOP, index: 1 };
  }

  private clock = 0;

  afterCreate() {
    const tick = () => {
      const el = this.find('.ng-clock');
      if (el) el.textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    tick();
    this.clock = window.setInterval(tick, 5_000);
  }

  setTitle(text: string) {
    const el = this.find('.ng-title');
    if (el) el.textContent = text;
  }

  destroy() {
    window.clearInterval(this.clock);
  }

  render() {
    return `<div class="ng-top"><span class="ng-title"></span><span class="ng-clock"></span></div>`;
  }
}

/**
 * 屏幕自适应全屏模式调度：
 * - iPhone/iPod: 使用网页旋转全屏 (rotateFullscreen: true) 并在横竖屏时进行 CSS 校准，提供系统原生沉浸体验
 * - 安卓手机: 使用全屏屏幕方向锁定并横向旋转
 * - 平板与电脑: 使用操作系统标准全屏
 */
export function fullscreenMode() {
  if (typeof navigator === 'undefined') return {};
  const ua = navigator.userAgent;
  if (/iPhone|iPod/.test(ua)) return { rotateFullscreen: true, needBackIcon: true };
  if (/Android/.test(ua) && /Mobile/.test(ua)) return { useScreenOrientation: true, lockOrientationType: 'landscape', needBackIcon: true };
  return {};
}

const LOCK_OPEN = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 6.8-1.2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15.5" r="1.4" fill="#fff"/></svg>`;
const LOCK_CLOSED = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="#fff"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="15.5" r="1.4" fill="#141416"/></svg>`;

export class LockButton extends Plugin {
  static get pluginName() {
    return 'ngLock';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.ROOT, index: 0 };
  }

  private locked = false;

  afterCreate() {
    this.bind(tap(), (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.setLocked(!this.locked);
      this.player.focus();
    });

    this.player.getPlugin('mobile')?.useHooks('videoDbClick', () => !this.locked);
    this.on(Events.FULLSCREEN_CHANGE, (full: boolean) => {
      if (!full) this.setLocked(false);
    });
  }

  setLocked(locked: boolean) {
    this.locked = locked;
    this.player.root?.classList.toggle('ng-locked', locked);
    const mobile = this.player.getPlugin('mobile');
    if (mobile) {
      mobile.config.disableGesture = locked;
      mobile.config.disablePress = locked;
    }
    const icon = this.find('.xgplayer-icon');
    if (icon) icon.innerHTML = locked ? LOCK_CLOSED : LOCK_OPEN;
    this.root?.setAttribute('aria-label', locked ? '解锁屏幕' : '锁定屏幕');
  }

  render() {
    return `<xg-icon class="ng-lock" aria-label="锁定屏幕"><div class="xgplayer-icon">${LOCK_OPEN}</div></xg-icon>`;
  }
}

type AirPlayVideo = HTMLVideoElement & {
  webkitShowPlaybackTargetPicker?: () => void;
  webkitCurrentPlaybackTargetIsWireless?: boolean;
};

export class CastButton extends Plugin {
  static get pluginName() {
    return 'ngCast';
  }

  static get defaultConfig() {
    return { position: Plugin.POSITIONS.ROOT_TOP, index: 2 };
  }

  private stop: (() => void) | null = null;

  afterCreate() {
    const media = this.player.media as AirPlayVideo;
    if (!media) return;
    media.setAttribute('x-webkit-airplay', 'allow');
    this.hide();

    const onAvailability = (e: Event) => {
      if ((e as Event & { availability?: string }).availability === 'available') this.show();
      else this.hide();
    };

    media.addEventListener('webkitplaybacktargetavailabilitychanged', onAvailability);
    this.stop = () => media.removeEventListener('webkitplaybacktargetavailabilitychanged', onAvailability);

    this.bind(tap(), (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      media.webkitShowPlaybackTargetPicker?.();
    });
  }

  destroy() {
    this.stop?.();
  }

  render() {
    return `<xg-icon class="ng-cast" aria-label="投屏">
      <div class="xgplayer-icon"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="12" rx="2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M8 20h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><text x="12" y="13.6" text-anchor="middle" font-size="7" font-weight="700" fill="#fff" font-family="sans-serif">TV</text></svg></div>
    </xg-icon>`;
  }
}

export function detectIsMobileClient(): boolean {
  if (typeof window === 'undefined') return false;
  if (checkIsIPadOS()) return true;
  const isCoarse = window.matchMedia?.('(pointer: coarse)').matches;
  const hasTouch = 'ontouchstart' in window;
  const isMobileUa = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return (isCoarse && hasTouch) || isMobileUa;
}

export function createPlayer(options: {
  el: HTMLElement;
  url: string;
  poster?: string;
  rate: number;
  rates: readonly number[];
  hlsOptions: HlsConfigOptions;
  onFatal: (details: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onEpisodes: () => void;
  onSources?: () => void;
}): SimplePlayer {
  const isMobile = detectIsMobileClient();
  const accent = '#E50914';

  return new SimplePlayer({
    el: options.el,
    url: options.url,
    poster: options.poster || undefined,
    lang: 'zh-cn',
    i18n: [langZhCn],
    width: '100%',
    height: '100%',
    videoInit: true,
    autoplay: false,
    playsinline: true,
    defaultPlaybackRate: options.rate,
    playbackRate: [...options.rates].reverse(),
    commonStyle: { playedColor: accent, volumeColor: accent, sliderBtnStyle: { background: accent } },
    plugins: [
      HlsSource,
      Progress,
      MiniProgress,
      Time,
      PrevButton,
      BackTenButton,
      PlayIcon,
      ForwardTenButton,
      NextButton,
      SourcesButton,
      EpisodesButton,
      TitleBar,
      CastButton,
      PlaybackRate,
      Fullscreen,
      Poster,
      Start,
      Loading,
      Enter,
      ...(isMobile ? [MobilePlugin, LockButton] : [Volume, PIP, Keyboard, PCPlugin, CssFullScreen]),
    ],
    play: { index: 2 },
    time: { index: 5 },
    fullscreen: fullscreenMode(),
    pip: { showIcon: true },
    keyboard: { seekStep: 10, keyCodeMap: { right: { disable: true } } },
    mobile: { disablePress: false, pressRate: 2 },
    ngSource: { hlsOptions: options.hlsOptions, onFatal: options.onFatal },
    ngPrev: { onClick: options.onPrev },
    ngNext: { onClick: options.onNext },
    ngEpisodes: { onClick: options.onEpisodes },
    ngSources: { onClick: options.onSources },
  });
}
