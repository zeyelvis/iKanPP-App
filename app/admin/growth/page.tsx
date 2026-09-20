'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Globe,
  Bot,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Clock,
  Compass,
  CheckCircle2,
  ListTodo,
  Target,
  Award,
  Zap,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Square,
  Shield,
  Layers,
  Cpu,
  HelpCircle,
  BookOpen,
  Languages,
  Terminal,
  Share2,
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

export interface SopTask {
  id: string;
  category: 'daily' | 'weekly' | 'monthly' | 'longterm';
  categoryLabel: string;
  priority: 'P0 核心' | 'P1 重点' | 'P2 常规' | '战略愿景';
  priorityColor: string;
  title: string;
  duration: string;
  description: string;
  rationale: string;
  actionText: string;
  actionType: 'tab' | 'route' | 'external';
  actionTarget: string;
}

const SOP_TASKS: SopTask[] = [
  // 1. 每日必做任务 (Daily - 5项，总计约 15 分钟)
  {
    id: 'daily-parasite',
    category: 'daily',
    categoryLabel: '每日必做',
    priority: 'P0 核心',
    priorityColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    title: '一键复制今日热播片单 Markdown 并分发',
    duration: '3 分钟',
    description: '进入「寄生虫专栏」一键复制自动生成的今日最新 15 部热播院线/新番 Markdown，随手发布至 V2EX「分享发现」、知乎专栏、豆瓣追剧小组或贴吧。',
    rationale: '借壳万亿大厂（Notion / Medium / Telegraph）域名权重，当日院线新片与热搜词在 Google 搜索秒级抢占首屏并带直连锚文本。',
    actionText: '前往生成专栏',
    actionType: 'tab',
    actionTarget: 'parasite',
  },
  {
    id: 'daily-directory',
    category: 'daily',
    categoryLabel: '每日必做',
    priority: 'P0 核心',
    priorityColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    title: '向 1~2 个海外华人论坛/生活导航站提交收录',
    duration: '5 分钟',
    description: '在「全球华人导航站看板」挑选 1~2 个待提交的北美、澳洲或欧洲华人社区（如一亩三分地、文学城），使用一键复制的元数据模板递交发帖。',
    rationale: '日拱一卒，持续累积高质量反向链接（Backlinks），稳步拉升网站 Domain Rating (DR)。',
    actionText: '打开导航看板',
    actionType: 'tab',
    actionTarget: 'directories',
  },
  {
    id: 'daily-indexing',
    category: 'daily',
    categoryLabel: '每日必做',
    priority: 'P0 核心',
    priorityColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    title: 'Google Indexing API 闪电促抓配额打满 (180条)',
    duration: '2 分钟',
    description: '进入「促抓控制台」，检查并一键触发当天新增抢跑院线大片与连载新剧的 Indexing API 广播，确保配额高效消耗。',
    rationale: '抢跑 24 小时黄金首发窗口期，让 Google 爬虫在 10 分钟内抓取收录新片详情页。',
    actionText: '前往促抓控制台',
    actionType: 'route',
    actionTarget: '/admin/indexing',
  },
  {
    id: 'daily-demands',
    category: 'daily',
    categoryLabel: '每日必做',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '响应并清零前台观众求片工单',
    duration: '3 分钟',
    description: '查看前台观众在「求片反馈」提交的诉求，已收录的快速标记回复，未收录的由先锋雷达优先排查采录。',
    rationale: '解决真实海外用户的追剧痛点，将求片用户 100% 转化为高粘性核心种子用户与自发安利者。',
    actionText: '查看求片工单',
    actionType: 'route',
    actionTarget: '/admin/demands',
  },
  {
    id: 'daily-tg',
    category: 'daily',
    categoryLabel: '每日必做',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: 'Telegram 搜片社群互动与更新推流',
    duration: '2 分钟',
    description: '检查 TG 搜片机器人运行状态，并在官方讨论群或求片群内同步一条精选爆款片单直达链接，解答群友提问。',
    rationale: '沉淀完全自主掌控的私域社群流量，打破对单一搜索引擎排名的流量依赖。',
    actionText: 'TG 机器人控制台',
    actionType: 'tab',
    actionTarget: 'tg-bot',
  },

  // 2. 每周攻坚任务 (Weekly - 5项，总计约 45 分钟)
  {
    id: 'weekly-gsc',
    category: 'weekly',
    categoryLabel: '每周攻坚',
    priority: 'P0 核心',
    priorityColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    title: 'GSC 搜索词曝光点击与排名变动深度复盘',
    duration: '15 分钟',
    description: '在「GSC 数据分析」与 Google Search Console 查看过去 7 天的曝光量、点击率及 Top 20 搜索长尾词，锁定高转化蓝海词。',
    rationale: '数据驱动决策，精准捕捉海外华人实际在搜的非预期爆款长尾词，反哺片单聚合策略。',
    actionText: '进入 GSC 分析',
    actionType: 'route',
    actionTarget: '/admin/analytics',
  },
  {
    id: 'weekly-longform',
    category: 'weekly',
    categoryLabel: '每周攻坚',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '编写并发布一篇深度横评爆文',
    duration: '20 分钟',
    description: '更新或发布一篇《2026海外看剧神器深度横评：iKanPP vs 独播库 vs 泥视频》，分发至 Medium、Substack 或 Reddit (r/China_irl, r/iwanttorun)。',
    rationale: '深度横向对比长文具备极高的留存率与自然外链自发引用率，能带来持续数年的高质量自然推荐流量。',
    actionText: '打开 Medium',
    actionType: 'external',
    actionTarget: 'https://medium.com/new-story',
  },
  {
    id: 'weekly-check-dirs',
    category: 'weekly',
    categoryLabel: '每周攻坚',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '回访巡检已提交导航站的收录状态',
    duration: '5 分钟',
    description: '复查上周在导航站看板中标记为“已提交审核”的平台，核实管理员是否已收录上线，更新状态为“审核通过已收录”。',
    rationale: '闭环跟踪外链有效性，确保每一条外链切实生效产生权威投票。',
    actionText: '检查导航站状态',
    actionType: 'tab',
    actionTarget: 'directories',
  },
  {
    id: 'weekly-pwa',
    category: 'weekly',
    categoryLabel: '每周攻坚',
    priority: 'P2 常规',
    priorityColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    title: '移动端 PWA 桌面留存与回访频次检查',
    duration: '5 分钟',
    description: '观察移动端用户「添加到主屏幕」弹窗的触发与用户二次回访频次，确保持续锁住手机桌面入口。',
    rationale: 'PWA 能将普通网页转化为接近 Native App 的桌面独立应用，次月留存率提升 3 倍以上。',
    actionText: '查看主站体验',
    actionType: 'external',
    actionTarget: 'https://www.ikanpp.com',
  },
  {
    id: 'weekly-radar',
    category: 'weekly',
    categoryLabel: '每周攻坚',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '首发先锋雷达最新热门片单排查',
    duration: '5 分钟',
    description: '核查当周院线最新上映大片、连载新番、王牌综艺，确认雷达抓取与 TMDB 4K 宽屏资产对齐无遗漏。',
    rationale: '确保 iKanPP 持续领跑爱壹帆 2周~2个月的院线空白期，保持片源绝对先锋优势。',
    actionText: '检查前台最新片单',
    actionType: 'route',
    actionTarget: '/',
  },

  // 3. 每月冲刺任务 (Monthly - 5项，总计约 2 小时)
  {
    id: 'monthly-aged-domain',
    category: 'monthly',
    categoryLabel: '每月冲刺',
    priority: 'P0 核心',
    priorityColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    title: '筛选并挖掘高权重过期老域名 (Aged Domain)',
    duration: '30 分钟',
    description: '在 DropCatch / ExpiredDomains 等平台搜寻影视、影评、华人文娱类历史干净（DR 40+、无博彩违规）的老域名，评估 301 权重嫁接。',
    rationale: '老域名历史积累的十几年外链和域名信任度，可在几周内瞬间继承，跳过 Google 新站沙盒期。',
    actionText: '打开 ExpiredDomains',
    actionType: 'external',
    actionTarget: 'https://www.expireddomains.net/',
  },
  {
    id: 'monthly-kol',
    category: 'monthly',
    categoryLabel: '每月冲刺',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '联络 2~3 位海外华人博主或微信公众号',
    duration: '30 分钟',
    description: '针对留学生常看的公众号或生活博主发起友链互换、资源置换或赞助软文，提供官方免翻墙追剧特权。',
    rationale: '头部垂直 KOL 的推荐具备极高公信力，一次曝光可带来数千名高净值黏性观众。',
    actionText: '复制合作模板',
    actionType: 'tab',
    actionTarget: 'directories',
  },
  {
    id: 'monthly-seo-audit',
    category: 'monthly',
    categoryLabel: '每月冲刺',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '全站 SEO 索引健康度与规范化深度体检',
    duration: '20 分钟',
    description: '在「SEO 智能监控」排查全站规范链接 (Canonical)、Sitemap XML titles 分页索引、是否有死链或异常 404。',
    rationale: '定期清理低质条目与薄弱页面，防止死链污染搜索引擎信任分。',
    actionText: '前往 SEO 监控',
    actionType: 'route',
    actionTarget: '/admin/seo',
  },
  {
    id: 'monthly-topics',
    category: 'monthly',
    categoryLabel: '每月冲刺',
    priority: 'P1 重点',
    priorityColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    title: '策划当月超级院线大片/年番精选专题',
    duration: '25 分钟',
    description: '针对即将上线的超级大 IP（如国漫年番完结篇、春节档/暑期档新片）制作专题聚合页（/collection/*），打造聚合内链网络。',
    rationale: '专题页具有极强的话题聚合力与长尾搜索承接力，能形成强大的内部权重集束放大。',
    actionText: '查看精选专题',
    actionType: 'route',
    actionTarget: '/collection/douban-top-masterpiece',
  },
  {
    id: 'monthly-cf-audit',
    category: 'monthly',
    categoryLabel: '每月冲刺',
    priority: 'P2 常规',
    priorityColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    title: 'Cloudflare 边缘缓存命中率与 R2 成本效益复核',
    duration: '15 分钟',
    description: '登录 Cloudflare 仪表盘，检查全域边缘缓存命中率是否维持在 95% 以上，核查 R2 图片存储与流媒体直连带宽指标。',
    rationale: '确保海外用户 0.8s 极速首屏与全球受限国家用户 0ms 防裂图，兼顾运营成本极致可控。',
    actionText: '打开 Cloudflare 仪表盘',
    actionType: 'external',
    actionTarget: 'https://dash.cloudflare.com',
  },

  // 4. 长期战略里程碑 (Longterm - 5大里程碑)
  {
    id: 'longterm-dr50',
    category: 'longterm',
    categoryLabel: '长期愿景',
    priority: '战略愿景',
    priorityColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: 'Ahrefs 域名评级 (Domain Rating) 突破 50+',
    duration: '6~12 个月',
    description: '沉淀 500+ 条真实高权重白帽反向链接，超越 80% 同类海外流媒体，在全网建立绝对技术与外链壁垒。',
    rationale: '高 DR 权威域名将使所有新上线剧集在发布数分钟内自动获得 Google 顶级排名。',
    actionText: '查阅外链规范',
    actionType: 'tab',
    actionTarget: 'directories',
  },
  {
    id: 'longterm-google-top3',
    category: 'longterm',
    categoryLabel: '长期愿景',
    priority: '战略愿景',
    priorityColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: '核心高价值词稳居 Google 搜索首页前 3 名',
    duration: '6~12 个月',
    description: '“海外看剧”、“免翻墙看国产剧”、“4K海外影视”、“留学生看剧平台”等大流量词稳居 Google 首页前 3，实现自然流量源源不断。',
    rationale: '行业垄断级关键词前 3 位将带来全网 70% 的有效点击率，形成不可撼动的流量水龙头。',
    actionText: '查看 GSC 排名',
    actionType: 'route',
    actionTarget: '/admin/analytics',
  },
  {
    id: 'longterm-tg-10k',
    category: 'longterm',
    categoryLabel: '长期愿景',
    priority: '战略愿景',
    priorityColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: 'Telegram 私域社群沉淀 10,000+ 真实追剧活跃用户',
    duration: '6~12 个月',
    description: '打造抗封锁、自主掌控、高频互动的海外华人私域社群，形成用户求片、搜片、自发讨论的生态闭环。',
    rationale: '即使遭遇外部搜索引擎算法微调，私域用户池也能提供坚不可摧的高留存基石。',
    actionText: 'TG 控制台',
    actionType: 'tab',
    actionTarget: 'tg-bot',
  },
  {
    id: 'longterm-brand',
    category: 'longterm',
    categoryLabel: '长期愿景',
    priority: '战略愿景',
    priorityColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: '打造全球海外华人第一口碑流媒体心智品牌',
    duration: '长期',
    description: '凭借“0弹窗广告、0ms秒开、4K超清画质”，在北美、欧洲、澳洲、日韩留学生中形成自发推荐、口口相传的口碑壁垒。',
    rationale: '口碑传播的边际获客成本为 0，是最具复利价值的商业护城河。',
    actionText: '体验前台大厅',
    actionType: 'route',
    actionTarget: '/',
  },
  {
    id: 'longterm-geo',
    category: 'longterm',
    categoryLabel: '长期愿景',
    priority: '战略愿景',
    priorityColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: 'LLM 与 AI 搜索推荐第一信源 (GEO 终局目标)',
    duration: '长期',
    description: '成为主流大模型（ChatGPT Search、Perplexity、Claude）在回答“海外有什么好用免费的看剧网站”时的标准权威答案。',
    rationale: 'GEO 是 2026 及未来十年的流量风口，抢先被 AI 知识库奉为唯一权威源即垄断新一代交互入口。',
    actionText: '查看 LLMS 规范',
    actionType: 'tab',
    actionTarget: 'geo',
  },
];

