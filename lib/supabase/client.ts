/**
 * Supabase 客户端初始化
 * 用于会员系统的用户认证和数据存储
 * 容错设计：未配置环境变量时优雅降级，杜绝模块加载抛错白屏
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http')
);

// 未配置 Supabase 时使用安全占位符，防止 createClient 抛出 "supabaseUrl is required" 导致整站崩溃
const safeUrl = isSupabaseConfigured ? supabaseUrl! : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
    auth: {
        // 仅在真实配置时启用持久化与自动刷新
        persistSession: isSupabaseConfigured,
        autoRefreshToken: isSupabaseConfigured,
    },
});
