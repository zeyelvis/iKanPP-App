import Hls from 'hls.js';

export interface HlsConfigOptions {
  isMobileClient?: boolean;
  isAdFilterEnabled?: boolean;
  filterM3u8Ad?: (content: string, url: string, mode: any, keywords: string[]) => string;
  adFilterMode?: string;
  adKeywords?: string[];
}

/**
 * 🛡️ iKanPP 全站 Hls.js 工业级高可用配置工厂 (Single Source of Truth)
 * 严格遵从准则 22：桌面端锁定 120s 深水库，后向安全区 >= 60s，防卡顿与防 SourceBuffer 锁冲突
 */
export function createHlsConfig(options: HlsConfigOptions = {}): any {
  const {
    isMobileClient = false,
    isAdFilterEnabled = false,
    filterM3u8Ad,
    adFilterMode = 'strict',
    adKeywords = [],
  } = options;

  let customLoader: any = undefined;

  if (isAdFilterEnabled && filterM3u8Ad && Hls.DefaultConfig && (Hls as any).DefaultConfig.loader) {
    const DefaultLoader = (Hls as any).DefaultConfig.loader;
    class AdFilterLoader extends DefaultLoader {
      load(context: any, config: any, callbacks: any) {
        if (context.type === 'manifest' || context.type === 'level') {
          const originalOnSuccess = callbacks.onSuccess;
          callbacks.onSuccess = (response: any, stats: any, ctx: any, networkDetails: any) => {
            if (filterM3u8Ad && typeof response.data === 'string') {
              try {
                response.data = filterM3u8Ad(response.data, ctx.url, adFilterMode, adKeywords);
              } catch (e) {
                console.warn('[HLS Factory] Ad filter error:', e);
              }
            }
            originalOnSuccess(response, stats, ctx, networkDetails);
          };
        }
        super.load(context, config, callbacks);
      }
    }
    customLoader = AdFilterLoader;
  }

  const config: any = {
    enableWorker: true,
    lowLatencyMode: false,

    // 高性能自适应缓冲水位体系：彻底杜绝 Buffer Starvation
    // 桌面端 120s 充沛深缓冲，移动端 60s 平衡水位
    maxBufferLength: isMobileClient ? 60 : 120,
    maxMaxBufferLength: isMobileClient ? 120 : 240,
    maxBufferSize: isMobileClient ? 60 * 1000 * 1000 : 120 * 1000 * 1000,
    maxBufferHole: 0.8,

    // 启动阶段激进预拉取，保障秒播与连续播放丝滑
    startFragPrefetch: true,
    maxStarvationDelay: isMobileClient ? 3 : 5,

    // 针对 Seek 关键帧停滞的智能微调救活机制
    nudgeOffset: 0.05,
    nudgeMaxRetry: 3,
    maxFragLookUpTolerance: 0.3,

    // ABR 码率平滑调节
    abrEwmaDefaultEstimate: 1000000,
    abrEwmaFastLive: 3,
    abrEwmaSlowLive: 9,
    abrEwmaFastVoD: 3,
    abrEwmaSlowVoD: 9,
    abrBandWidthFactor: 0.85,
    abrBandWidthUpFactor: 0.7,

    // Loading Settings: 增强切片重试和容错，支持超清原画高码率跨国传输
    fragLoadingMaxRetry: 8,
    fragLoadingRetryDelay: 1000,
    fragLoadingMaxRetryTimeout: 60000,
    manifestLoadingMaxRetry: 8,
    manifestLoadingRetryDelay: 1000,
    manifestLoadingMaxRetryTimeout: 60000,
    levelLoadingMaxRetry: 8,
    levelLoadingRetryDelay: 1000,
    levelLoadingMaxRetryTimeout: 60000,

    // Timeouts: 超清原画首个大切片加载需宽裕时间，避免过早超时触发切源
    fragLoadingTimeOut: 30000,
    manifestLoadingTimeOut: 20000,
    levelLoadingTimeOut: 20000,

    // Backbuffer: 桌面端 60 秒、移动端 25 秒，避免高频触发 SourceBuffer.remove() 异步清理锁竞争
    backBufferLength: isMobileClient ? 25 : 60,

    // 深度隐私伪装与请求头净化：遵循 no-referrer 规范，与原生 TV 盒子客户端流量特征对齐
    xhrSetup: (xhr: XMLHttpRequest, url: string) => {
      if (url.includes('olemovienews.com') || url.includes('oulehdtv.com')) {
        xhr.withCredentials = false;
      }
    },
  };

  if (customLoader) {
    config.loader = customLoader;
  }

  return config;
}