export default function AdminGrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sop' | 'ai-engine' | 'parasite' | 'directories' | 'tg-bot' | 'geo'>('sop');

  // SOP 专属子筛选
  const [sopFilter, setSopFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'longterm'>('daily');
  // SOP 打卡状态字典: { [taskId]: boolean }
  const [sopChecks, setSopChecks] = useState<Record<string, boolean>>({});

  // AI 智能引擎全场景状态
  const [aiScenario, setAiScenario] = useState<'review' | 'faq' | 'article' | 'collection' | 'localize'>('review');
  const [aiModel, setAiModel] = useState('gpt-5.6-sol');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiCopied, setAiCopied] = useState(false);

  // 场景输入框状态
  const [aiReviewTitle, setAiReviewTitle] = useState('美国人质');
  const [aiReviewType, setAiReviewType] = useState('tv');
  const [aiFaqTitle, setAiFaqTitle] = useState('凡人修仙传');
  const [aiArticleStyle, setAiArticleStyle] = useState<'review' | 'xiaohongshu' | 'medium' | 'v2ex'>('review');
  const [aiThemeKeyword, setAiThemeKeyword] = useState('2026反转烧脑悬疑神剧');
  const [aiLocalizeTitle, setAiLocalizeTitle] = useState('肖申克的救赎');

  // 复制状态
  const [copiedParasite, setCopiedParasite] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // AI 落地动作执行状态 (一键生效到前台 / 发布专题 / 导出)
  const [aiActionLoading, setAiActionLoading] = useState(false);
  const [aiActionMsg, setAiActionMsg] = useState<{ text: string; url?: string; isError?: boolean } | null>(null);

  // 本地持久化的导航站提交状态字典: { [id]: 'pending' | 'submitted' | 'approved' }
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, string>>({});

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
      const savedDir = localStorage.getItem('ikanpp_admin_dir_status');
      if (savedDir) setSubmissionStatus(JSON.parse(savedDir));
    } catch {}

    // 读取本地保存的 SOP 打卡状态
    try {
      const savedSop = localStorage.getItem('ikanpp_admin_growth_sop_checks');
      if (savedSop) setSopChecks(JSON.parse(savedSop));
    } catch {}
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    const next = { ...submissionStatus, [id]: status };
    setSubmissionStatus(next);
    localStorage.setItem('ikanpp_admin_dir_status', JSON.stringify(next));
  };

  const handleToggleSopCheck = (taskId: string) => {
    const next = { ...sopChecks, [taskId]: !sopChecks[taskId] };
    setSopChecks(next);
    localStorage.setItem('ikanpp_admin_growth_sop_checks', JSON.stringify(next));
  };

  const handleResetCurrentSop = () => {
    const filtered = SOP_TASKS.filter(
      (t) => sopFilter === 'all' || t.category === sopFilter
    );
    const next = { ...sopChecks };
    filtered.forEach((t) => {
      delete next[t.id];
    });
    setSopChecks(next);
    localStorage.setItem('ikanpp_admin_growth_sop_checks', JSON.stringify(next));
  };

  const copyToClipboard = (text: string, callback: () => void) => {
    navigator.clipboard.writeText(text);
    callback();
    setTimeout(() => {}, 2000);
  };

  // AI 场景统一执行
  const handleRunAi = async () => {
    setAiLoading(true);
    setAiResult(null);
    setAiCopied(false);

    let params: Record<string, any> = { model: aiModel };
    if (aiScenario === 'review') {
      params = { ...params, title: aiReviewTitle, type: aiReviewType };
    } else if (aiScenario === 'faq') {
      params = { ...params, title: aiFaqTitle, type: 'tv' };
    } else if (aiScenario === 'article') {
      params = { ...params, style: aiArticleStyle };
    } else if (aiScenario === 'collection') {
      params = { ...params, theme: aiThemeKeyword };
    } else if (aiScenario === 'localize') {
      params = { ...params, title: aiLocalizeTitle };
    }

    try {
      const res = await fetch('/api/admin/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: aiScenario, params }),
      });
      const json = await res.json();
      if (json.success) {
        setAiResult(json.data);
      } else {
        alert('AI 执行失败: ' + (json.error || '未知错误'));
      }
    } catch (e: any) {
      alert('请求失败: ' + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // 一键应用 AI 资产到前台影视实体 (场景 1、2、5)
  const handleApplyToEntity = async () => {
    if (!aiResult) return;
    setAiActionLoading(true);
    setAiActionMsg(null);

    try {
      let targetTitle = '';
      let aiContent: Record<string, any> = {};

      if (aiScenario === 'review') {
        targetTitle = aiReviewTitle;
        aiContent = {
          uniqueSynopsis: aiResult.uniqueSynopsis,
          highlights: aiResult.highlights,
          characterAnalysis: aiResult.characterAnalysis,
          audienceFit: aiResult.audienceFit,
        };
      } else if (aiScenario === 'faq') {
        targetTitle = aiFaqTitle;
        aiContent = {
          faqs: aiResult.faqs,
        };
      } else if (aiScenario === 'localize') {
        targetTitle = aiLocalizeTitle;
        aiContent = {
          taiwanTitle: aiResult.taiwanTitle,
          hongkongTitle: aiResult.hongkongTitle,
          traditionalMetaDescription: aiResult.traditionalMetaDescription,
          traditionalKeywords: aiResult.traditionalKeywords,
        };
      }

      const res = await fetch('/api/admin/ai/apply-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: targetTitle, aiContent }),
      });
      const json = await res.json();
      if (json.success) {
        setAiActionMsg({ text: json.message, url: json.canonicalUrl });
      } else {
        setAiActionMsg({ text: json.error || '保存失败', isError: true });
      }
    } catch (e: any) {
      setAiActionMsg({ text: e.message || '网络请求异常', isError: true });
    } finally {
      setAiActionLoading(false);
    }
  };

  // 一键发布上线为前台专题页 (场景 4)
  const handlePublishTopic = async () => {
    if (!aiResult) return;
    setAiActionLoading(true);
    setAiActionMsg(null);

    try {
      const res = await fetch('/api/admin/ai/publish-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiResult }),
      });
      const json = await res.json();
      if (json.success) {
        setAiActionMsg({ text: json.message, url: json.topicUrl });
      } else {
        setAiActionMsg({ text: json.error || '发布专题失败', isError: true });
      }
    } catch (e: any) {
      setAiActionMsg({ text: e.message || '网络请求异常', isError: true });
    } finally {
      setAiActionLoading(false);
    }
  };

  // 一键下载 Markdown 文件 (场景 3)
  const handleDownloadMarkdown = () => {
    if (!aiResult) return;
    const content = typeof aiResult === 'object' && aiResult.markdown ? aiResult.markdown : typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult, null, 2);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ikanpp-parasite-article-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 统计计算
  const dailyTasks = SOP_TASKS.filter((t) => t.category === 'daily');
  const weeklyTasks = SOP_TASKS.filter((t) => t.category === 'weekly');
  const monthlyTasks = SOP_TASKS.filter((t) => t.category === 'monthly');
  const longtermTasks = SOP_TASKS.filter((t) => t.category === 'longterm');

  const dailyDone = dailyTasks.filter((t) => sopChecks[t.id]).length;
  const weeklyDone = weeklyTasks.filter((t) => sopChecks[t.id]).length;
  const monthlyDone = monthlyTasks.filter((t) => sopChecks[t.id]).length;
  const longtermDone = longtermTasks.filter((t) => sopChecks[t.id]).length;

  const currentCategoryTasks = SOP_TASKS.filter(
    (t) => sopFilter === 'all' || t.category === sopFilter
  );
  const currentCategoryDone = currentCategoryTasks.filter((t) => sopChecks[t.id]).length;
  const currentPercentage = currentCategoryTasks.length
    ? Math.round((currentCategoryDone / currentCategoryTasks.length) * 100)
    : 0;

  const standardMetaText = `网站名称：iKanPP (爱看片片)
官方网址：https://www.ikanpp.com
副标题：海外华人4K极速影视聚合搜索平台 | 零弹窗·免翻墙·0ms秒开
详细介绍：专为全球海外华人、留学生及华语影视爱好者打造的高品质免费流媒体聚合平台。全面收录 4.3 万部国产热播剧、院线新片抢先版、日本新番、王牌综艺与 4K 纪录片。采用双轨源站 CDN 直连架构，海外直连 0 缓冲秒开，100% 拒绝任何低俗博彩弹窗与诱导广告。支持 PWA 桌面独立应用，手机、平板、电脑全端极致流畅。`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* 1. 顶部标头与全局操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                全域增长中枢与 AI SEO 矩阵
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Growth 5.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                融合大模型 5 大 SEO 场景、SOP 每日执行看板、Parasite 借壳外链与 GEO 知识图谱渗透
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

      {/* 2. 状态胶囊条（4大周期完成度统计） */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 今日必做 */}
        <div
          onClick={() => {
            setActiveTab('sop');
            setSopFilter('daily');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'sop' && sopFilter === 'daily'
              ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30'
              : 'bg-[#0D0D14]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              今日必做 (15分)
            </span>
            <span className="text-xs font-mono font-bold text-red-400">
              {dailyDone}/{dailyTasks.length}
            </span>
          </div>
          <div className="text-base font-black text-white mt-1.5 flex items-center gap-2">
            <span>{Math.round((dailyDone / dailyTasks.length) * 100)}%</span>
            {dailyDone === dailyTasks.length && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                已达标 🎉
              </span>
            )}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(dailyDone / dailyTasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 本周攻坚 */}
        <div
          onClick={() => {
            setActiveTab('sop');
            setSopFilter('weekly');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'sop' && sopFilter === 'weekly'
              ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
              : 'bg-[#0D0D14]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              本周攻坚 (45分)
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {weeklyDone}/{weeklyTasks.length}
            </span>
          </div>
          <div className="text-base font-black text-white mt-1.5 flex items-center gap-2">
            <span>{Math.round((weeklyDone / weeklyTasks.length) * 100)}%</span>
            {weeklyDone === weeklyTasks.length && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                满分 ✨
              </span>
            )}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(weeklyDone / weeklyTasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 本月冲刺 */}
        <div
          onClick={() => {
            setActiveTab('sop');
            setSopFilter('monthly');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'sop' && sopFilter === 'monthly'
              ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
              : 'bg-[#0D0D14]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              本月冲刺 (2小时)
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {monthlyDone}/{monthlyTasks.length}
            </span>
          </div>
          <div className="text-base font-black text-white mt-1.5 flex items-center gap-2">
            <span>{Math.round((monthlyDone / monthlyTasks.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(monthlyDone / monthlyTasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 长期战略 */}
        <div
          onClick={() => {
            setActiveTab('sop');
            setSopFilter('longterm');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'sop' && sopFilter === 'longterm'
              ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
              : 'bg-[#0D0D14]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              战略里程碑
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {longtermDone}/{longtermTasks.length}
            </span>
          </div>
          <div className="text-base font-black text-white mt-1.5 flex items-center gap-2">
            <span>{Math.round((longtermDone / longtermTasks.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(longtermDone / longtermTasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. 主 Tab 导航 */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('sop')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'sop'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4 text-red-400" />
          📋 运营执行计划 (SOP)
        </button>

        <button
          onClick={() => setActiveTab('ai-engine')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'ai-engine'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          🤖 AI 增长引擎 (5 大场景)
          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md border border-purple-500/30">
            HOT
          </span>
        </button>

        <button
          onClick={() => setActiveTab('parasite')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'parasite'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="w-4 h-4 text-red-400" />
          🚀 寄生虫专栏
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
          🧭 全球华人导航看板
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
          🤖 Telegram 机器人
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
          🧠 GEO / LLMS 知识库
        </button>
      </div>

      {/* 4. Tab 内容：AI 全场景生成引擎 (5 大场景) */}
      {activeTab === 'ai-engine' && (
        <div className="space-y-6">
          {/* 模型设置与状态顶栏 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  当前大模型与接口状态
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    已连接 http://127.0.0.1:8080/v1
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  支持超长上下文与深度推理，自动生成独家影评、FAQ 问答与爆款文章
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">选择调度模型：</span>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="bg-black/80 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              >
                <option value="gpt-5.6-sol">GPT-5.6-Sol (默认主力推荐)</option>
                <option value="gpt-6-astra">GPT-6-Astra (高阶深度推理)</option>
                <option value="gpt-5.6-terra">GPT-5.6-Terra (极速轻量)</option>
                <option value="gpt-5.6-luna">GPT-5.6-Luna (超快输出)</option>
                <option value="gpt-5.5">GPT-5.5 (标准稳定)</option>
                <option value="gpt-6-astra-aeon">GPT-6-Astra-Aeon (百万上下文)</option>
              </select>
            </div>
          </div>

          {/* 5 大场景选择胶囊条 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => {
                setAiScenario('review');
                setAiResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                aiScenario === 'review'
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                🎬 场景 1
              </div>
              <div className="text-[11px] font-medium mt-1">独家原创深度影评</div>
              <div className="text-[10px] text-slate-400 mt-0.5">消灭全网重复内容</div>
            </button>

            <button
              onClick={() => {
                setAiScenario('faq');
                setAiResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                aiScenario === 'faq'
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                ⚡ 场景 2
              </div>
              <div className="text-[11px] font-medium mt-1">Google FAQ 胶囊</div>
              <div className="text-[10px] text-slate-400 mt-0.5">霸占首屏下拉问答框</div>
            </button>

            <button
              onClick={() => {
                setAiScenario('article');
                setAiResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                aiScenario === 'article'
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                🚀 场景 3
              </div>
              <div className="text-[11px] font-medium mt-1">万字爆款长文创作</div>
              <div className="text-[10px] text-slate-400 mt-0.5">知乎/小红书/Medium</div>
            </button>

            <button
              onClick={() => {
                setAiScenario('collection');
                setAiResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                aiScenario === 'collection'
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                📚 场景 4
              </div>
              <div className="text-[11px] font-medium mt-1">程序化专题裂变</div>
              <div className="text-[10px] text-slate-400 mt-0.5">口语化搜索词集合</div>
            </button>

            <button
              onClick={() => {
                setAiScenario('localize');
                setAiResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                aiScenario === 'localize'
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                🌏 场景 5
              </div>
              <div className="text-[11px] font-medium mt-1">港台繁体与多地译名</div>
              <div className="text-[10px] text-slate-400 mt-0.5">通吃泛华语搜索词</div>
            </button>
          </div>

          {/* 交互工作区 */}
          <div className="p-5 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl space-y-5">
            {/* 场景 1 输入 */}
            {aiScenario === 'review' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    场景 1：为影视生成 100% 独家原创影评与高光剧情看点
                  </h3>
                  <span className="text-xs text-slate-400">彻底根治全网千篇一律的 TMDB 短简介</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">影视作品名称：</label>
                    <input
                      type="text"
                      value={aiReviewTitle}
                      onChange={(e) => setAiReviewTitle(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="如：美国人质、凡人修仙传"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">影视类型：</label>
                    <select
                      value={aiReviewType}
                      onChange={(e) => setAiReviewType(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="tv">精品电视剧 / 网剧</option>
                      <option value="movie">院线大片 / 电影</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRunAi}
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  {aiLoading ? '正在调用 GPT-5.6-Sol 深度创作中...' : '开始生成独家原创剧情高光'}
                </button>
              </div>
            )}

            {/* 场景 2 输入 */}
            {aiScenario === 'faq' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    场景 2：生成符合 Google FAQPage 标准的折叠问答胶囊
                  </h3>
                  <span className="text-xs text-slate-400">输出 JSON-LD 结构化数据，垄断移动端搜索卡片</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">影视作品名称：</label>
                  <input
                    type="text"
                    value={aiFaqTitle}
                    onChange={(e) => setAiFaqTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="如：凡人修仙传、庆余年"
                  />
                </div>

                <button
                  onClick={handleRunAi}
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  {aiLoading ? '正在生成 4 组权威问答...' : '生成 Google FAQ 结构化胶囊'}
                </button>
              </div>
            )}

            {/* 场景 3 输入 */}
            {aiScenario === 'article' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-purple-400" />
                    场景 3：根据今日 15 部新片一键创作多风格爆款长文
                  </h3>
                  <span className="text-xs text-slate-400">自动内嵌 4K 官方封面海报与自然反向锚文本</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-slate-400">文章受众调性：</span>
                  {(['review', 'xiaohongshu', 'medium', 'v2ex'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setAiArticleStyle(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        aiArticleStyle === s
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s === 'review' && '🧐 知乎/豆瓣高知影评风'}
                      {s === 'xiaohongshu' && '📕 小红书爆款种草风'}
                      {s === 'medium' && '🌐 Medium 深度特稿风'}
                      {s === 'v2ex' && '💻 V2EX 极客技术推介'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRunAi}
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  {aiLoading ? '大模型正在万字深度构思撰写中 (约需1分钟)...' : '调用 GPT-5.6-Sol 创作万字深度大作'}
                </button>
              </div>
            )}

            {/* 场景 4 输入 */}
            {aiScenario === 'collection' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    场景 4：口语化自然搜索词 ➔ 自动裂变程序化精选专题页
                  </h3>
                  <span className="text-xs text-slate-400">生成 Slug、策展导语、搜索意图标签与专属推荐片单</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">口语化搜索主题词：</label>
                  <input
                    type="text"
                    value={aiThemeKeyword}
                    onChange={(e) => setAiThemeKeyword(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="如：2026反转烧脑悬疑神剧、适合情侣一起看的高分甜剧"
                  />
                </div>

                <button
                  onClick={handleRunAi}
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <Layers className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  {aiLoading ? '正在程序化裂变专题中...' : '生成专属聚合专题页面'}
                </button>
              </div>
            )}

            {/* 场景 5 输入 */}
            {aiScenario === 'localize' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Languages className="w-4 h-4 text-purple-400" />
                    场景 5：全球港台繁体与海外公映译名/搜索同义词本地化
                  </h3>
                  <span className="text-xs text-slate-400">自动补齐台湾/香港公映名称与全繁体 Meta 描述</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">大陆中文片名：</label>
                  <input
                    type="text"
                    value={aiLocalizeTitle}
                    onChange={(e) => setAiLocalizeTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="如：肖申克的救赎、泰坦尼克号、盗梦空间"
                  />
                </div>

                <button
                  onClick={handleRunAi}
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <Languages className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  {aiLoading ? '正在检索港台公映数据库...' : '一键补齐港台译名与繁体元数据'}
                </button>
              </div>
            )}

            {/* 结果展示区 */}
            {aiResult && (
              <div className="mt-5 p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    AI 深度生成结果 ({aiModel})
                  </span>

                  <div className="flex items-center gap-2">
                    {/* 场景 1、2、5：一键保存并生效到前台影视实体 */}
                    {(aiScenario === 'review' || aiScenario === 'faq' || aiScenario === 'localize') && (
                      <button
                        onClick={handleApplyToEntity}
                        disabled={aiActionLoading}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-900/30 transition-all disabled:opacity-50"
                      >
                        <Zap className={`w-3.5 h-3.5 ${aiActionLoading ? 'animate-spin' : ''}`} />
                        {aiActionLoading ? '正在写入实体...' : '⚡ 一键写入前台实体'}
                      </button>
                    )}

                    {/* 场景 4：一键发布上线为前台专题页 */}
                    {aiScenario === 'collection' && (
                      <button
                        onClick={handlePublishTopic}
                        disabled={aiActionLoading}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-900/30 transition-all disabled:opacity-50"
                      >
                        <Layers className={`w-3.5 h-3.5 ${aiActionLoading ? 'animate-spin' : ''}`} />
                        {aiActionLoading ? '正在发布专题...' : '🚀 一键发布为前台专题'}
                      </button>
                    )}

                    {/* 场景 3：一键导出 Markdown 文件 */}
                    {aiScenario === 'article' && (
                      <button
                        onClick={handleDownloadMarkdown}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-900/30 transition-all"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        📥 导出 .md 文件
                      </button>
                    )}

                    {/* 复制全文 */}
                    <button
                      onClick={() =>
                        copyToClipboard(
                          typeof aiResult === 'string'
                            ? aiResult
                            : JSON.stringify(aiResult, null, 2),
                          () => setAiCopied(true)
                        )
                      }
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-slate-200 flex items-center gap-1 transition-all"
                    >
                      {aiCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          已复制到剪贴板！
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          一键复制全文
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 落地操作成功/失败反馈提示卡片 */}
                {aiActionMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center justify-between gap-3 border ${
                      aiActionMsg.isError
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>{aiActionMsg.text}</span>
                    </div>
                    {aiActionMsg.url && (
                      <a
                        href={aiActionMsg.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold text-white hover:text-emerald-200 shrink-0"
                      >
                        立刻直达前台查看 ↗
                      </a>
                    )}
                  </div>
                )}

                {/* 格式化展示 */}
                <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {typeof aiResult === 'object' && aiResult.markdown ? (
                    aiResult.markdown
                  ) : typeof aiResult === 'object' ? (
                    JSON.stringify(aiResult, null, 2)
                  ) : (
                    aiResult
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab 内容：SOP 运营执行看板 */}
      {activeTab === 'sop' && (
        <div className="space-y-5">
          {/* 子筛选胶囊与打卡控制栏 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0D0D14]/80 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSopFilter('daily')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  sopFilter === 'daily'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                📅 每日必做 ({dailyDone}/{dailyTasks.length})
              </button>

              <button
                onClick={() => setSopFilter('weekly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  sopFilter === 'weekly'
                    ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                🗓️ 每周攻坚 ({weeklyDone}/{weeklyTasks.length})
              </button>

              <button
                onClick={() => setSopFilter('monthly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  sopFilter === 'monthly'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                🎯 每月冲刺 ({monthlyDone}/{monthlyTasks.length})
              </button>

              <button
                onClick={() => setSopFilter('longterm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  sopFilter === 'longterm'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                🏆 战略愿景 ({longtermDone}/{longtermTasks.length})
              </button>

              <button
                onClick={() => setSopFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  sopFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                全部计划 (20)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                当前板块已完成{' '}
                <strong className="text-white font-mono">{currentPercentage}%</strong>
              </span>
              <button
                onClick={handleResetCurrentSop}
                title="清空当前分类下的打卡状态"
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                重置打卡
              </button>
            </div>
          </div>

          {/* 任务卡片列表 */}
          <div className="space-y-3">
            {currentCategoryTasks.map((task) => {
              const isDone = !!sopChecks[task.id];
              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-[#0D0D14]/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* 打卡按钮 */}
                      <button
                        onClick={() => handleToggleSopCheck(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${task.priorityColor}`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                            ⏱️ 预计 {task.duration}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                            {task.categoryLabel}
                          </span>
                        </div>

                        <h3
                          className={`text-sm font-bold transition-all ${
                            isDone ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="text-[11px] text-slate-400 bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-start gap-2">
                          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>战略价值：</strong>
                            {task.rationale}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 快捷操作动作按钮 */}
                    <div className="shrink-0 pt-0.5">
                      {task.actionType === 'tab' && (
                        <button
                          onClick={() => setActiveTab(task.actionTarget as any)}
                          className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          {task.actionText}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {task.actionType === 'route' && (
                        <Link
                          href={task.actionTarget}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          {task.actionText}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}

                      {task.actionType === 'external' && (
                        <a
                          href={task.actionTarget}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          {task.actionText}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tab 内容：寄生虫专栏一键生成 */}
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
                  已内嵌 4K 高清封面海报与自然反向锚文本，复制后直接发布到以下万亿级超级大厂平台，图文并茂借 DR 90+ 域名权重秒排 Google 首页
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('ai-engine');
                    setAiScenario('article');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  调用 AI 智能润色
                </button>

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

      {/* 7. Tab 内容：全球华人导航站提交看板 */}
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

      {/* 8. Tab 内容：Telegram 机器人控制台 */}
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

      {/* 9. Tab 内容：GEO / LLMS 知识库中枢 */}
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
