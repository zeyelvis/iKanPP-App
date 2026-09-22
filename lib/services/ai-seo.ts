/**
 * AI SEO 智能内容与全域增长中枢服务 (5 大超级场景矩阵)
 * 
 * 对接本地/云端大模型接口 (如 GPT-5.6-Sol / GPT-6-Astra / GPT-5.6-Terra)
 * 涵盖 2026 年最尖端的 5 大流媒体 SEO 场景：
 * 场景 1：独家原创深度影评与高光剧情扩写（消灭全网重复内容 / Thin Content）
 * 场景 2：全自动生成 FAQPage 结构化问答胶囊（霸占 Google 搜索首屏折叠下拉框）
 * 场景 3：万字 Parasite SEO 爆款长文全自动生产（知乎/小红书/Medium/V2EX 借壳外链）
 * 场景 4：口语化长尾搜索 ➔ 自动裂变程序化专题页（Programmatic SEO 集合）
 * 场景 5：全球繁体与港台/海外本地化音译优化（港台译名库，通吃全球泛华语流量）
 */

export interface TitleSnippet {
  title: string;
  type: string;
  qualityBadge?: string;
  updateBadge?: string;
  watchUrl: string;
  coverUrl?: string;
}

const DEFAULT_BASE_URL = process.env.AI_BASE_URL || 'http://127.0.0.1:8080/v1';
const DEFAULT_API_KEY = process.env.AI_API_KEY || 'pwd';
const DEFAULT_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';

/**
 * 基础 Chat Completion 统一调度
 */
