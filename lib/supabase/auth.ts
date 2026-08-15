/**
 * Supabase 认证封装
 * 注册、登录、登出、VIP 状态查询
 */
import { supabase, isSupabaseConfigured } from './client';

// 生成 6 位邀请码
function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉容易混淆的 I/O/0/1
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * 邮箱注册
 * 注册后自动创建 profiles 记录（通过 Supabase trigger 或手动）
 */
export async function signUp(email: string, password: string, referralCode?: string) {
    // 注册时关闭邮箱确认要求，使注册后自动拥有 session
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // Supabase 将根据项目设置决定是否需要确认
            // 如果项目要求邮箱确认，signUp 不会返回 session
            data: {
                referral_code: referralCode || null,
            }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error('注册失败');

    // 创建用户 profile（邀请码 + 邀请关系）
    const inviteCode = generateInviteCode();
    const now = new Date();
    // 新用户赠送 30 天 VIP 体验（冷启动期）
    const vipUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 尝试创建 profile（可能因 RLS 失败，getProfile 有兜底补建逻辑）
    try {
        await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            invite_code: inviteCode,
            referred_by: referralCode || null,
            vip_until: vipUntil.toISOString(),
            total_invites: 0,
            is_admin: false,
            role: 'user',
        });
    } catch (profileErr) {
        console.warn('创建 profile 失败（将在登录后自动补建）:', profileErr);
    }

    // 如果有邀请码，处理邀请奖励
    if (referralCode) {
        try {
            await processReferral(referralCode, data.user.id);
        } catch (refErr) {
            console.warn('处理邀请奖励失败:', refErr);
        }
    }

    // 如果 signUp 没有返回 session（邮箱确认开启），主动调用 signIn
    if (!data.session) {
        try {
            await supabase.auth.signInWithPassword({ email, password });
        } catch (loginErr) {
            // 如果邮箱确认阻止了登录，静默失败，前端会特殊处理
            console.warn('注册后自动登录失败:', loginErr);
        }
    }

    return data;
}

/**
 * 邮箱登录
 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * 登出
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * 获取当前用户 profile（含 VIP 状态）
 */
export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 如果 profile 不存在（注册时写入失败等情况），自动补建
    if (error?.code === 'PGRST116' || !profile) {
        console.log('Profile 缺失，自动补建...');
        const inviteCode = generateInviteCode();
        const now = new Date();
        const vipUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                invite_code: inviteCode,
                referred_by: null,
                vip_until: vipUntil.toISOString(),
                total_invites: 0,
                is_admin: false,
                role: 'user',
            })
            .select()
            .single();

        if (insertError) {
            console.error('自动补建 profile 失败:', insertError);
            return null;
        }
        return newProfile;
    }

    return profile;
}

/**
 * 检查是否为 VIP（VIP 到期时间在当前时间之后）
 */
export async function checkVipStatus(): Promise<{ isVip: boolean; vipUntil: Date | null }> {
    const profile = await getProfile();
    if (!profile) {
        return { isVip: false, vipUntil: null };
    }

    // 管理员默认永久 VIP
    if (profile.role === 'super_admin' || profile.role === 'admin') {
        return { isVip: true, vipUntil: new Date('2099-12-31') };
    }

    if (!profile.vip_until) {
        return { isVip: false, vipUntil: null };
    }

    const vipUntil = new Date(profile.vip_until);
    return {
        isVip: vipUntil > new Date(),
        vipUntil,
    };
}

/**
 * 处理邀请奖励：给邀请人增加 VIP 天数
 */
