'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Plus, Check, Share2, ThumbsUp, Loader2, Sparkles } from 'lucide-react';
import { useFavoritesStore } from '@/lib/store/favorites-store';
import { useHistoryStore } from '@/lib/store/history-store';
import { TitleEntity } from '@/lib/types/entity';

interface TitleActionsBarProps {
  entity: TitleEntity;
}

export function TitleActionsBar({ entity }: TitleActionsBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // 联动收藏/追剧 store
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [isFav, setIsFav] = useState(false);

  // 联动播放历史 store
  const { viewingHistory } = useHistoryStore();
  const [lastEpisode, setLastEpisode] = useState<number>(1);
  const [hasHistory, setHasHistory] = useState(false);
  const [historyPercent, setHistoryPercent] = useState<number>(0);

  useEffect(() => {
    // 检查收藏状态 (以 entityId 作为 videoId)
    setIsFav(isFavorite(entity.entityId, 'ikanpp'));

    // 检查历史观看进度 (以 title 模糊匹配)
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === entity.title.trim().toLowerCase()
    );
    if (historyItem) {
      setHasHistory(true);
      const ep = (historyItem.episodeIndex ?? 0) + 1;
      setLastEpisode(ep);
      if (historyItem.duration && historyItem.duration > 0) {
        const pct = Math.min(100, Math.round((historyItem.playbackPosition / historyItem.duration) * 100));
        setHistoryPercent(pct);
      }
    }
  }, [entity.entityId, entity.title, isFavorite, viewingHistory]);

  const handlePlay = (ep: number = lastEpisode) => {
    startTransition(() => {
      const params = new URLSearchParams({
        entity: entity.entityId,
        title: entity.title,
        type: entity.type === 'tv' ? 'tv' : 'movie',
        episode: String(ep),
      });
      router.push(`/player?${params.toString()}`);
    });
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(entity.entityId, 'ikanpp');
      setIsFav(false);
      showToast('已从追剧清单中移除');
    } else {
      addFavorite({
        videoId: entity.entityId,
        title: entity.title,
        source: 'ikanpp',
        poster: entity.cover,
        type: entity.genres?.[0] || (entity.type === 'tv' ? '电视剧' : '电影'),
        year: entity.year,
      });
      setIsFav(true);
      showToast('已加入追剧清单');
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `我在 iKanPP 免费观看《${entity.title}》(${entity.year}) 高清全集，海外免翻墙极速播放：${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: entity.title,
          text: shareText,
          url,
        });
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(shareText);
      showToast('✅ 影视分享链接已复制到剪贴板！');
    } catch {
      showToast('复制链接失败，请手动复制地址栏网址');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    showToast(!isLiked ? '❤️ 感谢您的好评推荐！' : '已取消点赞');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="relative flex flex-col gap-3 sm:gap-4 w-full md:items-start" id="main-play-cta">
      {/* 1. 移动端专属布局 (仅在小于 md 视口渲染)：Netflix 级 100% 全宽播放条 + 横向均分轻盈操作列 */}
      <div className="w-full md:hidden">
        <div className="flex flex-col gap-2.5 w-full">
          {/* 主播放按钮：100% 满宽横跨、高亮利落小圆角、黑底白字 Netflix 质感 */}
          <button
            onClick={() => handlePlay(lastEpisode)}
            disabled={isPending}
            id="btn-netflix-play"
            className="group relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white hover:bg-white/95 text-black font-extrabold text-base shadow-lg shadow-white/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span>正在进入影院...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black text-black" />
                <span>
                  {hasHistory && entity.type === 'tv'
                    ? `继续观看 第 ${lastEpisode} 集`
                    : '播放'}
                </span>
              </>
            )}

            {hasHistory && historyPercent > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${historyPercent}%` }}
                />
              </div>
            )}
          </button>

          {/* Netflix 标配轻盈无框垂直图标列 (上图标 + 下微文字)，全宽横向平分舒展 */}
          <div className="flex items-center justify-around w-full py-1.5 px-2 border-b border-white/5 pb-2.5">
            <button
              onClick={handleToggleFavorite}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer py-1"
            >
              {isFav ? (
                <Check className="w-5 h-5 text-red-500" />
              ) : (
                <Plus className="w-5 h-5 text-white/90" />
              )}
              <span className={`text-[11px] font-medium ${isFav ? 'text-red-400' : 'text-white/65'}`}>
                {isFav ? '已在追剧' : '追剧清单'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer py-1"
            >
              <Share2 className="w-5 h-5 text-white/90" />
              <span className="text-[11px] font-medium text-white/65">分享好友</span>
            </button>

            <button
              onClick={handleLike}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer py-1"
            >
              <ThumbsUp
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'fill-amber-400 text-amber-400' : 'text-white/90'
                }`}
              />
              <span className={`text-[11px] font-medium ${isLiked ? 'text-amber-400' : 'text-white/65'}`}>
                {isLiked ? '已赞推荐' : '点赞推荐'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 桌面电脑端专属布局 (仅在大于等于 md 视口渲染)：单行一字排开的 Netflix 尊享控制台 */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 lg:gap-4 flex-nowrap">
        {/* 立即播放大按钮 */}
        <button
          onClick={() => handlePlay(lastEpisode)}
          disabled={isPending}
          id="btn-netflix-play-desktop"
          className="group relative flex items-center justify-center gap-3 px-8 lg:px-10 py-3.5 lg:py-4 rounded-2xl bg-white hover:bg-white/90 text-black font-black text-base lg:text-lg shadow-2xl shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin text-black" />
              <span>正在进入影院...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-black text-black group-hover:scale-110 transition-transform" />
              <span>
                {hasHistory && entity.type === 'tv'
                  ? `继续观看 第 ${lastEpisode} 集`
                  : '立即播放'}
              </span>
            </>
          )}

          {hasHistory && historyPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-2xl overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${historyPercent}%` }}
              />
            </div>
          )}
        </button>

        {/* 追剧清单 */}
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center gap-2 px-5 lg:px-6 py-3.5 lg:py-4 rounded-2xl border font-bold text-sm lg:text-base backdrop-blur-md transition-all duration-200 cursor-pointer shrink-0 hover:scale-[1.02] ${
            isFav
              ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
              : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
          }`}
        >
          {isFav ? (
            <>
              <Check className="w-5 h-5 text-red-400" />
              <span>已在追剧清单</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>追剧清单</span>
            </>
          )}
        </button>

        {/* 分享 */}
        <button
          onClick={handleShare}
          className="p-3.5 lg:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md transition-all duration-200 cursor-pointer shrink-0 hover:scale-[1.02]"
          title="分享此影视"
          aria-label="分享"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* 推荐点赞 */}
        <button
          onClick={handleLike}
          className={`p-3.5 lg:p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 cursor-pointer shrink-0 hover:scale-[1.02] ${
            isLiked
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
              : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
          }`}
          title="给该片点赞推荐"
          aria-label="点赞"
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-amber-400' : ''}`} />
        </button>
        </div>
      </div>

      {/* 极速纯直连提示 */}
      <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] sm:text-xs text-white/45 w-full pl-0.5 text-center md:text-left">
        <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
        <span>浏览器纯直连第三方 CDN · 零等待秒播 · 海外免翻墙</span>
      </div>

      {/* Toast 动效提示 */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-xl border border-white/20 text-white text-sm font-medium shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
