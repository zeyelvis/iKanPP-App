'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Globe,
  Bot,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Share2,
  FileText,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Film,
  Send,
} from 'lucide-react';

interface DirectoryItem {
  id: string;
  name: string;
  region: string;
  category: string;
  url: string;
  weight: string;
}

interface GrowthData {
  today: string;
  tgBot: {
    isConfigured: boolean;
    webhookUrl: string;
    botUsername: string;
  };
  geo: {
    llmsTxtUrl: string;
    llmsFullTxtUrl: string;
  };
  parasite: {
    title: string;
    itemCount: number;
    markdown: string;
  };
  directories: DirectoryItem[];
}

export default function AdminGrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'parasite' | 'directories' | 'tg-bot' | 'geo'>('parasite');

  // 复制状态
  const [copiedParasite, setCopiedParasite] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 本地持久化的导航站提交状态字典: { [id]: 'pending' | 'submitted' | 'approved' }
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, string>>({});

  // Telegram 模拟搜索
  const [simQuery, setSimQuery] = useState('凡人修仙传');
  const [simResult, setSimResult] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/growth');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (e) {
      console.error('[Growth API Error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 读取本地保存的导航站提交状态
    try {
      const saved = localStorage.getItem('ikanpp_admin_dir_status');
      if (saved) setSubmissionStatus(JSON.parse(saved));
    } catch {}
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    const next = { ...submissionStatus, [id]: status };
    setSubmissionStatus(next);
    localStorage.setItem('ikanpp_admin_dir_status', JSON.stringify(next));
  };

  const copyToClipboard = (text: string, callback: () => void) => {
    navigator.clipboard.writeText(text);
    callback();
    setTimeout(() => {}, 2000);
  };

  const standardMetaText = `网站名称：iKanPP (爱看片片)
官方网址：https://www.ikanpp.com
副标题：海外华人4K极速影视聚合搜索平台 | 零弹窗·免翻墙·0ms秒开
详细介绍：专为全球海外华人、留学生及华语影视爱好者打造的高品质免费流媒体聚合平台。全面收录 4.3 万部国产热播剧、院线新片抢先版、日本新番、王牌综艺与 4K 纪录片。采用双轨源站 CDN 直连架构，海外直连 0 缓冲秒开，100% 拒绝任何低俗博彩弹窗与诱导广告。支持 PWA 桌面独立应用，手机、平板、电脑全端极致流畅。`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* 1. 顶部标头与全局统计 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                全域增长与外链中枢
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Growth 5.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                融合 GEO 知识图谱渗透、Parasite SEO 万亿大厂借壳与全球华人私域网络
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </button>
        </div>
      </div>

      {/* 2. 状态胶囊条 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            GEO / LLM 语料端点
          </div>
          <div className="text-base font-black text-emerald-400 mt-1 flex items-center gap-1">
            已全网生效 <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            Telegram 搜片机器人
          </div>
          <div className="text-base font-black mt-1">
            {data?.tgBot.isConfigured ? (
              <span className="text-emerald-400 flex items-center gap-1">
                已就绪 <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-amber-400 text-sm">待配置 Token</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            今日先锋专栏影片
          </div>
          <div className="text-base font-black text-white mt-1">
            {data?.parasite.itemCount || 15} 部新片
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-red-400" />
            全球收录目标
          </div>
          <div className="text-base font-black text-slate-200 mt-1">
            Top 50 社区
          </div>
        </div>
      </div>

      {/* 3. Tab 导航 */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('parasite')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'parasite'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="w-4 h-4 text-red-400" />
          寄生虫 SEO 专栏一键生成
        </button>

        <button
          onClick={() => setActiveTab('directories')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'directories'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          全球华人导航站提交看板
        </button>

        <button
          onClick={() => setActiveTab('tg-bot')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'tg-bot'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4 text-blue-400" />
          Telegram 机器人控制台
        </button>

        <button
          onClick={() => setActiveTab('geo')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'geo'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          GEO / LLMS 知识库中枢
        </button>
      </div>

      {/* 4. Tab 内容区域 */}
      {activeTab === 'parasite' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  今日院线首发与热播专栏 Markdown (实时自动组装)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  已内嵌自然反向锚文本，复制后直接发布到以下万亿级超级大厂平台，借 DR 90+ 域名权重秒排 Google 首页
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(data?.parasite.markdown || '', () => setCopiedParasite(true))}
                className="px-4 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                {copiedParasite ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    已成功复制全文 Markdown！
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    一键复制专栏全文
                  </>
                )}
              </button>
            </div>

            {/* 万亿大厂一键直达通道 */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/5 text-xs text-slate-400">
              <span>快捷发布通道：</span>
              <a
                href="https://www.notion.so"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1"
              >
                Notion Sites <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://medium.com/new-story"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1"
              >
                Medium 专栏 <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://telegra.ph/"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1"
              >
                Telegraph (免翻墙极速排版) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://substack.com/"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1"
              >
                Substack <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>

            {/* Markdown 代码预览区 */}
            <div className="relative rounded-xl bg-black/60 border border-white/10 p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {data?.parasite.markdown || '正在组装今日最新片单...'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'directories' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  全球 Top 50 优质华人导航与生活社区追踪看板
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  点击右侧按钮一键直达各平台发帖/提交页面，状态自动保存在本地，帮您系统化跟进收录进度
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(standardMetaText, () => setCopiedTemplate(true))}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    已复制标准提交文案
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制通用提交元数据模板
                  </>
                )}
              </button>
            </div>

            {/* 表格列表 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 border-b border-white/10 font-bold">
                  <tr>
                    <th className="p-3">平台名称</th>
                    <th className="p-3">覆盖区域</th>
                    <th className="p-3">平台定位</th>
                    <th className="p-3">域名权威评级</th>
                    <th className="p-3">当前跟进状态</th>
                    <th className="p-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.directories || []).map((dir) => {
                    const status = submissionStatus[dir.id] || 'pending';
                    return (
                      <tr key={dir.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          {dir.name}
                        </td>
                        <td className="p-3 text-slate-400">{dir.region}</td>
                        <td className="p-3 text-slate-300">{dir.category}</td>
                        <td className="p-3 font-mono text-emerald-400 font-semibold">{dir.weight}</td>
                        <td className="p-3">
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(dir.id, e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                          >
                            <option value="pending">⏳ 待提交</option>
                            <option value="submitted">🚀 已提交审核</option>
                            <option value="approved">✅ 审核通过已收录</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={dir.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 font-medium transition-colors"
                          >
                            直达官网 <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tg-bot' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  Telegram 搜片机器人 Webhook 中枢
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  依托 Cloudflare Edge Serverless 运行，零独立服务器成本，随时渗透海外华人社群
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full border bg-white/5 border-white/10 font-mono">
                  {data?.tgBot.isConfigured ? (
                    <span className="text-emerald-400 font-bold">● Token 已配置</span>
                  ) : (
                    <span className="text-amber-400 font-bold">○ 待设置 TELEGRAM_BOT_TOKEN</span>
                  )}
                </span>
              </div>
            </div>

            {/* Webhook 绑定地址 */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-slate-300">当前已挂载的 Webhook 端点：</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white/5 px-3 py-2 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
                  {data?.tgBot.webhookUrl || 'https://www.ikanpp.com/api/tg-bot'}
                </code>
              </div>
            </div>

            {/* 3 步开通指引卡片 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white">📖 3 步开启全球社群搜片网络：</h3>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>打开 Telegram，搜索官方 <strong>@BotFather</strong> 并发送 <code>/newbot</code>；</li>
                <li>给您的机器人起一个名字（如 <code>iKanPP 影视助手</code>），获取专属 API Token；</li>
                <li>在 Cloudflare Pages 环境变量中添加 <code>TELEGRAM_BOT_TOKEN</code> 并重新部署，机器人即可即刻全功能点亮！群友即可在群内 <code>@机器人 片名</code> 实时搜片！</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'geo' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  GEO / LLM 生成式 AI 渗透规范中枢
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  遵循 2026 全新国际标准，向 ChatGPT、Claude、Perplexity 实时直出纯净 Markdown 语料
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href="/llms.txt"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 hover:bg-emerald-600/30 transition-colors"
                >
                  预览 /llms.txt <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/llms-full.txt"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 hover:bg-emerald-600/30 transition-colors"
                >
                  预览 /llms-full.txt <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                💡 <strong>为什么这至关重要？</strong><br />
                2026 年超过 30% 的年轻海外华人通过问答大模型（Perplexity、ChatGPT Search）获取看剧网站推荐。
                通过在根目录暴露 <code>/llms.txt</code> 与动态 <code>/llms-full.txt</code>，大模型爬虫在探测时会优先吸收这些结构化信息，并在用户提问“海外免翻墙看剧网站推荐”时，直接将 iKanPP 作为官方推荐卡片展示！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
