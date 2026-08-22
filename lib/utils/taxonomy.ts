/**
 * 统一影视分类中枢 (Universal Video Taxonomy & Normalization Engine)
 *
 * 彻底解决 56 个上游采集源返回分类混乱、错别字、以及粗暴截断产生“国产”、“连续”、“纪录”等残缺词的问题。
 */

export interface NormalizedTypeInfo {
  // 一级主分类
  category: 'movie' | 'tv' | 'guoman' | 'anime' | 'variety' | 'documentary' | 'short';
  // 标准二级类型名称（如：国产剧、美剧、国漫、动作片、科幻片）
  standardType: string;
  // 前端角标展示文本（最精炼、美观的 2~4 字标签）
  badge: string;
}

// 1. 标准二级分类别名映射字典
const TYPE_ALIAS_MAP: Record<string, { category: NormalizedTypeInfo['category']; standardType: string; badge: string }> = {
  // ── 电视剧大类 ──
  '国产剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '大陆剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '内地剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '国产电视剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '华语剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '华语电视剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '大陆电视剧': { category: 'tv', standardType: '国产剧', badge: '国产剧' },
  '连续剧': { category: 'tv', standardType: '国产剧', badge: '电视剧' },
  '电视剧': { category: 'tv', standardType: '国产剧', badge: '电视剧' },
  '国产': { category: 'tv', standardType: '国产剧', badge: '国产剧' },

  '美剧': { category: 'tv', standardType: '美剧', badge: '美剧' },
  '欧美剧': { category: 'tv', standardType: '美剧', badge: '美剧' },
  '欧美电视剧': { category: 'tv', standardType: '美剧', badge: '美剧' },
  '海外剧': { category: 'tv', standardType: '美剧', badge: '欧美剧' },
  '美剧全集': { category: 'tv', standardType: '美剧', badge: '美剧' },

  '韩剧': { category: 'tv', standardType: '韩剧', badge: '韩剧' },
  '韩国剧': { category: 'tv', standardType: '韩剧', badge: '韩剧' },
  '日韩剧': { category: 'tv', standardType: '韩剧', badge: '韩剧' },
  '韩国电视剧': { category: 'tv', standardType: '韩剧', badge: '韩剧' },

  '日剧': { category: 'tv', standardType: '日剧', badge: '日剧' },
  '日本剧': { category: 'tv', standardType: '日剧', badge: '日剧' },
  '日本电视剧': { category: 'tv', standardType: '日剧', badge: '日剧' },

  '港剧': { category: 'tv', standardType: '港剧', badge: '港剧' },
  '香港剧': { category: 'tv', standardType: '港剧', badge: '港剧' },
  'TVB': { category: 'tv', standardType: '港剧', badge: '港剧' },
  '港台剧': { category: 'tv', standardType: '港剧', badge: '港剧' },
  '香港电视剧': { category: 'tv', standardType: '港剧', badge: '港剧' },

  '台剧': { category: 'tv', standardType: '台剧', badge: '台剧' },
  '台湾剧': { category: 'tv', standardType: '台剧', badge: '台剧' },
  '台湾电视剧': { category: 'tv', standardType: '台剧', badge: '台剧' },

  '英剧': { category: 'tv', standardType: '英剧', badge: '英剧' },
  '英国剧': { category: 'tv', standardType: '英剧', badge: '英剧' },
  '泰剧': { category: 'tv', standardType: '泰剧', badge: '泰剧' },
  '泰国剧': { category: 'tv', standardType: '泰剧', badge: '泰剧' },

  // ── 动漫大类 (细分为 国漫 / 日漫) ──
  '国创': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },
  '国漫': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },
  '国产动漫': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },
  '国产动画': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },
  '大陆动漫': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },
  '国漫年番': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },
  '修仙': { category: 'guoman', standardType: '国创动漫', badge: '国漫' },

  '日漫': { category: 'anime', standardType: '日本动漫', badge: '新番' },
  '日本动漫': { category: 'anime', standardType: '日本动漫', badge: '新番' },
  '日本动画': { category: 'anime', standardType: '日本动漫', badge: '新番' },
  '新番': { category: 'anime', standardType: '日本动漫', badge: '新番' },
  '新番连载': { category: 'anime', standardType: '日本动漫', badge: '新番' },
  '动漫': { category: 'anime', standardType: '动漫', badge: '动漫' },
  '动画': { category: 'anime', standardType: '动漫', badge: '动漫' },
  '动漫片': { category: 'anime', standardType: '动漫', badge: '动漫' },

  // ── 电影大类 ──
  '电影': { category: 'movie', standardType: '电影', badge: '电影' },
  '故事片': { category: 'movie', standardType: '电影', badge: '电影' },
  '动作片': { category: 'movie', standardType: '动作片', badge: '动作' },
  '动作': { category: 'movie', standardType: '动作片', badge: '动作' },
  '喜剧片': { category: 'movie', standardType: '喜剧片', badge: '喜剧' },
  '喜剧': { category: 'movie', standardType: '喜剧片', badge: '喜剧' },
  '爱情片': { category: 'movie', standardType: '爱情片', badge: '爱情' },
  '爱情': { category: 'movie', standardType: '爱情片', badge: '爱情' },
  '科幻片': { category: 'movie', standardType: '科幻片', badge: '科幻' },
  '科幻': { category: 'movie', standardType: '科幻片', badge: '科幻' },
  '悬疑片': { category: 'movie', standardType: '悬疑片', badge: '悬疑' },
  '悬疑': { category: 'movie', standardType: '悬疑片', badge: '悬疑' },
  '犯罪片': { category: 'movie', standardType: '犯罪片', badge: '犯罪' },
  '犯罪': { category: 'movie', standardType: '犯罪片', badge: '犯罪' },
  '恐怖片': { category: 'movie', standardType: '恐怖片', badge: '恐怖' },
  '恐怖': { category: 'movie', standardType: '恐怖片', badge: '恐怖' },
  '惊悚片': { category: 'movie', standardType: '惊悚片', badge: '惊悚' },
  '惊悚': { category: 'movie', standardType: '惊悚片', badge: '惊悚' },
  '战争片': { category: 'movie', standardType: '战争片', badge: '战争' },
  '战争': { category: 'movie', standardType: '战争片', badge: '战争' },
  '奇幻片': { category: 'movie', standardType: '奇幻片', badge: '奇幻' },
  '奇幻': { category: 'movie', standardType: '奇幻片', badge: '奇幻' },
  '冒险片': { category: 'movie', standardType: '冒险片', badge: '冒险' },
  '冒险': { category: 'movie', standardType: '冒险片', badge: '冒险' },
  '剧情片': { category: 'movie', standardType: '剧情片', badge: '剧情' },
  '剧情': { category: 'movie', standardType: '剧情片', badge: '剧情' },
  '动画片': { category: 'movie', standardType: '动画电影', badge: '动画' },
  '动画电影': { category: 'movie', standardType: '动画电影', badge: '动画' },

  // ── 综艺大类 ──
  '综艺': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '综艺片': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '大陆综艺': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '国内综艺': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '港台综艺': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '日韩综艺': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '欧美综艺': { category: 'variety', standardType: '综艺', badge: '综艺' },
  '真人秀': { category: 'variety', standardType: '综艺', badge: '真人秀' },
  '脱口秀': { category: 'variety', standardType: '综艺', badge: '脱口秀' },

  // ── 纪录片 ──
  '纪录片': { category: 'documentary', standardType: '纪录片', badge: '纪录片' },
  '纪录': { category: 'documentary', standardType: '纪录片', badge: '纪录片' },
  '记录片': { category: 'documentary', standardType: '纪录片', badge: '纪录片' },
  '纪实': { category: 'documentary', standardType: '纪录片', badge: '纪录片' },

  // ── 短剧 ──
  '短剧': { category: 'short', standardType: '短剧', badge: '短剧' },
  '微短剧': { category: 'short', standardType: '短剧', badge: '短剧' },
  '爽剧': { category: 'short', standardType: '短剧', badge: '短剧' },
  '男频短剧': { category: 'short', standardType: '短剧', badge: '短剧' },
  '女频短剧': { category: 'short', standardType: '短剧', badge: '短剧' },
};

