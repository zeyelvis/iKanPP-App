/**
 * AuthModal — 专业级登录/注册弹窗（高性能版）
 * 核心优化：输入框使用 ref（非受控），打字时零 React 重渲染
 * 安全：邮箱校验 + 一次性邮箱拦截 + 密码强度 + 弱密码黑名单
 */
'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, Gift, Eye, EyeOff, Loader2, Crown, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { Turnstile, isTurnstileEnabled, type TurnstileHandle } from '@/components/auth/Turnstile';

// ─── 安全常量 ────────────────────────────────

const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'tempmail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email',
    'temp-mail.org', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org',
    'guerrillamail.de', 'yopmail.com', 'yopmail.fr', 'trashmail.com',
    'trashmail.net', 'disposable.email', 'mailnesia.com', 'maildrop.cc',
    'dispostable.com', 'getnada.com', 'tempail.com', 'mohmal.com',
    'minutemail.com', '10minutemail.com', 'tempr.email', 'discard.email',
    'tmpmail.net', 'tmpmail.org', 'burnermail.io', 'mailsac.com',
    'harakirimail.com', 'tmail.ws', 'ethereal.email',
]);

const COMMON_WEAK_PASSWORDS = new Set([
    'password', 'password1', 'password123', '12345678', '123456789',
    '1234567890', 'qwerty123', 'abc12345', 'abcd1234', 'admin123',
    'letmein01', 'welcome1', 'monkey123', 'dragon123', 'master123',
    'qwertyui', 'iloveyou', 'trustno1', 'sunshine1', 'princess1',
]);

function validateAccount(val: string): { valid: boolean; error?: string } {
    if (!val) return { valid: false, error: '请输入账号或邮箱' };
    if (val.includes('@')) {
        return validateEmail(val);
    }
    // 纯用户名/账号（如 admin888 / vip888）
    if (val.length < 2) return { valid: false, error: '账号至少 2 个字符' };
    return { valid: true };
}

// ─── 校验函数 ──────────────────────────────

function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) return { valid: false, error: '请输入邮箱地址' };
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return { valid: false, error: '邮箱格式不正确' };
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        return { valid: false, error: '不支持临时邮箱，请使用常用邮箱注册' };
    }
    return { valid: true };
}

function validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password) return { valid: false, error: '请输入密码' };
    if (password.length < 6) return { valid: false, error: '密码至少 6 位' };
    if (password.length > 64) return { valid: false, error: '密码不能超过 64 位' };
    return { valid: true };
}

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
    if (!password || password.length < 4) return { level: 0, label: '弱', color: '#ef4444' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (password.length >= 16) score++;
    if (score <= 2) return { level: 0, label: '弱', color: '#ef4444' };
    if (score === 3) return { level: 1, label: '一般', color: '#f59e0b' };
    if (score === 4) return { level: 2, label: '强', color: '#3b82f6' };
    return { level: 3, label: '非常强', color: '#10b981' };
}

// ─── 左侧宣传区（Memo 避免重渲染） ──────────

const PromoPanel = memo(function PromoPanel() {
    return (
        <div className="hidden md:flex w-[340px] shrink-0 flex-col justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #302b63 60%, #24243e 100%)' }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 left-0 w-64 h-64 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)' }} />
            <div className="p-8">
                <div className="text-xl font-bold text-white tracking-wide" style={{
                    background: 'linear-gradient(135deg, #FFB020, #F59E0B, #E67E22)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>iKanPP</div>
                <p className="text-xs text-white/40 mt-1">爱看片片 · 精彩无限</p>
            </div>
            <div className="px-8 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))' }}>
                        <Crown size={24} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-lg">解锁专属特权</p>
                        <p className="text-white/50 text-xs">登录享会员专属内容</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { icon: '🎬', text: '全网影视免费聚合搜索' },
                        { icon: '👑', text: 'VIP 专属 Premium 内容' },
                        { icon: '☁️', text: '收藏 · 历史 · 云同步' },
                        { icon: '🎁', text: '邀请好友赚 VIP 天数' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-white/70 text-sm">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-8">
                <p className="text-white font-bold text-xl leading-snug">
                    注册即送<br />
                    <span className="text-amber-400">30 天 VIP 体验</span>
                </p>
                <p className="text-white/40 text-xs mt-2">新用户专属福利</p>
            </div>
        </div>
    );
});

// ─── 密码强度条（独立组件，不影响输入框） ──────

const StrengthBar = memo(function StrengthBar({ strength }: { strength: { level: number; label: string; color: string } }) {
    return (
        <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full"
                        style={{ backgroundColor: i <= strength.level ? strength.color : 'rgba(255,255,255,0.08)' }} />
                ))}
            </div>
            <span className="text-[11px] font-medium shrink-0" style={{ color: strength.color }}>
                {strength.label}
            </span>
        </div>
    );
});

