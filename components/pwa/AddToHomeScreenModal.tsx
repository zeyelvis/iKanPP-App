'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';
import {
  dismissPwaFor14Days,
  inAppBrowser,
  iosProfileAvailable,
  isIOSDevice,
  isMacSafari,
  isPwaDismissedIn14Days,
  isPwaStandalone,
  promptInstall,
  useInstallPath,
} from '@/lib/client/pwa-install';

/**
 * 装到桌面 (AddToHomeScreenModal)
 *
 * 规范契约（方案第 6 节）：
 * 1. 时机：用户看过第 2 集之后才主动弹出（播放器出第一帧时计数，ikanpp:show-pwa-modal-auto），
 *    且只在真能安装的地方弹：浏览器给出安装事件的一键安装，iPhone / iPad Safari 给步骤；
 * 2. 免打扰：点「以后再说」/关闭后 14 天内不再主动弹；装过或在桌面窗口里彻底静默；
 * 3. 从「我的」、导航栏手动打开（ikanpp:show-pwa-modal）时，按设备给出能用的方法；
 * 4. 微信、QQ 等 App 内置浏览器由全站 InAppBrowserBanner 提示；手动打开时卡片里说明先换浏览器；
 * 5. 卡片在底部导航上方，不盖住页面和播放器；严禁 backdrop-blur。
 */

/** Safari 的「共享」图标，让步骤指得准。 */
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden className="inline-block -translate-y-px align-middle">
      <path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18.5 10H17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const PERKS = ['全屏看剧，没有浏览器地址栏', '从桌面图标直接打开，不用再找网址'];

const CARD =
  'fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[1001] rounded-2xl bg-[#141416] border border-white/10 p-4 text-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 animate-fade-in';

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-2 rounded-xl bg-white/5 p-3 text-xs text-white/90 border border-white/10">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** iPhone / iPad：苹果不提供安装框，只能给步骤（对齐 iOS 26 新界面）。 */
function IosSteps() {
  return (
    <Steps
      items={[
        <>
          点 Safari 底部的「共享」<ShareIcon />
          <span className="text-white/50">（新版 iOS 先点右下角「···」）</span>
        </>,
        <>
          选「添加到主屏幕」，点「添加」<span className="text-white/50">（新版 iOS 在「查看更多」里）</span>
        </>,
        <>以后从桌面上的 iKanPP 图标打开</>,
      ]}
    />
  );
}

/** 浏览器不给安装框时（手动打开才会走到这里），按设备说明能用的方法。 */
function OtherWays() {
  if (isIOSDevice()) {
    return <p className="text-xs leading-relaxed text-white/80">iPhone / iPad 只有 Safari 能把网站装到桌面：请复制本页链接，用 Safari 打开后再点「共享」→「添加到主屏幕」。</p>;
  }
  if (isMacSafari()) {
    return <Steps items={['点菜单栏的「文件」', '选「添加到程序坞」', '以后从程序坞里的 iKanPP 打开']} />;
  }
  if (/Android/i.test(navigator.userAgent)) {
    return <Steps items={['打开浏览器菜单（右上角「⋮」或底部「≡」）', '选「添加到主屏幕」或「安装应用」', '以后从桌面上的 iKanPP 图标打开']} />;
  }
  return <p className="text-xs leading-relaxed text-white/80">用 Chrome 或 Edge 打开本站，点地址栏右侧的「安装」图标，即可像应用一样单独打开 iKanPP。</p>;
}