async function processReferral(inviterCode: string, inviteeId: string) {
    try {
        // 查找邀请人
        const { data: inviter } = await supabase
            .from('profiles')
            .select('id, vip_until, total_invites')
            .eq('invite_code', inviterCode)
            .single();

        if (!inviter) return;

        // 记录邀请关系
        await supabase.from('referrals').insert({
            inviter_id: inviter.id,
            invitee_id: inviteeId,
            reward_days: 15,
            type: 'register',
        });

        // 给邀请人增加 15 天 VIP
        const now = new Date();
        const currentVipEnd = inviter.vip_until ? new Date(inviter.vip_until) : now;
        const baseDate = currentVipEnd > now ? currentVipEnd : now;
        const newVipUntil = new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000);

        await supabase
            .from('profiles')
            .update({
                vip_until: newVipUntil.toISOString(),
                total_invites: (inviter.total_invites || 0) + 1,
            })
            .eq('id', inviter.id);

        // 给被邀请人也增加 15 天 VIP（双向奖励）
        const { data: invitee } = await supabase
            .from('profiles')
            .select('vip_until')
            .eq('id', inviteeId)
            .single();

        if (invitee) {
            const inviteeVipEnd = invitee.vip_until ? new Date(invitee.vip_until) : now;
            const inviteeBase = inviteeVipEnd > now ? inviteeVipEnd : now;
            const inviteeNewVip = new Date(inviteeBase.getTime() + 15 * 24 * 60 * 60 * 1000);

            await supabase
                .from('profiles')
                .update({ vip_until: inviteeNewVip.toISOString() })
                .eq('id', inviteeId);
        }
    } catch (err) {
        console.error('处理邀请奖励失败:', err);
    }
}

/**
 * 给用户增加 VIP 天数
 */
export async function addVipDays(userId: string, days: number) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('vip_until')
        .eq('id', userId)
        .single();

    if (!profile) return;

    const now = new Date();
    const currentEnd = profile.vip_until ? new Date(profile.vip_until) : now;
    const baseDate = currentEnd > now ? currentEnd : now;
    const newVipUntil = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    await supabase
        .from('profiles')
        .update({ vip_until: newVipUntil.toISOString() })
        .eq('id', userId);
}

/**
 * 获取邀请记录
 */
export async function getReferralRecords(userId: string) {
    const { data } = await supabase
        .from('referrals')
        .select('*, invitee:invitee_id(email)')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false });

    return data || [];
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (user: any) => void) {
    if (!isSupabaseConfigured) {
        return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}

// ─── 管理员管理 ───

export type SupabaseRole = 'super_admin' | 'admin' | 'user';

/**
 * 获取所有管理员列表（role 为 admin 或 super_admin）
 */
export async function getAdminList(): Promise<{ id: string; email: string; role: SupabaseRole }[]> {
    const { data } = await supabase
        .from('profiles')
        .select('id, email, role')
        .in('role', ['admin', 'super_admin'])
        .order('role', { ascending: false });

    return (data || []) as { id: string; email: string; role: SupabaseRole }[];
}

/**
 * 通过邮箱查找用户
 */
export async function findUserByEmail(email: string) {
    const { data } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email.trim().toLowerCase())
        .single();

    return data as { id: string; email: string; role: SupabaseRole } | null;
}

/**
 * 设置用户角色（仅 super_admin 可调用）
 * @param targetUserId 目标用户 ID
 * @param newRole 新角色
 * @param operatorId 操作者 ID（必须是 super_admin）
 */
export async function setUserRole(targetUserId: string, newRole: SupabaseRole, operatorId: string): Promise<{ success: boolean; error?: string }> {
    // 验证操作者是否为 super_admin
    const { data: operator } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', operatorId)
        .single();

    if (!operator || operator.role !== 'super_admin') {
        return { success: false, error: '权限不足：仅超级管理员可执行此操作' };
    }

    // 不允许修改自己的角色
    if (targetUserId === operatorId) {
        return { success: false, error: '不能修改自己的角色' };
    }

    // 不允许设置他人为 super_admin
    if (newRole === 'super_admin') {
        return { success: false, error: '不能设置其他用户为超级管理员' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, is_admin: newRole !== 'user' })
        .eq('id', targetUserId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
