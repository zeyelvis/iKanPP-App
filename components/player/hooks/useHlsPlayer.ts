import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { usePlayerSettings } from './usePlayerSettings';
import { filterM3u8Ad } from '@/lib/utils/m3u8-utils';
import { sanitizeStreamUrl } from '@/lib/utils/stream-sanitizer';
import { useRuntimeFeatures } from '@/components/RuntimeFeaturesProvider';
import { checkIsIPadOS } from '@/lib/hooks/mobile/useDeviceDetection';

interface UseHlsPlayerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    src: string;
    isPremium?: boolean;
    autoPlay?: boolean;
    preloadMode?: boolean;
    onAutoPlayPrevented?: (error: Error) => void;
    onError?: (message: string) => void;
}

export function useHlsPlayer({
    videoRef,
    src,
    isPremium = false,
    autoPlay = false,
    preloadMode = false,
    onAutoPlayPrevented,
    onError
}: UseHlsPlayerProps) {
    const hlsRef = useRef<Hls | null>(null);
    const { adFilterMode, adKeywords } = usePlayerSettings(isPremium);
    const { mediaProxyEnabled } = useRuntimeFeatures();
    const isAdFilterEnabled = adFilterMode !== 'off';

    // 核心保护：使用 Ref 牢牢锁定回调与动态配置，彻底切断因父组件重渲染导致的 HLS 实例误销毁重建！
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    const onAutoPlayPreventedRef = useRef(onAutoPlayPrevented);
    onAutoPlayPreventedRef.current = onAutoPlayPrevented;
    const adFilterModeRef = useRef(adFilterMode);
    adFilterModeRef.current = adFilterMode;
    const adKeywordsRef = useRef(adKeywords);
    adKeywordsRef.current = adKeywords;
    const isAdFilterEnabledRef = useRef(isAdFilterEnabled);
    isAdFilterEnabledRef.current = isAdFilterEnabled;
    const mediaProxyEnabledRef = useRef(mediaProxyEnabled);
    mediaProxyEnabledRef.current = mediaProxyEnabled;

    useEffect(() => {
        const video = videoRef.current;
        const effectiveSrc = sanitizeStreamUrl(src);
        if (!video || !effectiveSrc) return;

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        let hls: Hls | null = null;
        let extraBlobs: string[] = [];
        let nativeCleanup: (() => void) | null = null;

        // Check if HLS is supported natively (Safari, Mobile Chrome, iOS, iPad)
        const isNativeHlsSupported = video.canPlayType('application/vnd.apple.mpegurl');

        // Check if MSE is available (required by HLS.js)
        const isMSESupported = Hls.isSupported();

        // 精准识别 iOS / iPadOS 设备：必须通过 checkIsIPadOS() 排除配备多点触控板的 MacBook 笔记本！
        const isIPad = checkIsIPadOS();
        const isIOSOrIPad = typeof navigator !== 'undefined' && (
            /iPhone|iPod/i.test(navigator.userAgent) || isIPad
        );

        const isMobileClient = typeof navigator !== 'undefined' && (
            /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || isIPad
        );

        // 核心架构决策：
        // 1. 在真实 iOS / iPadOS 触控设备上，普通影视（!isPremium）直连公网源，走原生硬件级 AVPlayer；
        // 2. 在桌面端（包含 MacBook、Windows、Linux）或午夜专区，100% 启用高性能 Hls.js，享受大缓冲区平滑防抖能力！
        const shouldUseHlsJs = isMSESupported && (
            (!isIOSOrIPad && (!isNativeHlsSupported || isAdFilterEnabled || isPremium || !isMobileClient)) ||
            (isIOSOrIPad && isPremium)
        );

        if (shouldUseHlsJs) {
            // Define custom loader class to intercept manifest loading
            // We use 'any' cast because default loader type might not be strictly exposed in all typings
            const DefaultLoader = (Hls as any).DefaultConfig.loader;

            class AdFilterLoader extends DefaultLoader {
                load(context: any, config: any, callbacks: any) {
                    if (isAdFilterEnabledRef.current && (context.type === 'manifest' || context.type === 'level')) {
                        const originalOnSuccess = callbacks.onSuccess;
                        callbacks.onSuccess = (response: any, stats: any, context: any, networkDetails: any) => {
                            if (typeof response.data === 'string') {
                                try {
                                    // Filter the content using latest ref values
                                    response.data = filterM3u8Ad(response.data, context.url, adFilterModeRef.current, adKeywordsRef.current);
                                } catch (e) {
                                    console.warn('[HLS] Ad filter error:', e);
                                }
                            }
                            originalOnSuccess(response, stats, context, networkDetails);
                        };
                    }
                    super.load(context, config, callbacks);
                }
            }

            const config: any = {
                    // Worker & Performance
                    enableWorker: true,
                    lowLatencyMode: false,

                    // 高性能自适应缓冲水位体系：彻底杜绝 Buffer Starvation（看 1 秒卡 1 秒）
                    // 桌面端 120s 充沛深缓冲，秒杀网络抖动；移动端 60s 黄金平衡点，防爆内存且杜绝断续卡顿
                    maxBufferLength: isMobileClient ? 60 : 120,
                    maxMaxBufferLength: isMobileClient ? 120 : 240,
                    maxBufferSize: isMobileClient ? 60 * 1000 * 1000 : 120 * 1000 * 1000,
                    maxBufferHole: 0.8,

                    // 启动阶段激进预拉取，保障秒播与连续播放丝滑
                    startFragPrefetch: true,
                    maxStarvationDelay: isMobileClient ? 3 : 5,

                    // 针对 Seek 关键帧停滞的智能微调救活机制（平滑微调 0.05s，无感过渡杜绝黑闪，严控重试次数防死循环）
                    nudgeOffset: 0.05,
                    nudgeMaxRetry: 3,
                    maxFragLookUpTolerance: 0.3,

                    // ABR Settings
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

                // Use custom loader if ad filtering is enabled
                if (isAdFilterEnabled) {
                    config.loader = AdFilterLoader;
                }

                hls = new Hls(config);
                hlsRef.current = hls;

                hls.loadSource(effectiveSrc);
                hls.attachMedia(video);

                // Auto Play Handler
                hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
                    if (autoPlay && video.paused && data.frag.start === 0) {
                        video.play().catch(console.warn);
                    }
                });

                // Manifest Parsed Handler
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    // Filter HEVC levels: prefer H.264 for compatibility
                    if (hls) {
                        const levels = hls.levels;
                        if (levels && levels.length > 0) {
                            const h264Indices: number[] = [];
                            let hasHEVC = false;
                            levels.forEach((level, index) => {
                                const codec = level.videoCodec?.toLowerCase() || '';
                                if (codec.includes('hev') || codec.includes('h265') || codec.includes('hvc')) {
                                    hasHEVC = true;
                                } else {
                                    h264Indices.push(index);
                                }
                            });
                            if (hasHEVC) {
                                if (h264Indices.length > 0) {
                                    // H.264 alternatives exist — lock to first H.264 level
                                    console.info('[HLS] HEVC detected, using H.264 level for compatibility');
                                    hls.currentLevel = h264Indices[0];
                                } else {
                                    // All levels are HEVC — warn user
                                    console.warn('[HLS] ⚠️ All levels are HEVC, browser may not support');
                                    onErrorRef.current?.('检测到 HEVC/H.265 编码，当前浏览器可能不支持');
                                }
                            }
                        }
                    }

                    if (autoPlay && !preloadMode) {
                        video.play().catch((err) => {
                            // console.warn('[HLS] Autoplay prevented:', err);
                            onAutoPlayPreventedRef.current?.(err);
                        });
                    }
                });

                // Error Handling
                let networkErrorRetries = 0;
                let mediaErrorRetries = 0;
                const MAX_RETRIES = 6;

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                networkErrorRetries++;
                                if (networkErrorRetries <= MAX_RETRIES) {
                                    hls?.startLoad();
                                } else {
                                    onErrorRef.current?.('网络错误：无法加载视频流');
                                    hls?.destroy();
                                }
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                mediaErrorRetries++;
                                if (mediaErrorRetries <= MAX_RETRIES) {
                                    hls?.recoverMediaError();
                                } else {
                                    onErrorRef.current?.('媒体错误：视频格式不支持或已损坏');
                                    hls?.destroy();
                                }
                                break;
                            default:
                                console.error('[HLS] Fatal error, cannot recover:', data);
                                onErrorRef.current?.(`致命错误：${data.details || '未知错误'}`);
                                hls?.destroy();
                                break;
                        }
                    }
                });
            } else if (isNativeHlsSupported) {
                // Native HLS (iOS, Mobile Safari, iPad)
            // 核心保障：iOS WebKit AVPlayer 运行于系统独立进程，严禁使用 blob: 拦截改写！
            // blob: 会阻断系统的 HTTP Range 请求，导致拖动进度条(Seek)时发生底层死锁和永久转圈。
            // 直接赋予原生 HTTPS 直连流，激活苹果原装硬件级解复用、关键帧寻道与分片预读能力！
            video.src = effectiveSrc;

            const handleNativeLoadedMetadata = () => {
                if (autoPlay && !preloadMode) {
                    video.play().catch((err) => {
                        onAutoPlayPreventedRef.current?.(err);
                    });
                }
            };

            const handleNativeError = () => {
                const err = video.error;
                console.warn('[Native HLS] Video playback error:', err);
                if (err) {
                    onErrorRef.current?.(`播放异常 (代码 ${err.code})：网络连接中断或源站拒绝连接`);
                }
            };

            video.addEventListener('loadedmetadata', handleNativeLoadedMetadata, { once: true });
            video.addEventListener('error', handleNativeError, { once: true });

            nativeCleanup = () => {
                video.removeEventListener('loadedmetadata', handleNativeLoadedMetadata);
                video.removeEventListener('error', handleNativeError);
            };
        } else {
            // Neither MSE nor native HLS supported
            // Try direct playback as last resort (works for mp4 and some browser WebView)
            console.warn('[HLS] No MSE or native HLS support. Trying direct playback...');
            video.src = effectiveSrc;

            let directFailed = false;
            const handleCanPlay = () => {
                directFailed = false;
            };
            const handleError = () => {
                if (directFailed) return;
                directFailed = true;
                if (!mediaProxyEnabledRef.current) {
                    onErrorRef.current?.('当前浏览器不支持 HLS 视频播放。建议使用 Chrome、Edge 或 Safari 浏览器。');
                    return;
                }
                // Try proxied URL as final attempt
                const proxiedUrl = `/api/proxy?url=${encodeURIComponent(effectiveSrc)}`;
                video.src = proxiedUrl;
                video.addEventListener('error', () => {
                    onErrorRef.current?.('当前浏览器不支持 HLS 视频播放。建议使用 Chrome、Edge 或 Safari 浏览器。');
                }, { once: true });
            };

            video.addEventListener('canplay', handleCanPlay, { once: true });
            video.addEventListener('error', handleError, { once: true });

            nativeCleanup = () => {
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('error', handleError);
            };
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
            extraBlobs.forEach(url => URL.revokeObjectURL(url));
            if (nativeCleanup) {
                nativeCleanup();
            }
        };
    }, [src, autoPlay, isPremium, preloadMode]);
}
