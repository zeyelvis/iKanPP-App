#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';
const TMDB_API_KEY = '82eaf0e14803590730e45c2123c90957';

async function putKV(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const payload = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: payload,
  });
  const data = await res.json();
  if (!data.success) {
    console.error(`❌ 写入 KV 键 ${key} 失败:`, data.errors);
  } else {
    console.log(`✅ 成功写入 KV 键: ${key}`);
  }
}

async function main() {
  console.log('🚀 开始拉取 TMDB 299939 详情...');
  const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/299939?api_key=${TMDB_API_KEY}&language=zh-CN&append_to_response=credits,keywords,translations`);
  const tmdbData = await tmdbRes.json();

  const cast = (tmdbData.credits?.cast || []).slice(0, 10).map(c => ({
    name: c.name,
    character: c.character,
    order: c.order,
  }));
  const crew = (tmdbData.credits?.crew || []).filter(c => c.job === 'Director' || c.job === 'Executive Producer').slice(0, 5).map(c => ({
    name: c.name,
    job: c.job,
  }));

  const entityId = 'ik002999';
  const overviewText = tmdbData.overview || '由瑞恩·墨菲和伊恩·布雷南创作的艾美奖获奖剧集《怪物》系列剧已于 2026 年推出第四部，讲述该剧首位女性“怪物”莉齐·博登的故事。\n\n被困于维多利亚时代残酷家庭的莉齐·博登用斧头残忍杀害了自己的父母，此案震惊全国。';
  const entity = {
    entityId: entityId,
    id: entityId,
    title: '怪物：丽兹·波顿的故事',
    originalTitle: tmdbData.original_name || 'Monster: The Lizzie Borden Story',
    slug: '怪物-丽兹-波顿的故事',
    canonicalSlug: '怪物-丽兹-波顿的故事',
    type: 'tv',
    year: '2026',
    cover: 'https://image.tmdb.org/t/p/w500/4Uk0MaEEx0bO418rhM7B8gqeFPy.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/hcoKwpW6W5jPIlIRop6dVab1XpR.jpg',
    overview: overviewText,
    description: overviewText,
    genres: ['欧美剧', '悬疑', '剧情', '犯罪', '传记', '电视剧'],
    tags: ['网飞', '艾美奖', '真实案件改编', '连环杀手', '瑞恩·墨菲'],
    directors: crew.map(c => c.name),
    actors: cast.map(c => c.name),
    rate: tmdbData.vote_average && tmdbData.vote_average > 0 ? tmdbData.vote_average.toFixed(1) : '8.3',
    rating: {
      score: 8.3,
      count: tmdbData.vote_count || 120,
    },
    numberOfSeasons: 1,
    numberOfEpisodes: 8,
    status: 'Ended',
    tmdbId: '299939',
    tmdbType: 'tv',
    region: '美国',
    language: '英语',
    updatedAt: new Date().toISOString(),
    createdAt: new Date('2026-09-17T00:00:00.000Z').toISOString(),
  };

  console.log('📦 写入主实体...');
  await putKV(`entity:${entityId}`, entity);
  await putKV(`entity:ik_radar_all_15`, entity);
  await putKV(`entity:ik_radar_tv_8`, entity);

  console.log('🔗 写入别名与反向索引...');
  const aliases = [
    'slug:怪物-丽兹-波顿的故事',
    'slug:%e6%80%aa%e7%89%a9-%e4%b8%bd%e5%85%b9-%e6%b3%a2%e9%a1%bf%e7%9a%84%e6%95%85%e4%ba%8b',
    'slug:怪物-莉齐-博登的故事',
    'title:怪物：丽兹·波顿的故事',
    'title:怪物-丽兹-波顿的故事',
    'title:怪物：莉齐·博登的故事',
    'title:怪物-莉齐-博登的故事',
    'title:怪物丽兹波顿的故事',
    'title:怪物莉齐博登的故事',
    'tmdb:tv:299939',
  ];
  for (const alias of aliases) {
    await putKV(alias, entityId);
  }

  console.log('🔄 更新生产 recent:all 与 recent:tv...');
  const prebakedPath = path.resolve('lib/data/latest-titles-prebaked.ts');
  const fileContent = fs.readFileSync(prebakedPath, 'utf8');
  const jsonMatch = fileContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\n/);
  if (jsonMatch) {
    const prebakedData = JSON.parse(jsonMatch[1]);
    if (prebakedData.all) {
      await putKV('recent:all', prebakedData.all);
    }
    if (prebakedData.tv) {
      await putKV('recent:tv', prebakedData.tv);
    }
  }

  console.log('🎉《怪物：丽兹·波顿的故事》生产 KV 实体及反向索引注入完成！');
}

main().catch(console.error);
