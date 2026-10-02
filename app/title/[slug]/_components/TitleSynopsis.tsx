import { TitleEntity } from '@/lib/types/entity';
import { isFillerDescription } from '@/lib/utils/seo-keyword-generator';

interface TitleSynopsisProps {
  entity: TitleEntity;
  channelName: string;
}

export function TitleSynopsis({ entity, channelName }: TitleSynopsisProps) {
  return (
    <section className="p-5 sm:p-7 rounded-2xl bg-white/4 border border-white/10 shadow-xl">
      <h2 className="text-xs uppercase tracking-wider font-bold text-white/40 mb-3 flex items-center gap-2">
        <span>📖</span>
        <span>剧情梗概 (STORYLINE)</span>
      </h2>
      <p className="text-white/85 text-sm sm:text-base leading-relaxed">
        {isFillerDescription(entity.description) && entity.aiContent?.uniqueSynopsis
          ? entity.aiContent.uniqueSynopsis
          : entity.description || `${entity.title} 是一部优质的${entity.year || ''}年${channelName}作品。`}
      </p>

      {/* E-E-A-T 影视背书 */}
      <div className="flex items-center gap-2 text-xs text-white/35 mt-5 pt-4 border-t border-white/5">
        <span>🛡️</span>
        <span>影视资料由 iKanPP 影视库团队整理校对</span>
      </div>
    </section>
  );
}
