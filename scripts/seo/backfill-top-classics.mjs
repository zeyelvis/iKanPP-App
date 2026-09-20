/**
 * 头部经典影视 Top 50 批量回填中枢 (Backfill Top Classics)
 * 
 * 落地「二八定律·金字塔分层策略」基座层：
 * 为全网搜索权重最高、海外华人高频查询的 Top 50 经典影视神作
 * 批量生成并注入：
 * 1. 独家原创深度影评与 3 大高光看点 (场景 1)
 * 2. Google FAQPage 结构化问答胶囊 (场景 2)
 * 3. 港台正式公映译名与本地化关键词 (场景 5)
 */

import { kvGet, kvPut, saveEntity, getEntityByTitle, getEntityById } from '../../lib/services/entity-kv.js';
import { generateAiUniqueReview, generateAiFaq, generateAiLocalization } from '../../lib/services/ai-seo.js';
import { PREBAKED_HOME_DATA } from '../../lib/data/home-prebaked.js';

const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';

// 全网最高搜索量、高分常青华语与影史经典名单 (Top 50)
const TARGET_CLASSICS = [
  // 电视剧顶级头部
  { title: '繁花', type: 'tv', year: '2023', genres: ['剧情', '爱情'] },
  { title: '漫长的季节', type: 'tv', year: '2023', genres: ['悬疑', '剧情', '犯罪'] },
  { title: '狂飙', type: 'tv', year: '2023', genres: ['剧情', '犯罪'] },
  { title: '三体', type: 'tv', year: '2023', genres: ['科幻', '剧情'] },
  { title: '庆余年', type: 'tv', year: '2019', genres: ['古装', '权谋', '穿越'] },
  { title: '庆余年 第二季', type: 'tv', year: '2024', genres: ['古装', '权谋'] },
  { title: '琅琊榜', type: 'tv', year: '2015', genres: ['古装', '权谋', '剧情'] },
  { title: '甄嬛传', type: 'tv', year: '2011', genres: ['古装', '宫斗', '剧情'] },
  { title: '白夜追凶', type: 'tv', year: '2017', genres: ['悬疑', '刑侦', '犯罪'] },
  { title: '隐秘的角落', type: 'tv', year: '2020', genres: ['悬疑', '剧情', '犯罪'] },
  { title: '沉默的真相', type: 'tv', year: '2020', genres: ['悬疑', '犯罪', '剧情'] },
  { title: '武林外传', type: 'tv', year: '2006', genres: ['喜剧', '古装', '武侠'] },
  { title: '潜伏', type: 'tv', year: '2009', genres: ['谍战', '悬疑', '剧情'] },
  { title: '大明王朝1566', type: 'tv', year: '2007', genres: ['历史', '古装', '权谋'] },
  { title: '走向共和', type: 'tv', year: '2003', genres: ['历史', '剧情'] },
  { title: '父母爱情', type: 'tv', year: '2014', genres: ['家庭', '情感', '时代'] },
  { title: '去有风的地方', type: 'tv', year: '2023', genres: ['剧情', '治愈', '爱情'] },
  { title: '人世间', type: 'tv', year: '2022', genres: ['年代', '剧情', '家庭'] },
  { title: '山海情', type: 'tv', year: '2021', genres: ['时代', '脱贫', '剧情'] },
  { title: '开端', type: 'tv', year: '2022', genres: ['时间循环', '悬疑', '科幻'] },
  { title: '梦华录', type: 'tv', year: '2022', genres: ['古装', '爱情', '女性'] },
  { title: '苍兰诀', type: 'tv', year: '2022', genres: ['古装', '仙侠', '爱情'] },
  { title: '莲花楼', type: 'tv', year: '2023', genres: ['武侠', '悬疑', '古装'] },
  { title: '唐朝诡事录', type: 'tv', year: '2022', genres: ['悬疑', '古装', '探案'] },
  { title: '我的阿勒泰', type: 'tv', year: '2024', genres: ['自然', '治愈', '剧情'] },
  { title: '知否知否应是绿肥红瘦', type: 'tv', year: '2018', genres: ['古装', '家庭', '爱情'] },
  { title: '觉醒年代', type: 'tv', year: '2021', genres: ['历史', '革命', '剧情'] },
  { title: '扫黑风暴', type: 'tv', year: '2021', genres: ['刑侦', '犯罪', '剧情'] },
  { title: '警察荣誉', type: 'tv', year: '2022', genres: ['现实', '警察', '剧情'] },
  { title: '亮剑', type: 'tv', year: '2005', genres: ['战争', '抗战', '军旅'] },

  // 电影顶级头部
  { title: '流浪地球2', type: 'movie', year: '2023', genres: ['科幻', '灾难', '动作'] },
  { title: '流浪地球', type: 'movie', year: '2019', genres: ['科幻', '灾难', '冒险'] },
  { title: '无间道', type: 'movie', year: '2002', genres: ['犯罪', '悬疑', '经典'] },
  { title: '霸王别姬', type: 'movie', year: '1993', genres: ['剧情', '爱情', '音乐'] },
  { title: '让子弹飞', type: 'movie', year: '2010', genres: ['剧情', '喜剧', '动作'] },
  { title: '大话西游之大圣娶亲', type: 'movie', year: '1995', genres: ['喜剧', '爱情', '奇幻'] },
  { title: '我不是药神', type: 'movie', year: '2018', genres: ['剧情', '喜剧', '现实'] },
  { title: '卧虎藏龙', type: 'movie', year: '2000', genres: ['武侠', '剧情', '动作'] },
  { title: '封神第一部：朝歌风云', type: 'movie', year: '2023', genres: ['奇幻', '神话', '史诗'] },
  { title: '长安三万里', type: 'movie', year: '2023', genres: ['动画', '历史', '诗意'] },
  { title: '哪吒之魔童降世', type: 'movie', year: '2019', genres: ['动画', '神话', '奇幻'] },
  { title: '满江红', type: 'movie', year: '2023', genres: ['悬疑', '喜剧', '古装'] },
  { title: '孤注一掷', type: 'movie', year: '2023', genres: ['犯罪', '反诈', '剧情'] },
  { title: '消失的她', type: 'movie', year: '2023', genres: ['悬疑', '反转', '犯罪'] },
  { title: '年会不能停！', type: 'movie', year: '2023', genres: ['喜剧', '职场', '讽刺'] },
  { title: '第二十条', type: 'movie', year: '2024', genres: ['现实', '法律', '喜剧'] },
  { title: '九龙城寨之围城', type: 'movie', year: '2024', genres: ['动作', '犯罪', '港风'] },
  { title: '星际穿越', type: 'movie', year: '2014', genres: ['科幻', '冒险', '太空'] },
  { title: '盗梦空间', type: 'movie', year: '2010', genres: ['科幻', '悬疑', '烧脑'] },
  { title: '绿皮书', type: 'movie', year: '2018', genres: ['剧情', '喜剧', '公路'] },
];