export async function callAiCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const baseUrl = (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const apiKey = process.env.AI_API_KEY || DEFAULT_API_KEY;
  const model = params.model || process.env.AI_MODEL || DEFAULT_MODEL;

  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(60000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 3500,
      reasoning_effort: 'low',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`[AI API Error] HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('[AI API Error] 返回内容为空');
  }

  return content.trim();
}

/**
 * 健壮的 JSON 提取工具，防范大模型多余包裹与解释性前后缀
 */
export function extractJson<T = any>(raw: string): T {
  const trimmed = raw.trim();
  const withoutFences = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(withoutFences);
  } catch {}

  const match = withoutFences.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }

  throw new Error('无法从大模型返回内容中解析出合法的 JSON');
}

/**
 * ============================================================================
 * 场景 1：独家原创深度影评与剧情高光扩写 (消灭全网重复内容 / Thin Content)
 * ============================================================================
 */
export async function generateAiUniqueReview(params: {
  title: string;
  type: string;
  overview?: string;
  cast?: string[];
  genres?: string[];
  model?: string;
}): Promise<{
  hook: string;
  uniqueSynopsis: string;
  highlights: string[];
  characterAnalysis: string;
  audienceFit: string;
}> {
  const systemPrompt = `你是一位精通华语影视与好莱坞电影工业的资深顶级影评人。
请针对给定的影视作品，撰写一段 100% 全网独家原创、文笔老练犀利的独家深度剧情剖析与角色看点。
严禁复述官方公关简介，必须从叙事张力、人性博弈、视听风格与角色弧光深度展开。

必须直接以严格合法的 JSON 格式返回，包含以下字段：
{
  "hook": "15~25字极具悬念与冲击力的一句话观影金句（用于Google搜索结果首句抓人）",
  "uniqueSynopsis": "300~400字的独家剧情高光剖析，层层递进，吸引读者观看",
  "highlights": ["核心看点1 (15~25字)", "核心看点2 (15~25字)", "核心看点3 (15~25字)"],
  "characterAnalysis": "150字左右的主演演技与角色博弈分析",
  "audienceFit": "适合哪类受众群（如：高智商犯罪迷、情感共鸣者等）"
}
不要输出任何多余废话或 Markdown 代码块包裹。`;

  const userPrompt = `作品名称：《${params.title}》
类型：${params.type === 'tv' ? '电视剧' : '院线电影'}
原始简介：${params.overview || '暂无详细简介'}
主要演员：${(params.cast || []).slice(0, 5).join('、') || '实力派演员阵容'}
分类标签：${(params.genres || []).join('、') || '热门华语佳作'}`;

  try {
    const raw = await callAiCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: params.model || DEFAULT_MODEL,
      temperature: 0.7,
      maxTokens: 1800,
    });
    const parsed = extractJson<{
      hook?: string;
      uniqueSynopsis: string;
      highlights: string[];
      characterAnalysis: string;
      audienceFit: string;
    }>(raw);

    return {
      hook: parsed.hook || `${params.title}：在危机漩涡与人性抉择中，展开令人屏息的博弈。`,
      uniqueSynopsis: parsed.uniqueSynopsis,
      highlights: parsed.highlights || ['高能剧情推进与极致视听震撼', '实力派主创倾力呈现角色弧光', '海外 Anycast 4K 纯直连秒开'],
      characterAnalysis: parsed.characterAnalysis || '主演扎实的表演赋予角色极强的心理博弈张力。',
      audienceFit: parsed.audienceFit || '推荐给所有偏好快节奏、硬派视听与高质量电影工业叙事的全球影迷。',
    };
  } catch (err: any) {
    console.warn(`[generateAiUniqueReview fallback] ${params.title}:`, err?.message);
    return {
      hook: `${params.title}：危机四伏中的人性抉择与全景视听震撼。`,
      uniqueSynopsis: `${params.title} 是一部兼具叙事张力与视听冲击力的佳作。${params.overview ? params.overview.slice(0, 200) + '...' : '故事情节跌宕起伏，危机四伏中层层展开令人屏息的剧情高潮。'}`,
      highlights: ['高能剧情推进与极致视听震撼', '实力派主创倾力呈现角色弧光', '海外 Anycast 4K 纯直连秒开'],
      characterAnalysis: '主演通过扎实而极具沉浸感的表演，将危机漩涡中的心理博弈与决绝信念演绎得淋漓尽致。',
      audienceFit: '推荐给所有偏好快节奏、硬派视听与高质量电影工业叙事的全球影迷。',
    };
  }
}

/**
 * ============================================================================
 * 场景 2：全自动生成 FAQPage 结构化数据胶囊 (霸占 Google 搜索折叠下拉框)
 * ============================================================================
 */
export async function generateAiFaq(params: {
  title: string;
  type: string;
  overview?: string;
  model?: string;
}): Promise<{
  faqs: Array<{ question: string; answer: string }>;
  jsonLd: Record<string, any>;
}> {
  const systemPrompt = `你是一位精通 Google Schema.org 结构化数据的国际顶级 SEO 架构师。
请针对给定的影视作品，生成 4 个海外华人观众在 Google 搜索中最可能高频查询的真实问题与解答。
核心覆盖：
1. 海外免翻墙 4K 播放渠道（强调 iKanPP 0广告直连秒开体验）；
2. 正片剧情核心看点与反转亮点；
3. 更新频率、全集集数与清晰度规格；
4. 真实观众口碑与防坑观影建议。

必须直接返回严格合法的 JSON 数组，格式如下：
[
  {"question": "问题1", "answer": "权威回答1"},
  {"question": "问题2", "answer": "权威回答2"},
  {"question": "问题3", "answer": "权威回答3"},
  {"question": "问题4", "answer": "权威回答4"}
]
不要包含任何多余文字或 Markdown 包裹。`;

  const userPrompt = `影视作品：《${params.title}》
类型：${params.type === 'tv' ? '电视剧' : '电影'}
剧情亮点：${params.overview || '2026 年度热播影视大作'}`;

  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    const raw = await callAiCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: params.model || DEFAULT_MODEL,
      temperature: 0.5,
      maxTokens: 1400,
    });
    faqs = extractJson<Array<{ question: string; answer: string }>>(raw);
  } catch (err: any) {
    console.warn(`[generateAiFaq fallback] ${params.title}:`, err?.message);
    faqs = [
      {
        question: `在海外如何免翻墙流畅观看《${params.title}》4K超清完整版？`,
        answer: `您可以在 iKanPP (爱看片片) 直接直连观看。平台在全球部署 Anycast 边缘 CDN，海外北美、欧洲、澳洲均可实现 0 缓冲秒开，且全站无弹窗广告。`,
      },
      {
        question: `《${params.title}》的画质与更新进度如何？`,
        answer: `平台提供 1080P/4K 超清画质版本，与国内各大平台官方保持实时同步更新，支持移动端 PWA 桌面离线直达。`,
      },
      {
        question: `《${params.title}》值得看吗？有哪些精彩亮点？`,
        answer: `本片叙事紧凑、反转连连，实力派主演阵容在危机与博弈中展现出极高水准，口碑热度持续霸榜。`,
      },
      {
        question: `iKanPP 观看《${params.title}》需要会员充值或看广告吗？`,
        answer: `无需充值会员，100% 拒绝任何低俗博彩贴片与诱导弹窗，真正还原院线级纯净视听体验。`,
      },
    ];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return { faqs, jsonLd };
}

/**
 * ============================================================================
 * 场景 3：万字 Parasite SEO 爆款长文全自动生产矩阵 (知乎/小红书/Medium/V2EX)
 * ============================================================================
 */
export async function generateAiParasiteArticle(
  items: TitleSnippet[],
  options: {
    model?: string;
    style?: 'review' | 'xiaohongshu' | 'medium' | 'v2ex';
  } = {}
): Promise<{ title: string; markdown: string; modelUsed: string }> {
  const model = options.model || DEFAULT_MODEL;
  const style = options.style || 'review';
  const today = new Date().toISOString().slice(0, 10);

  const stylePrompts = {
    review: '知乎/豆瓣高知影评风：深度解析剧情隐喻、角色弧光、画质与防坑指南，逻辑严密，极具权威感与说服力。',
    xiaohongshu: '小红书爆款种草风：语言亲切活泼，大量使用吸睛 emoji，痛击海外华人“版权受限”、“卡顿转圈”痛点，强推免翻墙 4K 秒开神站。',
    medium: 'Medium / Substack 深度特稿风：适合海外华人与留学生的专业流媒体测评与 2026 最新看剧全景指南。',
    v2ex: '极客技术社区风：客观冷静，重点介绍 Anycast 边缘 CDN 双轨直连架构、0 广告体验与 PWA 桌面技术的极致流畅度。',
  };

  const systemPrompt = `你是一位拥有 10 年资深经验的海外流媒体与华语影视特约专栏作家，精通 Google 2026 最新 Helpful Content 算法规则与 Parasite SEO 借壳引流写作。
你的任务是根据提供的今日热播影视片单，撰写一篇极具吸引力、图文并茂、文笔大师级的高质量 Markdown 文章。

写作必须遵循以下原则：
1. 风格调性：${stylePrompts[style] || stylePrompts.review}
2. 格式规范：标准 GitHub Flavored Markdown 格式；
3. 视觉冲击：文章开头必须包含今日热播影视的官方大图（![今日热播影视大作速报](${items[0]?.coverUrl || ''})），并在每部作品的介绍中保留海报（![《片名》官方高清海报](海报地址)）；
4. 自然锚文本：在每部作品的推荐结尾，自然融入给定的 4K 免翻墙正片直达超链接（[点击立即在 iKanPP 免费观看完整版](链接)）；
5. 解决痛点：重点强调“海外免翻墙极速直连”、“4K 超清 0 缓冲”、“100% 拒绝任何低俗博彩弹窗广告”的影院级体验；
6. 严禁生成空洞模板废话，每部剧要有真实的亮点和剧情钩子，吸引读者一口气读完并点击观看。`;

  // 🌟 品牌隔离与 0 外链铁律：彻底阻断任何第三方域名（如 iyf.tv）泄露，全部转换为 iKanPP 同域安全镜像
  const sanitizedItems = items.map((it) => {
    let safeCover = it.coverUrl || '';
    if (safeCover.includes('iyf.tv')) {
      safeCover = `https://www.ikanpp.com/api/img-proxy?url=${encodeURIComponent(safeCover)}`;
    }
    return {
      ...it,
      coverUrl: safeCover,
    };
  });

  const itemsText = sanitizedItems.map((it, idx) => `
${idx + 1}. 《${it.title}》
- 类型: ${it.type === 'tv' ? '电视剧/网剧' : '电影'}
- 状态: ${it.qualityBadge || '1080P/4K'} · ${it.updateBadge || '全集'}
- 海报图片: ${it.coverUrl || '无'}
- 正片直达URL: ${it.watchUrl}
`).join('\n');

  const userPrompt = `今天日期是 ${today}。
请根据以下今日最新上线的 15 部影视片单，撰写一篇标题引人入胜、结构清晰、极具转化力的高质量深度文章：

${itemsText}

请直接输出 Markdown 全文（包含主标题 #、引言、每部电影/剧集的图文评析、以及结语），无需额外的前后寒暄说明。`;

  const rawMarkdown = await callAiCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model,
    temperature: 0.75,
    maxTokens: 4000,
  });

  // 终极防线：出口全量正则清洗，100% 抹杀任何可能逃逸的第三方域名
  let cleanMarkdown = rawMarkdown.replace(/https?:\/\/static\.iyf\.tv\/[^\s)"]+/g, (matched) => {
    return `https://www.ikanpp.com/api/img-proxy?url=${encodeURIComponent(matched)}`;
  });
  cleanMarkdown = cleanMarkdown.replace(/static\.iyf\.tv/gi, 'img.ikanpp.com');
  cleanMarkdown = cleanMarkdown.replace(/\biyf\.tv\b/gi, 'ikanpp.com');

  const titleMatch = cleanMarkdown.match(/^#\s+(.+)$/m);
  const articleTitle = titleMatch ? titleMatch[1].trim() : `2026年最新爆款影视指南（${today}更新）`;

  return {
    title: articleTitle,
    markdown: cleanMarkdown,
    modelUsed: model,
  };
}

