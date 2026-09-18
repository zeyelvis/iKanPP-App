import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, verifyCloudflareAccess } from '@/lib/admin/verify-access';
import { getEntityById, saveEntity, kvDelete, kvGet, kvPut } from '@/lib/services/entity-kv';
import { calculateSeoScore } from '@/app/api/seo/entity-pipeline/route';
import { recordAuditLog } from '@/lib/admin/audit';
import { TitleEntity } from '@/lib/types/entity';

export const runtime = 'edge';

// 获取单个实体
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const entity = await getEntityById(id);
    if (!entity) {
      return NextResponse.json(
        { success: false, error: `未找到 ID 为 ${id} 的影视实体` },
        { status: 404 }
      );
    }

    const seoScore = calculateSeoScore(entity);

    return NextResponse.json({
      success: true,
      entity: {
        ...entity,
        seoScore,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '获取实体异常' },
      { status: 500 }
    );
  }
}

// 更新实体
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyCloudflareAccess(request);
  if (!authResult.authenticated) {
    return NextResponse.json(
      { success: false, error: authResult.error || '未授权' },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;
    const existing = await getEntityById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `实体 ${id} 不存在，无法更新` },
        { status: 404 }
      );
    }

    const updates: Partial<TitleEntity> = await request.json();

    // 保护核心物理唯一字段不可变
    const merged: TitleEntity = {
      ...existing,
      ...updates,
      entityId: existing.entityId,
      tmdbId: existing.tmdbId,
      tmdbType: existing.tmdbType,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // 重新计算 SEO 分
    merged.seoScore = calculateSeoScore(merged);

    // 存回 KV（底层会自动维护全套 14+ 索引更新）
    await saveEntity(merged);

    // 记录管理员操作审计日志
    await recordAuditLog({
      actor: authResult.email || 'Admin',
      action: '更新影视实体',
      target: `${merged.entityId} - ${merged.title}`,
      details: {
        score: merged.seoScore,
        rate: merged.rate,
        year: merged.year,
        genres: merged.genres,
      },
    });

    return NextResponse.json({
      success: true,
      entity: merged,
    });
  } catch (error: any) {
    console.error('[Admin Update Entity] 异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新实体失败' },
      { status: 500 }
    );
  }
}

// 删除实体
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyCloudflareAccess(request);
  if (!authResult.authenticated) {
    return NextResponse.json(
      { success: false, error: authResult.error || '未授权' },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;
    const existing = await getEntityById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `实体 ${id} 不存在或已被删除` },
        { status: 404 }
      );
    }

    // 1. 物理删除 entity:{id}
    await kvDelete(`entity:${id}`);

    // 2. 物理删除关联别名与 TMDB 反向索引
    if (existing.slug) {
      await kvDelete(`slug:${existing.slug}`);
    }
    if (existing.tmdbId && existing.tmdbType) {
      await kvDelete(`tmdb:${existing.tmdbType}:${existing.tmdbId}`);
    }

    // 3. 从全局总索引 index:all 中剔除
    try {
      const allRaw = await kvGet('index:all');
      if (allRaw) {
        let allIds: string[] = JSON.parse(allRaw);
        if (Array.isArray(allIds)) {
          allIds = allIds.filter((item) => item !== id);
          await kvPut('index:all', JSON.stringify(allIds));
        }
      }
    } catch (e) {
      console.warn('[Admin Delete Entity] 从 index:all 剔除失败:', e);
    }

    // 4. 记录审计日志
    await recordAuditLog({
      actor: authResult.email || 'Admin',
      action: '物理删除影视实体',
      target: `${id} - ${existing.title}`,
      details: {
        tmdbId: existing.tmdbId,
        slug: existing.slug,
      },
    });

    return NextResponse.json({
      success: true,
      message: `实体 ${id} 已成功下架与物理删除`,
    });
  } catch (error: any) {
    console.error('[Admin Delete Entity] 异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除实体失败' },
      { status: 500 }
    );
  }
}
