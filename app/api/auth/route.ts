/**
 * Auth API Route
 * Handles authentication with role-based accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited, getClientIp, constantTimeCompare } from '@/lib/utils/security';

export const runtime = 'edge';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || '';
const ACCOUNTS = process.env.ACCOUNTS || '';
const PERSIST_SESSION = process.env.PERSIST_SESSION !== 'false'; // default true
const SUBSCRIPTION_SOURCES = process.env.SUBSCRIPTION_SOURCES || process.env.NEXT_PUBLIC_SUBSCRIPTION_SOURCES || '';

// Backward compat: ACCESS_PASSWORD acts as ADMIN_PASSWORD if ADMIN_PASSWORD is not set
const effectiveAdminPassword = ADMIN_PASSWORD || ACCESS_PASSWORD;

interface AccountEntry {
  password: string;
  name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  customPermissions: string[];
}

function parseAccounts(): AccountEntry[] {
  if (!ACCOUNTS) return [];

  return ACCOUNTS.split(',')
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)
    .map(entry => {
      const parts = entry.split(':');
      if (parts.length < 2) return null;
      const [password, name, role, perms] = parts;
      const parsedRole = role?.trim();
      const customPermissions = perms
        ? perms.split('|').map(p => p.trim()).filter(p => p.length > 0)
        : [];
      return {
        password: password.trim(),
        name: name.trim(),
        role: (parsedRole === 'super_admin' ? 'super_admin' : parsedRole === 'admin' ? 'admin' : 'viewer') as 'super_admin' | 'admin' | 'viewer',
        customPermissions,
      };
    })
    .filter((a): a is AccountEntry => a !== null && a.password.length > 0 && a.name.length > 0);
}

/**
 * Generate a deterministic profileId from password using SHA-256.
 * Uses a salt to avoid rainbow table attacks.
 */
async function generateProfileId(password: string): Promise<string> {
  const salt = 'kvideo-profile-salt-v1';
  const data = new TextEncoder().encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  // Use first 8 bytes (16 hex chars) for a compact but unique ID
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
  const hasAuth = !!(effectiveAdminPassword || ACCOUNTS);

  return NextResponse.json({
    hasAuth,
    persistSession: PERSIST_SESSION,
    subscriptionSources: SUBSCRIPTION_SOURCES,
  });
}

export async function POST(request: NextRequest) {
  try {
    // 速率限制 — 每 IP 每分钟最多 5 次登录尝试
    const ip = getClientIp(request);
    if (isRateLimited(`auth:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { valid: false, message: '登录尝试过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const { password } = await request.json().catch(() => ({}));

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ valid: false, message: 'Password required' }, { status: 400 });
    }

    // 1. Check admin password（常量时间比较）
    if (effectiveAdminPassword && constantTimeCompare(password, effectiveAdminPassword)) {
      const profileId = await generateProfileId(password);
      return NextResponse.json({
        valid: true,
        name: '管理员',
        role: 'super_admin',
        profileId,
        persistSession: PERSIST_SESSION,
      });
    }

    // 2. Check ACCOUNTS entries（常量时间比较）
    const accounts = parseAccounts();
    for (const account of accounts) {
      if (constantTimeCompare(password, account.password)) {
        const profileId = await generateProfileId(password);
        return NextResponse.json({
          valid: true,
          name: account.name,
          role: account.role,
          profileId,
          persistSession: PERSIST_SESSION,
          customPermissions: account.customPermissions.length > 0 ? account.customPermissions : undefined,
        });
      }
    }

    // 3. No match
    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 });
  }
}