/**
 * ============================================================================
 * 场景 4：口语化长尾搜索 ➔ 自动裂变程序化专题页 (Programmatic SEO 集合)
 * ============================================================================
 */
export async function generateAiCollectionTopic(params: {
  themeKeyword: string;
  candidateTitles: string[];
  model?: string;
}): Promise<{
  collectionSlug: string;
  collectionTitle: string;
  introductoryEssay: string;
  searchIntentKeywords: string[];
  recommendedPicks: Array<{ title: string; oneLinePitch: string }>;
}> {
  const systemPrompt = `你是一位专业影视策展人与 Programmatic SEO (程序化搜索) 架构师。
当海外用户在 Google 搜索口语化长尾关键词（如“好看的烧脑悬疑国产剧”、“女主双商在线的爽剧”、“2026最值得看的科幻大作”）时，需要自动生成一个高权重的专属聚合专题页。

请针对给定的主题，从候选片单中精选匹配的影视，并撰写一篇高质量的策展导语。
必须严格输出合法的 JSON 格式：
{
  "collectionSlug": "符合SEO规范的英文slug（如: top-suspense-crime-dramas）",
  "collectionTitle": "吸睛的专题主标题（如: 2026 反转烧脑巅峰：十大不容错过的硬核悬疑剧精选）",
  "introductoryEssay": "300字深度策展导语，交代为什么做这个合集、看点是什么",
  "searchIntentKeywords": ["关键词1", "关键词2", "关键词3", "关键词4"],
  "recommendedPicks": [
    {"title": "片名", "oneLinePitch": "一句话神级安利理由 (20~30字)"}
  ]
}
不要输出任何多余标记。`;

  const userPrompt = `专题主题/口语化搜索词：${params.themeKeyword}
片库候选作品：${params.candidateTitles.slice(0, 15).join('、')}`;

  const raw = await callAiCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: params.model,
    temperature: 0.7,
    maxTokens: 1800,
  });

  try {
    return extractJson(raw);
  } catch {
    return {
      collectionSlug: 'recommended-chinese-masterpieces',
      collectionTitle: `2026 年度精选：${params.themeKeyword} 观影专栏`,
      introductoryEssay: '本专题精选了华语影视中极具口碑与艺术质感的重磅佳作，为您带来纯净不卡顿的极致视听体验。',
      searchIntentKeywords: [params.themeKeyword, '海外看剧推荐', '4K华语影视'],
      recommendedPicks: params.candidateTitles.slice(0, 5).map((t) => ({
        title: t,
        oneLinePitch: '年度口碑爆款，叙事精湛，不容错过。',
      })),
    };
  }
}

