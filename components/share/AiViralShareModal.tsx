'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  X,
  Film,
  RefreshCw,
  Share2,
  Download,
  Copy,
  Check,
  Send,
  MessageCircle,
  Twitter,
  Image as ImageIcon,
  Flame,
  Star,
  ExternalLink,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';

interface AiViralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity?: TitleEntity;
  // 兼顾播放器等独立调用的参数
  title?: string;
  poster?: string;
  year?: string;
  rate?: string;
  type?: string;
  genres?: string[];
  overview?: string;
  slug?: string;
}

// iKanPP 团队专业影视短评金句生成器（按题材多维度精选）
function getCuratedHookPitches(title: string, genres: string[] = [], description?: string, rate?: string): string[] {
  const list: string[] = [];
  const genreStr = genres.join(' ');
  const numRate = parseFloat(rate || '8.5');

  if (description && description.length > 12 && description.length < 55) {
    list.push(description.trim());
  }

  if (genreStr.includes('悬疑') || genreStr.includes('惊悚') || genreStr.includes('犯罪')) {
    list.push('全员恶人层层反转，不到最后一秒猜不透真相！');
    list.push('当倒数逼近终点，真正被审判的或许不是命运。');
    list.push('抽丝剥茧的高智商博弈，让人屏住呼吸的窒息快感！');
  } else if (genreStr.includes('喜剧')) {
    list.push('全程爆笑解压神作，承包你一整天的好心情！');
    list.push('笑中带泪的烟火人间，治愈所有不开心的宝藏电影。');
    list.push('金句频出的喜剧盛宴，放松下饭首选佳作！');
  } else if (genreStr.includes('科幻') || genreStr.includes('动作') || genreStr.includes('奇幻')) {
    list.push('大银幕级视听狂宴，全程高能无尿点！');
    list.push('想象力突破天际，震撼视效直击天灵盖！');
    list.push('酣畅淋漓的感官冲击，年度不可错过的视听盛宴。');
  } else if (genreStr.includes('爱情') || genreStr.includes('言情')) {
    list.push('一眼万年的宿命纠缠，今年最破防的情感盛宴。');
    list.push('在遗憾与炽热之间，写满了最动人的人间深情。');
    list.push('爱是想要触碰却收回的手，直击灵魂的纯粹浪漫。');
  } else if (genreStr.includes('古装') || genreStr.includes('武侠') || genreStr.includes('历史')) {
    list.push('江湖恩仇与权谋博弈，极致华丽的东方美学！');
    list.push('纵马长歌赴山海，快意恩仇方显英雄本色。');
    list.push('风起云涌的大时代史诗，每一个眼神皆是风云。');
  } else if (genreStr.includes('动画') || genreStr.includes('动漫')) {
    list.push('燃点泪点双重暴击，年度必看口碑封神之作！');
    list.push('献给每一个不曾妥协的赤子之心。');
  }

  if (numRate >= 8.5) {
    list.push(`豆瓣 ${numRate} 分封神力作，每一个镜头都值得细品！`);
  }

  list.push('精湛演技与扎实剧情，年度不可多得的高分口碑佳作！');
  list.push('值得二刷三刷的走心力作，诚意满满的年度惊喜。');

  return Array.from(new Set(list));
}

