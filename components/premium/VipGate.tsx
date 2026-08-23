'use client';

/**
 * VipGate — VIP 门禁包裹组件
 * 检查用户 VIP 状态，非 VIP 显示开通引导
 */
import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store/user-store';
import { VipPrompt } from './VipPrompt';
import { AuthModal } from '@/components/auth/AuthModal';

interface VipGateProps {
    children: React.ReactNode;
    /** 可选：自定义加载态 */
    fallback?: React.ReactNode;
}

export function VipGate({ children, fallback }: VipGateProps) {
    const { user, initialized, initialize } = useUserStore();
    const [showLogin, setShowLogin] = useState(false);

    // 确保用户状态已初始化
    useEffect(() => {
        initialize();
    }, [initialize]);

    // 加载中
    if (!initialized) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="brand-spinner" />
            </div>
        );
    }

    // VIP 用户 → 正常渲染
    if (user?.isVip) {
        return <>{children}</>;
    }

    // 非 VIP / 未登录 → 显示开通引导
    return (
        <div className="min-h-screen bg-[#060609] text-white relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
            {/* 环境光影 */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

            <div className="py-6 sm:py-10">
                <VipPrompt
                    onOpenLogin={() => setShowLogin(true)}
                />
            </div>

            {/* 登录弹窗 */}
            {showLogin && (
                <AuthModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                />
            )}
        </div>
    );
}