export function AddToHomeScreenModal() {
  const path = useInstallPath();
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [profileSent, setProfileSent] = useState(false);
  const app = path === 'in-app' ? inAppBrowser() : null;

  useEffect(() => {
    const showManual = () => {
      setManual(true);
      setProfileSent(false);
      setOpen(true);
    };
    // 播放器看满第 2 集后发出；能不能装、要不要提示，由下面的 path 判断。
    const showAuto = () => {
      if (document.fullscreenElement || isPwaDismissedIn14Days() || isPwaStandalone()) return;
      setManual(false);
      setOpen(true);
    };
    window.addEventListener('ikanpp:show-pwa-modal', showManual);
    window.addEventListener('ikanpp:show-pwa-modal-auto', showAuto);

    // 通过 URL 参数 (?pwa=1 或 ?install=1) 主动唤起
    const q = new URLSearchParams(window.location.search);
    if (q.get('pwa') === '1' || q.get('pwa') === 'true' || q.get('install') === '1') showManual();

    return () => {
      window.removeEventListener('ikanpp:show-pwa-modal', showManual);
      window.removeEventListener('ikanpp:show-pwa-modal-auto', showAuto);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      if (!manual) dismissPwaFor14Days();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, manual]);

  const later = () => {
    setOpen(false);
    if (!manual) dismissPwaFor14Days();
  };

  if (!open) return null;
  // 微信、QQ 等内置浏览器装不了：手动打开时说明先换浏览器（自动提示由 InAppBrowserBanner 负责）。
  if (app) {
    if (!manual) return null;
    return (
      <div role="dialog" aria-label="把 iKanPP 装到桌面" className={`${CARD} flex items-start gap-3 text-sm`}>
        <p className="flex-1 leading-relaxed text-white/90">
          {app}里不能装到桌面。点右上角「···」选「在浏览器打开」，再从浏览器里装到桌面。
        </p>
        <button type="button" aria-label="关闭" onClick={later} className="shrink-0 p-1 text-white/50 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  // 自动弹出只在真能安装时出现；手动打开总给出说明。
  if (!manual && path !== 'prompt' && path !== 'ios') return null;

  return (
    <div role="dialog" aria-label="把 iKanPP 装到桌面" className={CARD}>
      <div className="flex items-start gap-3">
        <img src="/icon-192.png" alt="" width={48} height={48} className="w-12 h-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{path === 'installed' ? 'iKanPP 已经装到桌面了' : '把 iKanPP 装到桌面，像 App 一样看剧'}</p>
          {path === 'installed' ? (
            <p className="mt-1 text-xs text-white/60">从桌面（或程序坞）上的 iKanPP 图标打开即可。</p>
          ) : (
            <ul className="mt-1 space-y-0.5 text-xs text-white/60">
              {PERKS.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" aria-label="关闭" onClick={later} className="shrink-0 p-1 text-white/50 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {path === 'ios' ? (
        <div className="mt-3 space-y-2">
          <IosSteps />
          {profileSent ? (
            <p className="flex items-start gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              描述文件已开始下载：若弹出提示请点「允许」，再到「设置」顶部的「已下载描述文件」里安装。
            </p>
          ) : iosProfileAvailable() ? (
            <button
              type="button"
              onClick={() => {
                setProfileSent(true);
                window.location.href = '/api/pwa/ios-profile';
              }}
              className="text-xs text-white/50 underline underline-offset-2 hover:text-white/80"
            >
              或者安装描述文件（需要在「设置」里确认）
            </button>
          ) : null}
        </div>
      ) : null}

      {path === 'none' ? (
        <div className="mt-3">
          <OtherWays />
        </div>
      ) : null}

      <div className="mt-3 flex justify-end gap-2">
        {path === 'prompt' ? (
          <>
            <button type="button" onClick={later} className="rounded-full px-4 py-2 text-xs text-white/60 hover:text-white">
              以后再说
            </button>
            <button
              type="button"
              onClick={async () => {
                const installed = await promptInstall();
                if (installed) setOpen(false);
              }}
              className="rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              安装到桌面
            </button>
          </>
        ) : (
          <button type="button" onClick={later} className="rounded-full bg-white/10 px-5 py-2 text-xs font-medium text-white/80 hover:bg-white/20">
            {path === 'ios' && !manual ? '以后再说' : '知道了'}
          </button>
        )}
      </div>
    </div>
  );
}
