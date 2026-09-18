import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import { kvGet } from '@/lib/services/entity-kv';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    // 1. 测试 KV 连通性与数据规模
    let kvConnected = false;
    let totalEntities = 0;
    let kvLatencyMs = 0;

    const tStart = Date.now();
    try {
      const allRaw = await kvGet('index:all');
      kvLatencyMs = Date.now() - tStart;
      if (allRaw) {
        const parsed = JSON.parse(allRaw);
        if (Array.isArray(parsed)) {
          totalEntities = parsed.length;
          kvConnected = true;
        }
      }
    } catch {
      kvLatencyMs = Date.now() - tStart;
    }

    // 2. 检测关键 Secret 配置状态（仅布尔值，绝不暴露敏感内容）
    const secretsStatus = {
      CLOUDFLARE_API_KEY: Boolean(process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY),
      GOOGLE_INDEXING_KEY: Boolean(
        process.env.GOOGLE_INDEXING_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ),
      CF_ACCESS_AUD: Boolean(process.env.CF_ACCESS_AUD),
      CF_ACCESS_TEAM_DOMAIN: Boolean(process.env.CF_ACCESS_TEAM_DOMAIN),
      GITHUB_TOKEN: Boolean(process.env.GITHUB_TOKEN || process.env.GH_PAT),
      TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    };

    // 3. 汇总健康评分
    const healthyCount = Object.values(secretsStatus).filter(Boolean).length;
    const isOverallHealthy = kvConnected && healthyCount >= 2;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      isOverallHealthy,
      kv: {
        connected: kvConnected,
        latencyMs: kvLatencyMs,
        totalEntities,
      },
      secrets: secretsStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '健康检查异常' },
      { status: 500 }
    );
  }
}