// ─── 主组件 ──────────────────────────────────

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
    const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [agreed, setAgreed] = useState(true);

    // 字段错误（仅在失焦/提交时更新）
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: '弱', color: '#ef4444' });

    // 非受控输入 — 打字时零渲染
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmRef = useRef<HTMLInputElement>(null);
    const referralRef = useRef<HTMLInputElement>(null);
    const turnstileTokenRef = useRef('');
    const turnstileRef = useRef<TurnstileHandle>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);

    const { login, register, loading } = useUserStore();

    // iOS 键盘适配
    useEffect(() => {
        if (!isOpen) return;
        const handleResize = () => {
            if (formContainerRef.current && window.visualViewport) {
                formContainerRef.current.style.maxHeight = `${window.visualViewport.height - 20}px`;
            }
        };
        window.visualViewport?.addEventListener('resize', handleResize);
        document.body.style.overflow = 'hidden';
        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // 读取邀请码
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref) {
                if (referralRef.current) referralRef.current.value = ref.toUpperCase();
                setTab('register');
            } else {
                const stored = localStorage.getItem('kvideo-referral-code');
                if (stored && referralRef.current) {
                    referralRef.current.value = stored;
                    setTab('register');
                }
            }
        }
    }, []);

    useEffect(() => { setTab(defaultTab); }, [defaultTab]);

    const resetForm = useCallback(() => {
        if (emailRef.current) emailRef.current.value = '';
        if (passwordRef.current) passwordRef.current.value = '';
        if (confirmRef.current) confirmRef.current.value = '';
        if (referralRef.current) referralRef.current.value = '';
        setError(''); setSuccess('');
        setEmailError(''); setPasswordError(''); setConfirmError('');
        setPasswordStrength({ level: 0, label: '弱', color: '#ef4444' });
    }, []);

    // 失焦校验（不在打字时校验）
    const handleEmailBlur = useCallback(() => {
        const val = emailRef.current?.value.trim() || '';
        if (emailRef.current) emailRef.current.value = val;
        if (val) {
            const result = tab === 'login' ? validateAccount(val) : validateEmail(val);
            setEmailError(result.valid ? '' : (result.error || ''));
        } else {
            setEmailError('');
        }
    }, [tab]);

    const handlePasswordBlur = useCallback(() => {
        const val = passwordRef.current?.value || '';
        setPasswordStrength(getPasswordStrength(val));
        if (tab === 'register' && val) {
            const result = validatePassword(val);
            setPasswordError(result.valid ? '' : (result.error || ''));
        } else {
            setPasswordError('');
        }
    }, [tab]);

    const handleConfirmBlur = useCallback(() => {
        const pw = passwordRef.current?.value || '';
        const cpw = confirmRef.current?.value || '';
        if (cpw && pw !== cpw) {
            setConfirmError('两次密码不一致');
        } else {
            setConfirmError('');
        }
    }, []);

    // Turnstile
    const handleTurnstileVerify = useCallback((token: string) => {
        turnstileTokenRef.current = token;
    }, []);
    const handleTurnstileExpire = useCallback(() => {
        turnstileTokenRef.current = '';
    }, []);

    const verifyTurnstile = async (): Promise<boolean> => {
        // 未启用 Turnstile（密钥为空）→ 直接通过
        if (!isTurnstileEnabled) return true;

        if (!turnstileTokenRef.current) {
            setError('请先完成人机验证（点击勾选框）');
            return false;
        }
        try {
            const res = await fetch('/api/verify-turnstile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: turnstileTokenRef.current }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || '人机验证失败，请重新验证');
                turnstileTokenRef.current = '';
                turnstileRef.current?.reset();
                return false;
            }
            return true;
        } catch {
            setError('验证服务异常，请稍后重试');
            turnstileTokenRef.current = '';
            turnstileRef.current?.reset();
            return false;
        }
    };

    // 登录
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const account = emailRef.current?.value.trim() || '';
        const password = passwordRef.current?.value || '';
        if (!account || !password) { setError('请填写账号和密码'); return; }
        const accountResult = validateAccount(account);
        if (!accountResult.valid) { setEmailError(accountResult.error || ''); return; }
        const verified = await verifyTurnstile();
        if (!verified) return;
        try {
            await login(account, password);
            onClose();
            resetForm();
        } catch (err: any) {
            turnstileTokenRef.current = '';
            turnstileRef.current?.reset();
            setError(err.message === 'Invalid login credentials' ? '账号或密码错误' : err.message || '登录失败');
        }
    };

    // 注册
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const email = emailRef.current?.value.replace(/\s/g, '').toLowerCase() || '';
        const password = passwordRef.current?.value || '';
        const confirmPassword = confirmRef.current?.value || '';
        const referralCode = referralRef.current?.value || '';

        const emailResult = validateEmail(email);
        if (!emailResult.valid) { setEmailError(emailResult.error || ''); return; }
        const pwResult = validatePassword(password);
        if (!pwResult.valid) { setPasswordError(pwResult.error || ''); return; }
        if (password !== confirmPassword) { setConfirmError('两次密码不一致'); return; }
        if (!agreed) { setError('请先同意用户协议'); return; }

        const verified = await verifyTurnstile();
        if (!verified) return;

        try {
            await register(email, password, referralCode || undefined);
            if (typeof window !== 'undefined') {
                localStorage.setItem('kvideo-just-registered', 'true');
            }
            const { user: currentUser } = useUserStore.getState();
            if (currentUser) {
                setSuccess('🎉 注册成功！已自动登录，欢迎使用');
                setTimeout(() => { onClose(); resetForm(); }, 2000);
            } else {
                setSuccess('🎉 注册成功！请查收邮箱完成认证后登录');
                setTimeout(() => { onClose(); resetForm(); }, 3000);
            }
        } catch (err: any) {
            turnstileTokenRef.current = '';
            turnstileRef.current?.reset();
            if (err.message?.includes('already registered')) {
                setError('该邮箱已注册，请直接登录');
            } else {
                setError(err.message || '注册失败');
            }
        }
    };

    if (!isOpen) return null;

    const isRegister = tab === 'register';
    const inputClass = (hasError: boolean) =>
        `w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-xl text-base text-white placeholder:text-white/25 focus:outline-none transition-colors ${hasError ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-emerald-400/50 focus:bg-white/8'}`;

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center sm:p-4">
            <div className="fixed inset-0 bg-black/70" onClick={onClose} />

            <div ref={formContainerRef} className="relative w-full sm:max-w-[820px] flex rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
                style={{ maxHeight: '92vh' }}>

                {/* 左侧宣传区 — memo 不重渲染 */}
                <PromoPanel />

                {/* 右侧表单区 */}
                <div className="flex-1 bg-[#1a1a2e] flex flex-col overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10">
                        <X size={18} />
                    </button>

                    {/* 手机端标题 */}
                    <div className="md:hidden p-6 pb-0">
                        <div className="text-xl font-bold text-white tracking-wide" style={{
                            background: 'linear-gradient(135deg, #FFB020, #F59E0B, #E67E22)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>iKanPP</div>
                        <p className="text-xs text-white/40 mt-1">注册即送 30 天 VIP 体验</p>
                    </div>

                    {/* Tab */}
                    <div className="flex items-center gap-6 px-6 md:px-10 pt-8 md:pt-10">
                        {(['login', 'register'] as const).map(t => (
                            <button key={t}
                                onClick={() => { setTab(t); setError(''); setSuccess(''); setEmailError(''); setPasswordError(''); setConfirmError(''); }}
                                className={`relative pb-3 text-sm font-medium transition-colors cursor-pointer ${tab === t ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
                                {t === 'login' ? '密码登录' : '注册账号'}
                                {tab === t && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-emerald-400" />}
                            </button>
                        ))}
                    </div>

                    {/* 表单 */}
                    <form onSubmit={tab === 'login' ? handleLogin : handleRegister}
                        autoComplete="off"
                        className="flex-1 flex flex-col px-6 md:px-10 pt-6 pb-6">
                        <input type="text" name="fakeuser" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
                        <input type="password" name="fakepass" autoComplete="current-password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

                        <div className="flex-1 space-y-3 min-h-[260px]">

                            {/* 邮箱 — 非受控 */}
                            <div>
                                <div className="relative group">
                                    <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-red-400' : 'text-white/30 group-focus-within:text-emerald-400'}`} />
                                    <input
                                        ref={emailRef}
                                        type="email"
                                        inputMode="email"
                                        enterKeyHint="next"
                                        placeholder="请输入邮箱地址"
                                        defaultValue=""
                                        onBlur={handleEmailBlur}
                                        className={inputClass(!!emailError)}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                    />
                                </div>
                                {emailError && (
                                    <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1">
                                        <AlertCircle size={11} /> {emailError}
                                    </p>
                                )}
                            </div>

                            {/* 密码 — 非受控 */}
                            <div>
                                <div className="relative group">
                                    <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passwordError ? 'text-red-400' : 'text-white/30 group-focus-within:text-emerald-400'}`} />
                                    <input
                                        ref={passwordRef}
                                        type={showPassword ? 'text' : 'password'}
                                        enterKeyHint={isRegister ? 'next' : 'done'}
                                        placeholder={isRegister ? '设置密码（至少 8 位，含大小写和数字）' : '请输入密码'}
                                        defaultValue=""
                                        onBlur={handlePasswordBlur}
                                        className={`${inputClass(!!passwordError)} !pr-11`}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1">
                                        <AlertCircle size={11} /> {passwordError}
                                    </p>
                                )}
                                {isRegister && passwordStrength.level > 0 && (
                                    <StrengthBar strength={passwordStrength} />
                                )}
                            </div>

                            {/* 确认密码 — 非受控 */}
                            {isRegister && (
                                <div>
                                    <div className="relative group">
                                        <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${confirmError ? 'text-red-400' : 'text-white/30 group-focus-within:text-emerald-400'}`} />
                                        <input
                                            ref={confirmRef}
                                            type={showPassword ? 'text' : 'password'}
                                            enterKeyHint="next"
                                            placeholder="请再次输入密码"
                                            defaultValue=""
                                            onBlur={handleConfirmBlur}
                                            className={inputClass(!!confirmError)}
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            spellCheck={false}
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                        />
                                    </div>
                                    {confirmError && (
                                        <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1">
                                            <AlertCircle size={11} /> {confirmError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 邀请码 — 非受控 */}
                            {isRegister && (
                                <div className="relative group">
                                    <Gift size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        ref={referralRef}
                                        type="text"
                                        placeholder="邀请码（可选，填写可获额外奖励）"
                                        defaultValue=""
                                        maxLength={6}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder:text-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-colors uppercase tracking-widest"
                                    />
                                </div>
                            )}

                            {/* Turnstile — 仅在配置了密钥时渲染 */}
                            {isTurnstileEnabled && (
                                <div className="flex justify-center">
                                    <Turnstile
                                        ref={turnstileRef}
                                        onVerify={handleTurnstileVerify}
                                        onExpire={handleTurnstileExpire}
                                        onError={handleTurnstileExpire}
                                        theme="dark"
                                    />
                                </div>
                            )}

                            {/* 错误/成功 */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
                                    <AlertCircle size={14} className="shrink-0" /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
                                    <Sparkles size={14} /> {success}
                                </div>
                            )}
                        </div>

                        {/* 提交 */}
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' }}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : tab === 'login' ? '登录' : '注册'}
                        </button>

                        {/* 协议 */}
                        <div className="flex items-center gap-2 mt-4 justify-center">
                            <button type="button" onClick={() => setAgreed(!agreed)}
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${agreed ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'}`}>
                                {agreed && <span className="text-[8px] text-white font-bold">✓</span>}
                            </button>
                            <span className="text-xs text-white/30">
                                同意《<a href="/terms" target="_blank" className="text-white/50 hover:text-emerald-400 transition-colors">用户协议</a>》和《<a href="/privacy" target="_blank" className="text-white/50 hover:text-emerald-400 transition-colors">隐私条款</a>》
                            </span>
                        </div>

                        {/* 切换 */}
                        <p className="text-center text-xs text-white/30 mt-4">
                            {tab === 'login' ? (
                                <>还没有账号？<button type="button" onClick={() => { setTab('register'); setError(''); setEmailError(''); setPasswordError(''); }} className="text-emerald-400 hover:underline cursor-pointer">立即注册</button></>
                            ) : (
                                <>已有账号？<button type="button" onClick={() => { setTab('login'); setError(''); setEmailError(''); setPasswordError(''); setConfirmError(''); }} className="text-emerald-400 hover:underline cursor-pointer">去登录</button></>
                            )}
                        </p>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
