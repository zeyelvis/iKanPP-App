/**
 * Auth Store - Simple module-level session management
 * NOT Zustand — needs to be synchronous at import time for store key generation
 */

export type Role = 'super_admin' | 'admin' | 'viewer';

export type Permission =
  | 'source_management'
  | 'account_management'
  | 'danmaku_api'
  | 'data_management'
  | 'player_settings'
  | 'danmaku_appearance'
  | 'view_settings'
  | 'iptv_access';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ['source_management', 'account_management', 'danmaku_api', 'data_management', 'player_settings', 'danmaku_appearance', 'view_settings', 'iptv_access'],
  admin: ['player_settings', 'danmaku_appearance', 'view_settings', 'iptv_access'],
  viewer: ['view_settings'],
};

export interface AuthSession {
  profileId: string;
  name: string;
  role: Role;
  customPermissions?: Permission[];
}

const SESSION_KEY = 'kvideo-session';

// 标记旧密码认证系统是否已配置（由 PasswordGate 设置）
let _authConfigured = false;

/**
 * 由 PasswordGate 调用，标记旧密码认证系统是否启用
 */
export function setAuthConfigured(configured: boolean): void {
  _authConfigured = configured;
}

export function isAuthConfigured(): boolean {
  return _authConfigured;
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  // 始终从 localStorage 读取（持久化会话）
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.profileId && parsed.name && parsed.role) {
      return parsed as AuthSession;
    }
  } catch {
    // Invalid session data
  }
  return null;
}

export function setSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  const data = JSON.stringify(session);
  // 始终持久化到 localStorage，关闭浏览器后登录状态不会丢失
  localStorage.setItem(SESSION_KEY, data);
  // 触发全局广播事件，通知 Navbar、Profile 等所有组件同步刷新
  window.dispatchEvent(new Event('auth-changed'));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('kvideo_local_user');
  // 清理旧版 sessionStorage (向后兼容)
  sessionStorage.removeItem(SESSION_KEY);
  // Clear search cache so new session gets fresh results
  localStorage.removeItem('kvideo_search_cache');
  // Also clear old unlock keys for backward compat cleanup
  sessionStorage.removeItem('kvideo-unlocked');
  localStorage.removeItem('kvideo-unlocked');
  // 触发全局广播事件
  window.dispatchEvent(new Event('auth-changed'));
}

export function isAdmin(): boolean {
  const session = getSession();
  if (session) return session.role === 'admin' || session.role === 'super_admin';
  // 无旧密码 session 时，检查 Supabase 用户角色
  const sbRole = getSupabaseUserRole();
  if (sbRole) return sbRole === 'admin' || sbRole === 'super_admin';
  return !_authConfigured; // 无任何认证 = 全部放行
}

export function hasPermission(permission: Permission): boolean {
  const session = getSession();
  if (session) {
    if (ROLE_PERMISSIONS[session.role]?.includes(permission)) return true;
    if (session.customPermissions?.includes(permission)) return true;
    return false;
  }
  // 无旧密码 session 时，检查 Supabase 用户角色
  const sbRole = getSupabaseUserRole();
  if (sbRole) {
    // 映射 Supabase 角色到权限
    const roleMap: Record<string, Role> = { super_admin: 'super_admin', admin: 'admin', user: 'viewer' };
    const mappedRole = roleMap[sbRole] || 'viewer';
    return ROLE_PERMISSIONS[mappedRole]?.includes(permission) || false;
  }
  return !_authConfigured;
}

export function hasRole(minimumRole: Role): boolean {
  const session = getSession();
  const hierarchy: Role[] = ['viewer', 'admin', 'super_admin'];
  if (session) {
    return hierarchy.indexOf(session.role) >= hierarchy.indexOf(minimumRole);
  }
  const sbRole = getSupabaseUserRole();
  if (sbRole) {
    const roleMap: Record<string, Role> = { super_admin: 'super_admin', admin: 'admin', user: 'viewer' };
    const mappedRole = roleMap[sbRole] || 'viewer';
    return hierarchy.indexOf(mappedRole) >= hierarchy.indexOf(minimumRole);
  }
  return !_authConfigured;
}

export function getProfileId(): string {
  const session = getSession();
  return session?.profileId || '';
}

/**
 * 从 user-store 获取当前 Supabase 用户的角色
 * 用于在无旧密码 session 时判断权限
 */
function getSupabaseUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // 从 zustand 的持久化状态或全局变量读取
    const { useUserStore } = require('@/lib/store/user-store');
    const user = useUserStore.getState().user;
    return user?.role || null;
  } catch {
    return null;
  }
}