/**
 * 寻找或构造实体
 */
async function resolveOrCreateEntity(item) {
  // 1. 尝试直接按片名反查实体
  let entity = await getEntityByTitle(item.title);
  if (entity) return entity;

  // 2. 检查是否有带书名号或别名
  const idFromTitle = await kvGet(`title:${item.title}`);
  if (idFromTitle) {
    const raw = await kvGet(`entity:${idFromTitle}`);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
  }

  // 3. 从预烘焙首页大厅提取素材
  const homeCategory = item.type === 'tv' ? PREBAKED_HOME_DATA.tv : PREBAKED_HOME_DATA.movie;
  let matchedHome = null;
  if (homeCategory) {
    for (const group of Object.values(homeCategory)) {
      if (Array.isArray(group)) {
        const found = group.find(s => s.title === item.title || s.title.includes(item.title));
        if (found) {
          matchedHome = found;
          break;
        }
      }
    }
  }

  // 4. 构造标准实体
  const entityId = `ik_classic_${Buffer.from(item.title).toString('hex').slice(0, 8)}`;
  const slug = `${item.title.toLowerCase().replace(/\s+/g, '-')}`;
  return {
    entityId,
    title: item.title,
    slug,
    canonicalSlug: `${entityId}-${slug}`,
    type: item.type,
    year: item.year,
    rate: matchedHome?.rate || '9.2',
    description: matchedHome?.desc || `《${item.title}》全集4K高清完整版在线免费看。华语经典影视神作，iKanPP 全球 Anycast CDN 直连零缓冲。`,
    cover: matchedHome?.cover || 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop: matchedHome?.backdrop || matchedHome?.cover,
    genres: item.genres,
    directors: [],
    actors: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function processTitle(item, index, total) {
  const startTime = Date.now();
  console.log(`\n🎬 [${index + 1}/${total}] 正在处理：《${item.title}》 (${item.year} · ${item.type === 'tv' ? '电视剧' : '电影'})...`);

  try {
    const entity = await resolveOrCreateEntity(item);

    // 幂等性检查：若已具备独家影评且 FAQ >= 3，直接跳过
    if (entity.aiContent?.uniqueSynopsis && entity.aiContent?.faqs?.length >= 3) {
      console.log(`  ⏩ 《${item.title}》已具备高保真 AI 资产，自动跳过（节省算力）`);
      return { status: 'skipped', title: item.title };
    }

    // 并行调用三大 AI 场景
    const [reviewData, faqData, localizeData] = await Promise.all([
      generateAiUniqueReview({
        title: item.title,
        type: item.type,
        overview: entity.description,
        genres: item.genres,
        model: AI_MODEL,
      }).catch(err => {
        console.warn(`    ⚠️ 影评生成异常:`, err.message);
        return null;
      }),
      generateAiFaq({
        title: item.title,
        type: item.type,
        overview: entity.description,
        model: 'gpt-5.6-terra',
      }).catch(err => {
        console.warn(`    ⚠️ FAQ 生成异常:`, err.message);
        return null;
      }),
      generateAiLocalization({
        title: item.title,
        year: item.year,
        model: 'gpt-5.6-terra',
      }).catch(err => {
        console.warn(`    ⚠️ 港台译名异常:`, err.message);
        return null;
      }),
    ]);

    // 合并写入实体模型
    entity.aiContent = {
      ...(entity.aiContent || {}),
      ...(reviewData || {}),
      faqs: faqData?.faqs || entity.aiContent?.faqs,
      taiwanTitle: localizeData?.taiwanTitle || entity.aiContent?.taiwanTitle,
      hongkongTitle: localizeData?.hongkongTitle || entity.aiContent?.hongkongTitle,
      traditionalMetaDescription: localizeData?.traditionalMetaDescription || entity.aiContent?.traditionalMetaDescription,
      traditionalKeywords: localizeData?.traditionalKeywords || entity.aiContent?.traditionalKeywords,
      generatedAt: new Date().toISOString(),
    };

    const aliases = new Set(entity.aliases || []);
    if (localizeData?.taiwanTitle) aliases.add(localizeData.taiwanTitle.trim());
    if (localizeData?.hongkongTitle) aliases.add(localizeData.hongkongTitle.trim());
    entity.aliases = Array.from(aliases);
    entity.updatedAt = new Date().toISOString();

    // 持久化到 Cloudflare KV
    await saveEntity(entity);

    const costSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✅ 《${item.title}》回填成功！耗时: ${costSec}s`);
    if (localizeData?.taiwanTitle) console.log(`     🇹🇼 台湾译名: ${localizeData.taiwanTitle}`);
    if (localizeData?.hongkongTitle) console.log(`     🇭🇰 香港译名: ${localizeData.hongkongTitle}`);
    console.log(`     📝 FAQ 问答数: ${entity.aiContent.faqs?.length || 0} 条`);
    console.log(`     ✨ 剧情核心看点: ${entity.aiContent.highlights?.length || 0} 条`);

    return { status: 'success', title: item.title, costSec };
  } catch (err) {
    console.error(`  ❌ 《${item.title}》回填失败:`, err.message);
    return { status: 'error', title: item.title, error: err.message };
  }
}

async function main() {
  console.log('================================================================');
  console.log('🚀 启动全网 Top 50 黄金经典老作 AI 资产全量回填流水线');
  console.log(`🎯 目标条目数: ${TARGET_CLASSICS.length} 部`);
  console.log(`🧠 主模型: ${AI_MODEL} (影评) + gpt-5.6-terra (FAQ与译名)`);
  console.log('================================================================');

  const results = { success: 0, skipped: 0, error: 0 };
  const total = TARGET_CLASSICS.length;

  for (let i = 0; i < total; i++) {
    const res = await processTitle(TARGET_CLASSICS[i], i, total);
    results[res.status]++;

    // 轻微防抖，防止突发流量
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n================================================================');
  console.log('🎉 头部经典老作回填任务圆满完成！统计报表：');
  console.log(`  - 成功回填写入: ${results.success} 部`);
  console.log(`  - 原本已存在跳过: ${results.skipped} 部`);
  console.log(`  - 异常失败: ${results.error} 部`);
  console.log('================================================================\n');
}

main().catch(console.error);
