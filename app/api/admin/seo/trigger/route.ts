import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudflareAccess } from '@/lib/admin/verify-access';
import { recordAuditLog } from '@/lib/admin/audit';

export const runtime = 'edge';

const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'zeyelvis/iKanPP-App';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_PAT || '';

export async function POST(request: NextRequest) {
  const authResult = await verifyCloudflareAccess(request);
  if (!authResult.authenticated) {
    return NextResponse.json(
      { success: false, error: authResult.error || '未授权' },
      { status: authResult.status }
    );
  }

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      {
        success: false,
        error:
          '未检测到 GITHUB_TOKEN 环境变量，无法远程触发 GitHub Actions。请在 Cloudflare Pages 环境变量中配置具备 Actions 触发权限的 GITHUB_TOKEN。',
      },
      { status: 500 }
    );
  }

  try {
    const dispatchUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/seo-intelligence.yml/dispatches`;
    const res = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'iKanPP-Admin-Mission-Control',
      },
      body: JSON.stringify({ ref: 'main' }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `GitHub API 返回错误 (${res.status}): ${errText}`,
        },
        { status: res.status }
      );
    }

    const actionsUrl = `https://github.com/${GITHUB_REPO}/actions/workflows/seo-intelligence.yml`;

    // 记录审计日志
    await recordAuditLog({
      actor: authResult.email || 'Admin',
      action: '手动触发全量 SEO 巡检 Actions',
      target: 'seo-intelligence.yml',
      details: { ref: 'main' },
    });

    return NextResponse.json({
      success: true,
      message: '全量 SEO 巡检任务已成功向 GitHub Actions 调度派发！',
      runUrl: actionsUrl,
    });
  } catch (error: any) {
    console.error('[Admin Trigger SEO] 异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '调度 Actions 失败' },
      { status: 500 }
    );
  }
}
