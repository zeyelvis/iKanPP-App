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
    <div className="relative flex flex-col gap-4">
      {/* 操作按钮栏 */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-4" id="main-play-cta">
        {/* 核心主按钮：立即播放 / 继续观看 (移动端 100% 满宽霸气展现) */}
        <button
          onClick={() => handlePlay(lastEpisode)}
          disabled={isPending}
          id="btn-netflix-play"
          className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-9 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-black font-black text-base sm:text-lg shadow-xl shadow-white/10 hover:bg-white/90 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-wait shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-black" />
              <span>正在进入影院...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black text-black group-hover:scale-110 transition-transform" />
              <span>
                {hasHistory && entity.type === 'tv'
                  ? `继续观看 第 ${lastEpisode} 集`
                  : '立即播放'}
              </span>
            </>
          )}

          {/* 历史进度红条 */}
          {hasHistory && historyPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl sm:rounded-b-2xl overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${historyPercent}%` }}
              />
            </div>
          )}
        </button>

        {/* 辅助操作栏：在移动端 3 等分平铺，在桌面端紧随其后 */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* 追剧清单按钮 */}
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-4 px-3 sm:px-5 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-base backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isFav
                ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
                : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
            }`}
            title={isFav ? '已在追剧清单中' : '加入追剧清单'}
          >
            {isFav ? (
              <>
                <Check className="w-4 h-4 text-red-400" />
                <span>已追剧</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>追剧</span>
              </>
            )}
          </button>

          {/* 分享按钮 */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md transition-all duration-200 cursor-pointer text-xs sm:text-base font-bold"
            title="分享此影视"
            aria-label="分享"
          >
            <Share2 className="w-4 h-4" />
            <span className="sm:hidden">分享</span>
          </button>

          {/* 值得看/点赞推荐按钮 */}
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl border backdrop-blur-md transition-all duration-200 cursor-pointer text-xs sm:text-base font-bold ${
              isLiked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
            }`}
            title="给该片点赞推荐"
            aria-label="点赞"
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-amber-400' : ''}`} />
            <span className="sm:hidden">{isLiked ? '已赞' : '推荐'}</span>
          </button>
        </div>
      </div>

      {/* 极速纯直连提示 */}
      <div className="flex items-center gap-2 text-xs text-white/40 pl-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
        <span>浏览器纯直连第三方 CDN · 零等待秒播 · 海外华人免翻墙</span>
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
