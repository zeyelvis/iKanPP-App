/**
 * User Store — Zustand store 管理前端用户状态
 * 包含登录状态、VIP 状态、邀请码等
 */
'use client';

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { signIn, signUp, signOut, getProfile, checkVipStatus, onAuthStateChange, type SupabaseRole } from '@/lib/supabase/auth';

export interface UserProfile {
    id: string;
    email: string;
    inviteCode: string;
    referredBy: string | null;
    vipUntil: Date | null;
    isVip: boolean;
    totalInvites: number;
    isAdmin: boolean;
    role: SupabaseRole;
    createdAt?: string;
}

interface UserState {
    // 状态
    user: UserProfile | null;
    loading: boolean;
    initialized: boolean;

    // 操作
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, referralCode?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    loading: false,
    initialized: false,

    // 初始化：检查是否有持久化的 session
    initialize: async () => {
        if (get().initialized) return;

        if (!isSupabaseConfigured) {
            set({ initialized: true, loading: false });
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await get().refreshProfile();
            }
        } catch (err) {
            console.warn('初始化用户状态失败:', err);
        } finally {
            set({ initialized: true });
        }

        // 监听 auth 状态变化
        onAuthStateChange(async (user) => {
            if (user) {
                await get().refreshProfile();
            } else {
                set({ user: null });
            }
        });
    },

    // 登录
    login: async (email: string, password: string) => {
        set({ loading: true });
        try {
            await signIn(email, password);
            await get().refreshProfile();
        } finally {
            set({ loading: false });
        }
    },

    // 注册
    register: async (email: string, password: string, referralCode?: string) => {
        set({ loading: true });
        try {
            await signUp(email, password, referralCode);
            await get().refreshProfile();
        } finally {
            set({ loading: false });
        }
    },

    // 登出
    logout: async () => {
        await signOut();
        set({ user: null });
    },

    // 刷新用户 profile
    refreshProfile: async () => {
        try {
            const profile = await getProfile();
            if (!profile) {
                set({ user: null });
                return;
            }

            const { isVip, vipUntil } = await checkVipStatus();

            const role: SupabaseRole = profile.role || (profile.is_admin ? 'admin' : 'user');

            set({
                user: {
                    id: profile.id,
                    email: profile.email,
                    inviteCode: profile.invite_code,
                    referredBy: profile.referred_by,
                    vipUntil,
                    isVip,
                    totalInvites: profile.total_invites || 0,
                    isAdmin: role === 'admin' || role === 'super_admin',
                    role,
                    createdAt: profile.created_at,
                },
            });
        } catch (err) {
            console.error('刷新用户信息失败:', err);
        }
    },
}));