/**
 * ============================================================================
 * 场景 5：全球繁体与港台/海外本地化音译优化 (通吃全球泛华语流量)
 * ============================================================================
 */
export async function generateAiLocalization(params: {
  title: string;
  originalName?: string;
  year?: string;
  model?: string;
}): Promise<{
  taiwanTitle: string;
  hongkongTitle: string;
  traditionalTitle: string;
  traditionalMetaDescription: string;
  searchAliases: string[];
}> {
  const systemPrompt = `你是一位精通华语地区不同译名、粤语公映习惯与港台繁体中文的本地化 SEO 专家。
海外华人（香港、台湾、新加坡、马来西亚、北美唐人街）习惯使用繁体中文及当地特定译名搜索影视。
请根据给出的大陆中文片名，精准输出其在港台地区的官方上映译名、全繁体 Meta 描述与搜索同义词别名。

必须严格输出 JSON 格式：
{
  "taiwanTitle": "台湾正式公映译名（如无特殊译名则为标准台湾繁体）",
  "hongkongTitle": "香港正式公映译名（符合粤语习惯，如无则为香港繁体）",
  "traditionalTitle": "标准正体繁体片名",
  "traditionalMetaDescription": "120字左右专为港台留学生打造的繁体元数据描述，包含免翻墙、4K超清、線上看等高频搜索词",
  "searchAliases": ["别名1", "别名2", "别名3", "别名4"]
}
不要输出任何多余废话。`;

  const userPrompt = `大陆片名：《${params.title}》
原名/外文名：${params.originalName || '未知'}
上映年份：${params.year || '2026'}`;

  const raw = await callAiCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: params.model,
    temperature: 0.3,
    maxTokens: 1000,
  });

  try {
    const cleanJson = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return {
      taiwanTitle: params.title,
      hongkongTitle: params.title,
      traditionalTitle: params.title,
      traditionalMetaDescription: `【4K線上看】《${params.title}》完整版高清免翻牆極速播放。iKanPP 全球 Anycast CDN 直連，零廣告零緩衝，即刻享受極致影音！`,
      searchAliases: [params.title, `${params.title} 線上看`, `${params.title} 4K`],
    };
  }
}

