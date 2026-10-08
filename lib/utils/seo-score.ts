/**
 * 作品资料完整度评分（0–100），后台展示用。从已删除的 /api/seo/entity-pipeline 原样移出。
 */
import type { TitleEntity } from '@/lib/types/entity';

export function calculateSeoScore(entity: TitleEntity): number {
  let score = 0;
  const desc = entity.description || '';
  if (desc.length >= 80 && !desc.includes('在线观看，全网高清影视资源')) {
    score += 25;
  } else if (desc.length >= 30) {
    score += 15;
  }

  if (entity.cover && !entity.cover.includes('default')) {
    score += 20;
  }
  if (entity.backdrop) {
    score += 10;
  }

  const validDirectors = (entity.directors || []).filter(d => d && d !== '知名导演');
  const validActors = (entity.actors || []).filter(a => a && a !== '实力主演');
  if (validDirectors.length > 0 || validActors.length > 0) {
    score += 15;
  }

  if (entity.genres && entity.genres.length > 0) {
    score += 10;
  }

  if (entity.rate && entity.rate !== '0' && entity.rate !== '0.0') {
    score += 10;
  }

  if (entity.keywords && entity.keywords.length >= 3) {
    score += 10;
  }

  return Math.min(score, 100);
}