export function AiViralShareModal({
  isOpen,
  onClose,
  entity,
  title: fallbackTitle,
  poster: fallbackPoster,
  year: fallbackYear,
  rate: fallbackRate,
  type: fallbackType,
  genres: fallbackGenres,
  overview: fallbackOverview,
  slug: fallbackSlug,
}: AiViralShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'poster' | 'copy' | 'channel'>('poster');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [copySuccessIndex, setCopySuccessIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hookIndex, setHookIndex] = useState(0);

  // 实体属性归一化
  const effectiveTitle = entity?.title || fallbackTitle || '热门影视';
  const effectivePoster = entity?.cover || fallbackPoster || '';
  const effectiveYear = entity?.year || fallbackYear || '2026';
  const effectiveRate = entity?.rate || fallbackRate || '8.8';
  const effectiveGenres = entity?.genres || fallbackGenres || ['影视'];
  const effectiveType = entity?.type === 'tv' ? '电视剧' : entity?.type === 'movie' ? '电影' : fallbackType || '影视';
  const effectiveDescription = entity?.description || fallbackOverview || '';

  // 汇聚 iKanPP 官方精选短评候选池
  const candidateHooks = useMemo(() => {
    const list: string[] = [];
    if (entity?.aiContent?.hook) list.push(entity.aiContent.hook);
    if (entity?.aiContent?.highlights && Array.isArray(entity.aiContent.highlights)) {
      entity.aiContent.highlights.forEach((h) => {
        if (typeof h === 'string' && h.trim().length > 6) list.push(h.trim());
      });
    }
    const genrePitches = getCuratedHookPitches(effectiveTitle, effectiveGenres, effectiveDescription, effectiveRate);
    genrePitches.forEach((p) => {
      if (!list.includes(p)) list.push(p);
    });
    return list.length > 0 ? list : ['精湛演技与扎实剧情，年度不可多得的高分口碑佳作！'];
  }, [entity, effectiveTitle, effectiveGenres, effectiveDescription, effectiveRate]);

  const currentHook = candidateHooks[hookIndex % candidateHooks.length];

  // 权威规范 URL（带社交分享参数）
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const canonicalBase = entity?.canonicalSlug
        ? `${window.location.origin}/title/${entity.canonicalSlug}`
        : window.location.href.split('?')[0];
      setShareUrl(`${canonicalBase}?utm_source=ikanpp_share&utm_medium=card`);
    }
  }, [entity?.canonicalSlug]);

  // 打开时锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  // 生成二维码
  useEffect(() => {
    if (!isOpen || !shareUrl) return;
    QRCode.toDataURL(shareUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, [isOpen, shareUrl]);

  // 纯前端 Canvas 渲染 iKanPP 官方高颜值电影明信片海报
  useEffect(() => {
    if (!isOpen || !qrCodeUrl || activeTab !== 'poster') return;
    setIsGeneratingPoster(true);

    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 930;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. 绘制暗夜黑金明信片质感背景
    ctx.fillStyle = '#111115';
    ctx.fillRect(0, 0, width, height);

    // 顶部微妙红色微光渐变
    const grad = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, width);
    grad.addColorStop(0, 'rgba(220, 38, 38, 0.22)');
    grad.addColorStop(1, 'rgba(17, 17, 21, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, 400);

    // 2. 加载封面大图并绘制电影画幅 (主视觉)
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    const proxyCover = effectivePoster ? `/api/img-proxy?url=${encodeURIComponent(effectivePoster)}&w=780` : '';

    const drawRestOfCard = () => {
      // 3. 标签与评分栏 (居中偏上)
      const contentTop = 495;

      // 4K超清与类型胶囊
      ctx.fillStyle = '#E50914';
      ctx.beginPath();
      ctx.roundRect(40, contentTop, 68, 26, 6);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('4K 超清', 74, contentTop + 18);

      // 年份与题材
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${effectiveYear} · ${effectiveGenres.slice(0, 2).join(' / ')}`, 120, contentTop + 18);

      // 豆瓣评分金牌
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`★ ${effectiveRate} 分`, width - 40, contentTop + 18);

      // 4. 影视大标题 (支持长文本自适应折行)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      const maxTitleWidth = width - 80;
      let displayTitle = effectiveTitle;
      if (ctx.measureText(displayTitle).width > maxTitleWidth) {
        while (ctx.measureText(displayTitle + '...').width > maxTitleWidth && displayTitle.length > 0) {
          displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle += '...';
      }
      ctx.fillText(displayTitle, 40, contentTop + 62);

      // 5. iKanPP 团队精选短评框 (引言卡片背景)
      const quoteBoxY = contentTop + 85;
      const quoteBoxH = 88;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(40, quoteBoxY, width - 80, quoteBoxH, 14);
      ctx.fill();
      ctx.stroke();

      // 引言框顶部出处标语：iKanPP 团队精选看点
      ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🎬 iKanPP 团队精选微评', 56, quoteBoxY + 22);

      // 引号装饰
      ctx.fillStyle = '#E50914';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('“', 56, quoteBoxY + 48);

      // 短评文字排版
      ctx.fillStyle = '#F3F4F6';
      ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';

      const words = currentHook;
      let line1 = words;
      let line2 = '';
      if (ctx.measureText(words).width > width - 150) {
        const splitIdx = Math.floor(words.length / 2);
        line1 = words.slice(0, splitIdx);
        line2 = words.slice(splitIdx);
      }
      ctx.fillText(line1, 78, quoteBoxY + 46);
      if (line2) {
        ctx.fillText(line2, 78, quoteBoxY + 70);
      }

      // 6. 底部留白与扫码区域
      const bottomY = contentTop + 195;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(40, bottomY, width - 80, 1);

      // 加载并绘制二维码
      const qrImg = new window.Image();
      qrImg.onload = () => {
        const qrSize = 102;
        const qrX = width - 40 - qrSize;
        const qrY = bottomY + 16;

        // 二维码白底圆角衬底
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 10);
        ctx.fill();

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // 左侧文案引导
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('免翻墙 · 微信/手机扫码即看', 40, bottomY + 46);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('海外华人 4K 极速纯净流媒体平台', 40, bottomY + 72);

        ctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('iKanPP · 全网无删减全集秒播', 40, bottomY + 96);

        // 导出最终海报 DataURL
        try {
          const exportUrl = canvas.toDataURL('image/png');
          setPosterImageUrl(exportUrl);
        } catch (e) {
          console.error('Canvas export error:', e);
        } finally {
          setIsGeneratingPoster(false);
        }
      };
      qrImg.src = qrCodeUrl;
    };

    if (proxyCover) {
      img.onload = () => {
        // 在顶部绘制封面 (带圆角和暗角过渡)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 35, width - 80, 425, 20);
        ctx.clip();
        // 居中裁剪填充
        const targetW = width - 80;
        const targetH = 425;
        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;
        let sW = img.width;
        let sH = img.height;
        let sX = 0;
        let sY = 0;
        if (imgRatio > targetRatio) {
          sW = img.height * targetRatio;
          sX = (img.width - sW) / 2;
        } else {
          sH = img.width / targetRatio;
          sY = (img.height - sH) / 2;
        }
        ctx.drawImage(img, sX, sY, sW, sH, 40, 35, targetW, targetH);

        // 底部渐变羽化至深色背景
        const coverGrad = ctx.createLinearGradient(0, 300, 0, 460);
        coverGrad.addColorStop(0, 'rgba(17, 17, 21, 0)');
        coverGrad.addColorStop(1, '#111115');
        ctx.fillStyle = coverGrad;
        ctx.fillRect(40, 35, targetW, targetH);
        ctx.restore();

        drawRestOfCard();
      };
      img.onerror = () => {
        ctx.fillStyle = '#1A1A22';
        ctx.beginPath();
        ctx.roundRect(40, 35, width - 80, 425, 20);
        ctx.fill();
        drawRestOfCard();
      };
      img.src = proxyCover;
    } else {
      ctx.fillStyle = '#1A1A22';
      ctx.beginPath();
      ctx.roundRect(40, 35, width - 80, 425, 20);
      ctx.fill();
      drawRestOfCard();
    }
  }, [isOpen, qrCodeUrl, activeTab, effectivePoster, effectiveTitle, effectiveYear, effectiveGenres, effectiveRate, currentHook]);

  // 切换下一句精选看点
  const handleNextHook = () => {
    setHookIndex((prev) => prev + 1);
    showToast('✨ 已切换为下一句 iKanPP 团队精选看点');
  };

  // 下载海报图片
  const handleDownloadPoster = () => {
    if (!posterImageUrl) return;
    const a = document.createElement('a');
    a.href = posterImageUrl;
    a.download = `iKanPP_${effectiveTitle}_电影明信片.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('🎉 电影明信片海报已下载，快发朋友圈或小红书吧！');
  };

  // 复制海报图片到剪贴板
  const handleCopyPosterImage = async () => {
    if (!posterImageUrl) return;
    try {
      const res = await fetch(posterImageUrl);
      const blob = await res.blob();
      // @ts-ignore
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      showToast('✅ 海报已复制到剪贴板！可直接粘贴发送');
    } catch {
      handleDownloadPoster();
    }
  };

  // 复制文案处理（彻底消除任何 AI 营销字眼，全面树立 iKanPP 团队信誉）
  const copyTexts = [
    {
      id: 'xhs',
      name: '小红书 / 朋友圈推荐文案',
      badge: '🔥 种草首选',
      text: `姐妹们/家人们！终于被我挖到宝了😭！在海外想看《${effectiveTitle}》全网找遍到处要翻墙还要VIP，终于被我找到这个神仙网站！4K画质丝滑秒开，全程免翻墙零广告，一口气刷完全集太爽了！直达链接指路👉 ${shareUrl} #追剧打卡 #宝藏影视站 #海外看剧 #4K影视`,
    },
    {
      id: 'moviegoer',
      name: '影迷专属 / 豆瓣高分力荐文案',
      badge: '★ 官方精选',
      text: `年度封神预定！豆瓣评分 ${effectiveRate} 的《${effectiveTitle}》(${effectiveYear})，iKanPP 团队精选看点：“${currentHook}”。没看过的真的亏大！高清在线免翻墙直达：${shareUrl} （来自 iKanPP 纯净流媒体）`,
    },
    {
      id: 'minimal',
      name: '微信群 / Telegram 群极速直达文案',
      badge: '⚡ 群聊快捷',
      text: `🎬 推荐好片《${effectiveTitle}》4K超清全集在线直连（海外免翻墙/免会员）：${shareUrl}`,
    },
  ];

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccessIndex(index);
      showToast('✅ 精选文案已复制到剪贴板！');
      setTimeout(() => setCopySuccessIndex(null), 2500);
    });
  };

  // 全渠道一键直达
  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: effectiveTitle,
          text: `🎬 发现了一部超赞的${effectiveType}《${effectiveTitle}》！4K极速免翻墙秒播：`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyText(copyTexts[0].text, 0);
    }
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      `🎬 正在看《${effectiveTitle}》，4K极速直连秒播！`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(copyTexts[2].text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `推荐一部4K超清好片《${effectiveTitle}》，免翻墙秒播 #iKanPP`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-fade-in select-none">
      {/* 弹窗主体：纯色暗夜背景，严禁 backdrop-filter 避免显卡冲突 */}
      <div className="relative w-full max-w-lg bg-[#141419] border border-white/15 rounded-3xl p-4 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-white overflow-hidden max-h-[92vh]">
        {/* 背景氛围点缀微光 */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 顶部标题栏：确立 iKanPP 官方出品权威形象 */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <Film size={18} />
            </span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg tracking-wide text-white flex items-center gap-2">
                iKanPP 电影明信片
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/25 text-red-300 border border-red-500/30 font-medium">
                  团队精选
                </span>
              </h2>
              <p className="text-[11px] text-white/50">iKanPP 团队制作 · 专属电影海报与安利种草文案</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 大核心 Tab 切换栏 */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('poster')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'poster'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon size={15} />
            <span>拍立得海报</span>
          </button>

          <button
            onClick={() => setActiveTab('copy')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'copy'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame size={15} />
            <span>朋友圈文案</span>
          </button>

          <button
            onClick={() => setActiveTab('channel')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'channel'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Share2 size={15} />
            <span>社交直达</span>
          </button>
        </div>

        {/* Tab 1 内容：📸 电影拍立得海报卡片 */}
        {activeTab === 'poster' && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 p-2 flex items-center justify-center min-h-[300px]">
              {posterImageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={posterImageUrl}
                    alt={`${effectiveTitle} 电影明信片`}
                    className="max-h-[340px] sm:max-h-[380px] w-auto rounded-xl shadow-2xl border border-white/10 object-contain"
                  />
                  <div className="flex items-center justify-between w-full px-2 text-[11px] text-white/50 pt-1">
                    <span className="flex items-center gap-1">
                      <Smartphone size={12} />
                      长按图片直接存入手机相册
                    </span>

                    {/* 换一句看点按钮 */}
                    <button
                      onClick={handleNextHook}
                      disabled={isGeneratingPoster}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} className={isGeneratingPoster ? 'animate-spin' : ''} />
                      <span>换一句精选看点</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-white/50 text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                  <span>iKanPP 正在合成专属电影明信片...</span>
                </div>
              )}
            </div>

            {/* 海报操作栏 */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadPoster}
                disabled={!posterImageUrl}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-white/90 active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Download size={16} />
                <span>保存海报图片</span>
              </button>

              <button
                onClick={handleCopyPosterImage}
                disabled={!posterImageUrl}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Copy size={16} />
                <span className="hidden sm:inline">复制图片</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2 内容：📝 小红书 / 朋友圈爆款文案库 */}
        {activeTab === 'copy' && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            <p className="text-xs text-white/60">
              iKanPP 团队精选文案，直击免翻墙与 4K 秒播优势，点击即可复制：
            </p>

            <div className="flex flex-col gap-2.5">
              {copyTexts.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-medium">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5 select-all">
                    {item.text}
                  </p>

                  <button
                    onClick={() => handleCopyText(item.text, idx)}
                    className="self-end py-1.5 px-3 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copySuccessIndex === idx ? (
                      <>
                        <Check size={13} className="text-green-400" />
                        <span className="text-green-400">已复制！</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>一键复制此文案</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3 内容：🚀 全渠道一键直达 */}
        {activeTab === 'channel' && (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {/* 系统原生分享 */}
            <button
              onClick={handleShareNative}
              className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Smartphone size={18} />
              <span>呼起手机系统级分享 (微信/备忘录/隔空投送)</span>
            </button>

            {/* 社交媒体网格 */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white/60">一键分享到主流通讯与社交圈：</span>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={handleShareTelegram}
                  className="py-3 px-3 rounded-xl bg-[#2AABEE]/20 hover:bg-[#2AABEE]/30 border border-[#2AABEE]/40 text-[#2AABEE] text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send size={18} />
                  <span>Telegram</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="py-3 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Twitter size={18} />
                  <span>Twitter / X</span>
                </button>
              </div>
            </div>

            {/* 直达链接卡片 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-xs font-medium text-white/50">本片专属直达短链：</span>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                <span className="text-xs text-white/80 truncate flex-1 font-mono">{shareUrl}</span>
                <button
                  onClick={() => handleCopyText(shareUrl, 99)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
                  title="复制链接"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 底部 Toast 提示 */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 py-2 px-4 rounded-xl bg-black/90 border border-red-500/50 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce-short z-50">
            <CheckCircle2 size={15} className="text-red-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