// 2. 脏标签黑名单（完全不是分类，直接过滤抛弃）
const NOISE_LABELS = new Set([
  '蓝光', '4K', '4k', '1080P', '1080p', '720p', '极速', '标清', '超清', '高清',
  '预告', '预告片', '花絮', '片段', '测试', 'VIP', 'vip', '福利', '伦理', '写真',
  '抢先版', 'HD', 'TC', 'TS', '正片', '单片', '全集', '更新至', '未知',
]);

/**
 * 智能类型清洗与归一化函数
 */
export function normalizeVideoType(rawType?: string, vodName: string = ''): NormalizedTypeInfo {
  // 判断片名是否为剧集特征（第X季、第X集、第X期、全X集、更新至X集）
  const isTvEpisode = /第[0-9一二三四五六七八九十]+[季集期话]/.test(vodName) || 
                      /全[0-9]+[集话期]/.test(vodName) || 
                      /更新至[0-9]+/.test(vodName);

  if (!rawType || typeof rawType !== 'string') {
    // 根据片名特征猜测
    if (isTvEpisode) {
      return { category: 'tv', standardType: '电视剧', badge: '电视剧' };
    }
    return { category: 'movie', standardType: '电影', badge: '电影' };
  }

  // 去除首尾与中间空格
  const cleanRaw = rawType.replace(/\s+/g, '').trim();

  // 如果命中了纯噪音词（如“4K”、“极速”），根据片名做兜底
  if (NOISE_LABELS.has(cleanRaw)) {
    if (isTvEpisode) {
      return { category: 'tv', standardType: '电视剧', badge: '电视剧' };
    }
    return { category: 'movie', standardType: '电影', badge: '电影' };
  }

  // 精准匹配字典
  if (TYPE_ALIAS_MAP[cleanRaw]) {
    return TYPE_ALIAS_MAP[cleanRaw];
  }

  // 模糊匹配逻辑（按优先级由高到低）
  if (cleanRaw.includes('国漫') || cleanRaw.includes('国创') || cleanRaw.includes('修仙')) {
    return { category: 'guoman', standardType: '国创动漫', badge: '国漫' };
  }
  if (cleanRaw.includes('新番') || cleanRaw.includes('日漫') || cleanRaw.includes('日本动漫')) {
    return { category: 'anime', standardType: '日本动漫', badge: '新番' };
  }
  if (cleanRaw.includes('动漫') || cleanRaw.includes('动画')) {
    return { category: 'anime', standardType: '动漫', badge: '动漫' };
  }
  if (cleanRaw.includes('综艺') || cleanRaw.includes('真人秀') || cleanRaw.includes('脱口秀')) {
    return { category: 'variety', standardType: '综艺', badge: '综艺' };
  }
  if (cleanRaw.includes('纪录') || cleanRaw.includes('记录')) {
    return { category: 'documentary', standardType: '纪录片', badge: '纪录片' };
  }
  if (cleanRaw.includes('短剧')) {
    return { category: 'short', standardType: '短剧', badge: '短剧' };
  }

  // 电视剧子类模糊识别
  if (cleanRaw.includes('美剧') || cleanRaw.includes('欧美剧') || cleanRaw.includes('海外剧')) {
    return { category: 'tv', standardType: '美剧', badge: '美剧' };
  }
  if (cleanRaw.includes('韩剧') || cleanRaw.includes('韩国剧')) {
    return { category: 'tv', standardType: '韩剧', badge: '韩剧' };
  }
  if (cleanRaw.includes('日剧') || cleanRaw.includes('日本剧')) {
    return { category: 'tv', standardType: '日剧', badge: '日剧' };
  }
  if (cleanRaw.includes('港剧') || cleanRaw.includes('香港') || cleanRaw.includes('TVB') || cleanRaw.includes('港台')) {
    return { category: 'tv', standardType: '港剧', badge: '港剧' };
  }
  if (cleanRaw.includes('台剧') || cleanRaw.includes('台湾')) {
    return { category: 'tv', standardType: '台剧', badge: '台剧' };
  }
  if (cleanRaw.includes('泰剧')) {
    return { category: 'tv', standardType: '泰剧', badge: '泰剧' };
  }
  if (cleanRaw.includes('国产') || cleanRaw.includes('大陆') || cleanRaw.includes('内地') || cleanRaw.includes('华语') || cleanRaw.includes('剧集') || cleanRaw.includes('电视剧') || cleanRaw.includes('连续剧')) {
    return { category: 'tv', standardType: '国产剧', badge: '国产剧' };
  }

  // 电影子类模糊识别
  if (cleanRaw.includes('动作')) return { category: 'movie', standardType: '动作片', badge: '动作' };
  if (cleanRaw.includes('喜剧') || cleanRaw.includes('搞笑')) return { category: 'movie', standardType: '喜剧片', badge: '喜剧' };
  if (cleanRaw.includes('爱情') || cleanRaw.includes('浪漫')) return { category: 'movie', standardType: '爱情片', badge: '爱情' };
  if (cleanRaw.includes('科幻')) return { category: 'movie', standardType: '科幻片', badge: '科幻' };
  if (cleanRaw.includes('悬疑') || cleanRaw.includes('推理')) return { category: 'movie', standardType: '悬疑片', badge: '悬疑' };
  if (cleanRaw.includes('犯罪') || cleanRaw.includes('警匪')) return { category: 'movie', standardType: '犯罪片', badge: '犯罪' };
  if (cleanRaw.includes('恐怖') || cleanRaw.includes('惊悚')) return { category: 'movie', standardType: '恐怖片', badge: '恐怖' };
  if (cleanRaw.includes('战争') || cleanRaw.includes('军旅')) return { category: 'movie', standardType: '战争片', badge: '战争' };
  if (cleanRaw.includes('奇幻') || cleanRaw.includes('玄幻') || cleanRaw.includes('魔幻')) return { category: 'movie', standardType: '奇幻片', badge: '奇幻' };
  if (cleanRaw.includes('冒险')) return { category: 'movie', standardType: '冒险片', badge: '冒险' };
  if (cleanRaw.includes('剧情') || cleanRaw.includes('文艺')) return { category: 'movie', standardType: '剧情片', badge: '剧情' };
  if (cleanRaw.includes('电影') || cleanRaw.includes('影院')) return { category: 'movie', standardType: '电影', badge: '电影' };

  // 最终兜底：如果字符串长度大于等于2且小于6，直接作为干净的标签，否则根据片名特征判断
  if (cleanRaw.length >= 2 && cleanRaw.length <= 4) {
    return { category: 'movie', standardType: cleanRaw, badge: cleanRaw };
  }

  return { category: 'movie', standardType: '电影', badge: '电影' };
}