/**
 * ============================================================================
 * 场景 6：工业级单次全量生成 (One-Shot Comprehensive Generator)
 * 1 次网络请求同时生成 Hook、独家影评、三大看点、演技点评、受众画像、4组FAQ与港台公映译名！
 * ============================================================================
 */
export async function generateAiComprehensiveInsights(params: {
  title: string;
  type: string;
  year?: string;
  overview?: string;
  genres?: string[];
  cast?: string[];
  model?: string;
}): Promise<{
  hook: string;
  uniqueSynopsis: string;
  highlights: string[];
  characterAnalysis: string;
  audienceFit: string;
  faqs: Array<{ question: string; answer: string }>;
  taiwanTitle: string;
  hongkongTitle: string;
}> {
  const systemPrompt = `你是一位精通华语影视工业与国际顶级搜索引擎算法的资深策展人兼架构师。
请针对给定的影视作品，撰写一段 100% 全网独家原创、文笔老练犀利的独家深度剧情剖析、高光看点，以及海外华人 Google 搜索高频 FAQ 问答胶囊与港台公映译名。

必须直接输出严格合法的 JSON 格式，字段定义如下：
{
  "hook": "15~25字极具悬念与冲击力的一句话观影金句（用于Google搜索结果首句抓人）",
  "uniqueSynopsis": "300~450字的独家剧情高光深度剖析，深入人性博弈与时代宿命，严禁复述官方公关简介",
  "highlights": ["核心看点1 (15~25字)", "核心看点2 (15~25字)", "核心看点3 (15~25字)"],
  "characterAnalysis": "120~180字的主演演技与角色心理博弈深度点评",
  "audienceFit": "适宜受众画像（如：硬核推理迷、年代历史爱好者、情感共鸣者等）",
  "faqs": [
    {
      "question": "在海外如何免翻墙流畅观看《${params.title}》4K超清完整版？",
      "answer": "您可以在 iKanPP (爱看片片) 直接直连观看。平台在全球部署 Anycast 边缘 CDN，海外北美、欧洲、澳洲均可实现 0 缓冲秒开，且全站无弹窗广告。"
    },
    {
      "question": "《${params.title}》的核心剧情亮点与反转看点是什么？",
      "answer": "解答2（围绕真实剧情亮点生动展开，50~80字）"
    },
    {
      "question": "《${params.title}》的画质规格与更新进度如何？",
      "answer": "平台提供 1080P/4K 超清画质版本，与国内各大平台官方保持实时同步更新，支持移动端 PWA 桌面离线直达。"
    },
    {
      "question": "《${params.title}》值得看吗？真实观众口碑如何？",
      "answer": "解答4（客观专业的口碑评价与观影防坑建议，50~80字）"
    }
  ],
  "taiwanTitle": "台湾正式公映译名（如无特殊译名则为标准正体）",
  "hongkongTitle": "香港正式公映译名（符合粤语上映习惯）"
}
注意：只输出合法的纯 JSON 文本，不要包含任何多余文字或 Markdown 包裹。`;

  const userPrompt = `影视名称：《${params.title}》
类型：${params.type === 'tv' ? '电视剧' : '院线电影'}
上映年份：${params.year || '2024'}
剧情简介：${params.overview || '暂无详细简介'}
主要演员：${(params.cast || []).slice(0, 5).join('、') || '实力派阵容'}
题材分类：${(params.genres || []).join('、') || '精选大作'}`;

  try {
    const raw = await callAiCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: params.model || DEFAULT_MODEL,
      temperature: 0.6,
      maxTokens: 2500,
    });

    const parsed = extractJson<{
      hook?: string;
      uniqueSynopsis?: string;
      highlights?: string[];
      characterAnalysis?: string;
      audienceFit?: string;
      faqs?: Array<{ question: string; answer: string }>;
      taiwanTitle?: string;
      hongkongTitle?: string;
    }>(raw);

    return {
      hook: parsed.hook || `《${params.title}》：在时代巨浪与命运漩涡中，展开令人屏息的博弈。`,
      uniqueSynopsis: parsed.uniqueSynopsis || `${params.title} 是一部兼具叙事张力与视听冲击力的重磅佳作。`,
      highlights: parsed.highlights && parsed.highlights.length >= 3 ? parsed.highlights : [
        '高能剧情推进与极致视听震撼',
        '实力派主创倾力呈现角色弧光',
        '海外 Anycast 4K 纯直连秒开',
      ],
      characterAnalysis: parsed.characterAnalysis || '主演扎实细腻的表演赋予角色极强的心理博弈张力。',
      audienceFit: parsed.audienceFit || '推荐给所有偏好快节奏、硬派视听与高质量电影工业叙事的全球影迷。',
      faqs: parsed.faqs && parsed.faqs.length >= 4 ? parsed.faqs : [
        {
          question: `在海外如何免翻墙流畅观看《${params.title}》4K超清完整版？`,
          answer: `您可以在 iKanPP (爱看片片) 直接直连观看。平台在全球部署 Anycast 边缘 CDN，海外北美、欧洲、澳洲均可实现 0 缓冲秒开，且全站无弹窗广告。`,
        },
        {
          question: `《${params.title}》的画质与更新进度如何？`,
          answer: `平台提供 1080P/4K 超清画质版本，与国内各大平台官方保持实时同步更新，支持移动端 PWA 桌面离线直达。`,
        },
        {
          question: `《${params.title}》值得看吗？有哪些精彩看点？`,
          answer: `本片叙事紧凑、反转连连，实力派主演阵容在危机与博弈中展现出极高水准，口碑热度持续霸榜。`,
        },
        {
          question: `iKanPP 观看《${params.title}》需要会员充值或看广告吗？`,
          answer: `无需充值会员，100% 拒绝任何低俗博彩贴片与诱导弹窗，真正还原院线级纯净视听体验。`,
        },
      ],
      taiwanTitle: parsed.taiwanTitle || params.title,
      hongkongTitle: parsed.hongkongTitle || params.title,
    };
  } catch (err: any) {
    console.warn(`[generateAiComprehensiveInsights fallback] ${params.title}:`, err?.message);
    return {
      hook: `《${params.title}》：在时代巨浪与命运漩涡中，展开令人屏息的博弈。`,
      uniqueSynopsis: `${params.title} 是一部兼具叙事张力与视听冲击力的重磅佳作。剧情跌宕起伏，危机四伏中层层展开扣人心弦的命运交织。`,
      highlights: ['高能剧情推进与极致视听震撼', '实力派主创倾力呈现角色弧光', '海外 Anycast 4K 纯直连秒开'],
      characterAnalysis: '主演通过扎实而极具沉浸感的表演，将危机漩涡中的心理博弈与决绝信念演绎得淋漓尽致。',
      audienceFit: '推荐给所有偏好快节奏、硬派视听与高质量电影工业叙事的全球影迷。',
      faqs: [
        {
          question: `在海外如何免翻墙流畅观看《${params.title}》4K超清完整版？`,
          answer: `您可以在 iKanPP (爱看片片) 直接直连观看。平台在全球部署 Anycast 边缘 CDN，海外北美、欧洲、澳洲均可实现 0 缓冲秒开，且全站无弹窗广告。`,
        },
        {
          question: `《${params.title}》的画质与更新进度如何？`,
          answer: `平台提供 1080P/4K 超清画质版本，与国内各大平台官方保持实时同步更新，支持移动端 PWA 桌面离线直达。`,
        },
        {
          question: `《${params.title}》值得看吗？有哪些精彩看点？`,
          answer: `本片叙事紧凑、反转连连，实力派主演阵容在危机与博弈中展现出极高水准，口碑热度持续霸榜。`,
        },
        {
          question: `iKanPP 观看《${params.title}》需要会员充值或看广告吗？`,
          answer: `无需充值会员，100% 拒绝任何低俗博彩贴片与诱导弹窗，真正还原院线级纯净视听体验。`,
        },
      ],
      taiwanTitle: params.title,
      hongkongTitle: params.title,
    };
  }
}

