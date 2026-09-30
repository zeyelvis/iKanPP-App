'use client';

import { useState, useEffect } from 'react';
import { Play, Plus, Check, Share2, ThumbsUp, Sparkles, BellRing } from 'lucide-react';
import { useFavoritesStore } from '@/lib/store/favorites-store';
import { startWatching } from '@/lib/client/watch-fragment';
import { useTitleHistory } from '@/lib/store/title-history';
import { TitleEntity } from '@/lib/types/entity';
import { getEpisodeDisplayInfo } from '@/lib/utils/episode-resolver';
import { fetchTitleProbe, subscribeTitleProbe } from '@/lib/utils/title-probe';
import { ClassicDemandModal } from './ClassicDemandModal';
import { AiViralShareModal } from '@/components/share/AiViralShareModal';

interface TitleActionsBarProps {
  entity: TitleEntity;
  playTitle?: string;
  relatedTitles?: Array<{
    entityId: string;
    slug: string;
    title: string;
    cover: string;
    year?: string;
    rate?: string;
  }>;
}

export function TitleActionsBar({ entity, playTitle, relatedTitles = [] }: TitleActionsBarProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isClassicNoSource, setIsClassicNoSource] = useState(false);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 联动收藏/追剧 store
  const { addFavorite, removeFavorite } = useFavoritesStore();
  // 以 entityId 作为 videoId；水合时按服务端快照（未收藏）渲染，随后更新
  const isFav = useFavoritesStore((s) => s.isFavorite(entity.entityId, 'ikanpp'));

  const effectiveTitle = playTitle || entity.title;

  // 联动播放历史：只订阅本片（播放器每 5 秒保存进度，铁律 22）
  const historyItem = useTitleHistory([effectiveTitle, entity.title]);
  const hasHistory = !!historyItem;
  const lastEpisodeInfo = historyItem ? getEpisodeDisplayInfo(historyItem.episodes, historyItem.episodeIndex) : null;
  const historyPercent =
    historyItem && historyItem.duration > 0 ? Math.min(100, Math.round((historyItem.playbackPosition / historyItem.duration) * 100)) : 0;

  useEffect(() => {
    // 后台探测是否有片源：全网无源时播放按钮改为求片
    fetchTitleProbe(effectiveTitle, entity.type, entity.year);
    const unsubscribe = subscribeTitleProbe(effectiveTitle, (res) => {
      if (res && res.id && res.source) {
        setIsClassicNoSource(false);
      } else if (res && res.success === false) {
        // 探测完成确认全网 0 源
        setIsClassicNoSource(true);
      }
    }, entity.type, entity.year);
    return () => unsubscribe();
  }, [effectiveTitle, entity.type, entity.year]);

  // Plays in the page's player (WatchStage), from where the viewer left off; it picks the line.
  const handlePlay = () => {
    if (isClassicNoSource) {
      setIsDemandModalOpen(true);
      return;
    }
    startWatching(lastEpisodeInfo ? { ep: lastEpisodeInfo.paramValue, season: lastEpisodeInfo.seasonNumber ?? null } : {});
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(entity.entityId, 'ikanpp');
      showToast('已从追剧清单中移除');
    } else {
      addFavorite({
        videoId: entity.entityId,
        title: effectiveTitle,
        source: 'ikanpp',
        poster: entity.cover,
        type: entity.genres?.[0] || (entity.type === 'tv' ? '电视剧' : '电影'),
        year: entity.year,
      });
      showToast('已加入追剧清单');
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
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
          {/* 主播放按钮：100% 满宽横跨、高亮利落小圆角 */}
          <button
            onClick={handlePlay}
            id="btn-netflix-play"
            className={`group relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-base shadow-lg transition-all cursor-pointer disabled:opacity-75 ${
              isClassicNoSource
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white hover:bg-white/95 text-black shadow-white/10 active:scale-[0.98]'
            }`}
          >
            {isClassicNoSource ? (
              <>
                <BellRing className="w-5 h-5 text-amber-400" />
                <span>经典馆藏 · 预约求片</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black text-black" />
                <span>
                  {lastEpisodeInfo && entity.type === 'tv'
                    ? `继续观看 ${lastEpisodeInfo.label}`
                    : '播放'}
                </span>
              </>
            )}

            {hasHistory && historyPercent > 0 && !isClassicNoSource && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${historyPercent}%` }}
                />
              </div>
            )}
          </button>

          {/* Netflix 标配轻盈无框垂直图标列 */}
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
              className="flex-1 flex flex-col items-center justify-center gap-1 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer py-1 group"
            >
              <Share2 className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-red-400">✨ 安利好友</span>
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
          onClick={handlePlay}
          id="btn-netflix-play-desktop"
          className={`group relative flex items-center justify-center gap-3 px-8 lg:px-10 py-3.5 lg:py-4 rounded-2xl font-black text-base lg:text-lg shadow-2xl transition-all duration-200 cursor-pointer disabled:opacity-75 shrink-0 ${
            isClassicNoSource
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-amber-950/30'
              : 'bg-white hover:bg-white/90 text-black shadow-white/20 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isClassicNoSource ? (
            <>
              <BellRing className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>经典馆藏 · 预约求片</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-black text-black group-hover:scale-110 transition-transform" />
              <span>
                {lastEpisodeInfo && entity.type === 'tv'
                  ? `继续观看 ${lastEpisodeInfo.label}`
                  : '立即播放'}
              </span>
            </>
          )}

          {hasHistory && historyPercent > 0 && !isClassicNoSource && (
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

        {/* 社交裂变推荐分享 */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 lg:px-6 py-3.5 lg:py-4 rounded-2xl border border-red-500/40 bg-red-600/15 hover:bg-red-600/25 text-red-300 hover:text-white font-bold text-sm lg:text-base transition-all duration-200 cursor-pointer shrink-0 hover:scale-[1.02] shadow-lg shadow-red-950/20 active:scale-[0.98]"
          title="生成电影拍立得海报与小红书爆款文案"
        >
          <Share2 className="w-5 h-5 text-red-400" />
          <span>✨ 推荐给好友</span>
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

      {/* 状态微文案 */}
      {isClassicNoSource ? (
        <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] sm:text-xs text-amber-400/90 w-full pl-0.5 text-center md:text-left font-medium">
          <span>🏛️</span>
          <span>{entity.year ? `${entity.year}年` : ''}历史经典馆藏 · 公网切片源暂未收录 · 支持一键求片</span>
        </div>
      ) : (
        <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] sm:text-xs text-white/45 w-full pl-0.5 text-center md:text-left">
          <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>浏览器纯直连第三方 CDN · 零等待秒播 · 海外免翻墙</span>
        </div>
      )}

      {/* 弹窗：经典求片与同类推荐 */}
      <ClassicDemandModal
        isOpen={isDemandModalOpen}
        onClose={() => setIsDemandModalOpen(false)}
        entity={entity}
        relatedTitles={relatedTitles}
      />

      {/* 弹窗：AI 社交裂变与固定分享中枢 */}
      <AiViralShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        entity={entity}
      />

      {/* Toast 动效提示 */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-xl border border-white/20 text-white text-sm font-medium shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
