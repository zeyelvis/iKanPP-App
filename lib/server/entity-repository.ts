/**
 * iKanPP D1 权威实体仓库抽象层 (对应规范 4.2 节 & 21.2 节)
 */

export interface D1EntityRecord {
  entity_id: string;
  media_type: string;
  canonical_slug: string;
  primary_title: string;
  original_title?: string;
  release_date?: string;
  release_year?: number;
  synopsis?: string;
  runtime_minutes?: number;
  region_code?: string;
  language_code?: string;
  index_state: string;
  seo_score: number;
  created_at: string;
  updated_at: string;
}

export interface ExternalIdRecord {
  source: 'tmdb' | 'douban' | 'imdb' | string;
  media_type: string;
  external_id: string;
  entity_id: string;
  confidence: number;
  verified_at?: string;
}

export interface EntityRepository {
  getEntityById(entityId: string): Promise<D1EntityRecord | null>;
  getEntityByExternalId(source: string, mediaType: string, externalId: string): Promise<D1EntityRecord | null>;
  recordAlias(aliasValue: string, entityId: string, isRedirect: boolean): Promise<void>;
  listIndexableEntities(limit?: number, offset?: number): Promise<D1EntityRecord[]>;
}

/**
 * 内存/兼容态通用实体仓库实现 (当 D1 binding 不可用时自动兜底保证 Edge 0 崩溃)
 */
class MemoryFallbackEntityRepository implements EntityRepository {
  private entities = new Map<string, D1EntityRecord>();
  private externalIds = new Map<string, string>(); // "source:mediaType:externalId" -> entityId
  private aliases = new Map<string, { entityId: string; isRedirect: boolean }>();

  async getEntityById(entityId: string): Promise<D1EntityRecord | null> {
    return this.entities.get(entityId) || null;
  }

  async getEntityByExternalId(source: string, mediaType: string, externalId: string): Promise<D1EntityRecord | null> {
    const key = `${source}:${mediaType}:${externalId}`;
    const entityId = this.externalIds.get(key);
    if (!entityId) return null;
    return this.getEntityById(entityId);
  }

  async recordAlias(aliasValue: string, entityId: string, isRedirect: boolean): Promise<void> {
    this.aliases.set(aliasValue, { entityId, isRedirect });
  }

  async listIndexableEntities(limit = 100, offset = 0): Promise<D1EntityRecord[]> {
    const all = Array.from(this.entities.values()).filter(e => e.index_state === 'indexable');
    return all.slice(offset, offset + limit);
  }

  // 辅助注入方法
  seed(record: D1EntityRecord, extIds: ExternalIdRecord[] = []) {
    this.entities.set(record.entity_id, record);
    for (const ext of extIds) {
      this.externalIds.set(`${ext.source}:${ext.media_type}:${ext.external_id}`, record.entity_id);
    }
  }
}

// 单例导出与工厂函数
export const defaultEntityRepository: EntityRepository = new MemoryFallbackEntityRepository();

export function getEntityRepository(): EntityRepository {
  return defaultEntityRepository;
}
