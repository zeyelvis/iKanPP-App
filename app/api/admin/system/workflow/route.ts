import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudflareAccess } from '@/lib/admin/verify-access';
import { recordAuditLog } from '@/lib/admin/audit';

export const runtime = 'edge';

const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'zeyelvis/iKanPP-App';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_PAT || '';

const ALLOWED_WORKFLOWS = [
  'deploy.yml',
  'seo-intelligence.yml',
  'sync-iyf-channels.yml',
  'full-site-prewarm.yml',
  'generate-sitemaps.yml',
];

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
        error: '未配置 GITHUB_TOKEN 环境变量，无法触发 GitHub Actions 工作流',
      },
      { status: 500 }
    );
  }

  try {
    const { workflow, ref = 'main' } = await request.json();

    if (!ALLOWED_WORKFLOWS.includes(workflow)) {
      return NextResponse.json(
        { success: false, error: `不支持的工作流名称: ${workflow}` },
        { status: 400 }
      );
    }

    const dispatchUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow}/dispatches`;
    const res = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'iKanPP-Mission-Control',
      },
      body: JSON.stringify({ ref }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, error: `GitHub API 响应 ${res.status}: ${errText}` },
        { status: res.status }
      );
    }

    const runUrl = `https://github.com/${GITHUB_REPO}/actions/workflows/${workflow}`;

    await recordAuditLog({
      actor: authResult.email || 'Admin',
      action: `触发 GitHub Actions 工作流`,
      target: workflow,
      details: { ref },
    });

    return NextResponse.json({
      success: true,
      workflow,
      runUrl,
      message: `工作流 ${workflow} 已成功触发并加入 GitHub Actions 构建队列`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '调度失败' },
      { status: 500 }
    );
  }
}
