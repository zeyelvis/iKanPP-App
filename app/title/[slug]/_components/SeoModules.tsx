import { TitleEntity } from '@/lib/types/entity';
import { AiUniqueReview } from '@/components/title/AiUniqueReview';
import { AiFaqSection } from '@/components/title/AiFaqSection';
import { CastRail } from '@/components/title/CastRail';
import { AiOverviewCapsule } from '@/components/seo/AiOverviewCapsule';
import { RelatedSearchChips } from '@/components/seo/RelatedSearchChips';

interface SeoModulesProps {
  entity: TitleEntity;
  channelName: string;
  primaryGenre: string;
  validDirectors: string[];
  validActors: string[];
  peopleAvatars: Record<string, string>;
}

export function SeoModules({
  entity,
  channelName,
  primaryGenre,
  validDirectors,
  validActors,
  peopleAvatars,
}: SeoModulesProps) {
  return (
    <>
      {/* 场景 1：AI 独家深度影评与高光剧情看点 (消灭 Thin Content) */}
      <AiUniqueReview entity={entity} />

      {/* 场景 2：Google FAQPage 常见问题与观影答疑折叠胶囊 */}
      <AiFaqSection entity={entity} />

      {/* 演职员圆形名牌滑轨 (Cast & Crew Rail) - 客户端自愈补全组件 */}
      {(validDirectors.length > 0 || validActors.length > 0) && (
        <div className="below-fold-rail">
          <CastRail
            directors={validDirectors}
            actors={validActors}
            initialAvatars={peopleAvatars}
          />
        </div>
      )}

      {/* AI Overview / GEO 胶囊速览档案与微格式标记 */}
      <AiOverviewCapsule entity={entity} channelName={channelName} />

      {/* 关联热搜与深度内链集群 (Phase 2 SEO High-Potential Mesh) */}
      <RelatedSearchChips
        currentTitle={entity.title}
        currentGenre={primaryGenre}
        entity={entity}
        limit={12}
      />
    </>
  );
}
