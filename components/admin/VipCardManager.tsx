'use client';

/**
 * VipCardManager — 管理员 VIP 卡密管理中心
 * 支持批量生成卡密、一键导出复制、卡密状态查询与卡密作废
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Key, Plus, Copy, Check, Trash2, RefreshCw, Loader2,
    Shield, Filter, Download, AlertCircle, CheckCircle2,
    Sparkles, Calendar, Clock, User
} from 'lucide-react';
import { VIP_CARD_DEFINITIONS, type VipCardType } from '@/lib/vip/cards';
import type { VipCardRecord } from '@/lib/supabase/cards';

export function VipCardManager() {
    // 生成表单状态
    const [cardType, setCardType] = useState<VipCardType>('month');
    const [count, setCount] = useState<number>(5);
    const [batchName, setBatchName] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generateMsg, setGenerateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 刚生成的卡密列表（方便一键复制）
    const [newlyCreatedCards, setNewlyCreatedCards] = useState<VipCardRecord[]>([]);
    const [copiedAll, setCopiedAll] = useState(false);

    // 卡密列表与筛选
    const [cards, setCards] = useState<VipCardRecord[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'used' | 'revoked'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // 加载卡密列表
    const fetchCards = useCallback(async () => {
        setLoadingCards(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (typeFilter !== 'all') params.set('cardType', typeFilter);
            params.set('limit', '100');

            const res = await fetch(`/api/vip/cards?${params.toString()}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setCards(data.cards || []);
            }
        } catch (err) {
            console.error('加载卡密失败:', err);
        } finally {
            setLoadingCards(false);
        }
    }, [statusFilter, typeFilter]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    // 提交生成卡密
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        setGenerateMsg(null);
        try {
            const res = await fetch('/api/vip/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardType,
                    count,
                    batchName: batchName.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setGenerateMsg({ type: 'success', text: data.message });
                setNewlyCreatedCards(data.cards || []);
                setBatchName('');
                fetchCards();
            } else {
                setGenerateMsg({ type: 'error', text: data.message || '生成失败' });
            }
        } catch (err: any) {
            setGenerateMsg({ type: 'error', text: '请求异常，请稍后重试' });
        } finally {
            setGenerating(false);
        }
    };

    // 一键复制刚生成的卡密
    const handleCopyAllNew = () => {
        if (newlyCreatedCards.length === 0) return;
        const text = newlyCreatedCards.map(c => c.code).join('\n');
        navigator.clipboard.writeText(text);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    // 复制单张卡密
    const handleCopySingle = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCardId(id);
        setTimeout(() => setCopiedCardId(null), 1500);
    };

    // 作废单张卡密
    const handleRevoke = async (cardId: string) => {
        if (!confirm('确定要作废此卡密吗？作废后无法恢复。')) return;
        setActionLoadingId(cardId);
        try {
            const res = await fetch('/api/vip/cards', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                fetchCards();
            } else {
                alert(data.message || '作废失败');
            }
        } catch (err) {
            alert('操作异常');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* 批量生成器面板 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 sm:p-6 backdrop-blur-2xl shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Plus size={18} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-white">批量卡密生成器</h3>
                        <p className="text-xs text-white/50">支持按批次生成体验卡、月卡、季卡、年卡与永久卡密</p>
                    </div>
                </div>

                <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 卡密类型 */}
                    <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">卡密规格</label>
                        <select
                            value={cardType}
                            onChange={(e) => setCardType(e.target.value as VipCardType)}
                            className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        >
                            {Object.values(VIP_CARD_DEFINITIONS).map(def => (
                                <option key={def.type} value={def.type} className="bg-[#12121A] text-white">
                                    {def.label} ({def.days === 36500 ? '永久' : `${def.days}天`})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 生成数量 */}
                    <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">生成张数 (1-100)</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                    </div>

                    {/* 批次备注 */}
                    <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">批次备注 (可选)</label>
                        <input
                            type="text"
                            placeholder="如：TG社群活动 / 发卡平台批次"
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                    </div>

                    <div className="sm:col-span-3 pt-2">
                        <button
                            type="submit"
                            disabled={generating}
                            className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {generating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>正在写入数据库...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>一键批量生成卡密</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* 生成提示 */}
                {generateMsg && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
                        generateMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                        {generateMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                        <span>{generateMsg.text}</span>
                    </div>
                )}

                {/* 刚生成的卡密快速复制面板 */}
                {newlyCreatedCards.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/50 border border-amber-400/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">
                                刚刚生成 {newlyCreatedCards.length} 张卡密
                            </span>
                            <button
                                onClick={handleCopyAllNew}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-black flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                            >
                                {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedAll ? '已全部复制！' : '一键全部复制'}</span>
                            </button>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-xs text-white/80 select-all pr-2">
                            {newlyCreatedCards.map(c => (
                                <div key={c.id} className="py-0.5 border-b border-white/5">
                                    {c.code}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 卡密列表管理 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 sm:p-6 backdrop-blur-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                        <Key size={18} className="text-amber-400" />
                        <h3 className="text-base sm:text-lg font-black text-white">卡密库与核销记录</h3>
                        <span className="text-xs text-white/40">({cards.length} 张)</span>
                    </div>

                    {/* 筛选栏 */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white/80 focus:border-amber-400 focus:outline-none"
                        >
                            <option value="all" className="bg-[#12121A]">全部状态</option>
                            <option value="unused" className="bg-[#12121A]">🟢 未激活</option>
                            <option value="used" className="bg-[#12121A]">⚪ 已激活</option>
                            <option value="revoked" className="bg-[#12121A]">🔴 已作废</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white/80 focus:border-amber-400 focus:outline-none"
                        >
                            <option value="all" className="bg-[#12121A]">全部规格</option>
                            {Object.values(VIP_CARD_DEFINITIONS).map(def => (
                                <option key={def.type} value={def.type} className="bg-[#12121A]">
                                    {def.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={fetchCards}
                            disabled={loadingCards}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                            title="刷新列表"
                        >
                            <RefreshCw size={14} className={loadingCards ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* 列表 */}
                {loadingCards && cards.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-white/40">
                        <Loader2 size={24} className="animate-spin text-amber-400" />
                        <span className="text-xs">加载卡密库...</span>
                    </div>
                ) : cards.length === 0 ? (
                    <div className="py-12 text-center text-white/30 text-xs">
                        暂无卡密记录，可通过上方生成器批量创建
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-white/50 font-medium">
                                    <th className="py-2.5 px-3">卡密激活码</th>
                                    <th className="py-2.5 px-3">规格/天数</th>
                                    <th className="py-2.5 px-3">状态</th>
                                    <th className="py-2.5 px-3">激活者</th>
                                    <th className="py-2.5 px-3">创建/激活时间</th>
                                    <th className="py-2.5 px-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {cards.map((card) => {
                                    const def = VIP_CARD_DEFINITIONS[card.card_type] || { label: card.card_type, badgeColor: 'bg-white/10 text-white' };
                                    const isUsed = card.status === 'used';
                                    const isRevoked = card.status === 'revoked';

                                    return (
                                        <tr key={card.id} className="hover:bg-white/[0.02] transition-colors">
                                            {/* 卡密 */}
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-white tracking-wider">
                                                        {card.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopySingle(card.code, card.id)}
                                                        className="p-1 rounded text-white/40 hover:text-amber-400 transition-colors cursor-pointer"
                                                        title="复制卡密"
                                                    >
                                                        {copiedCardId === card.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                                    </button>
                                                </div>
                                                {card.batch_name && (
                                                    <div className="text-[10px] text-white/40 mt-0.5">{card.batch_name}</div>
                                                )}
                                            </td>

                                            {/* 规格 */}
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${def.badgeColor}`}>
                                                    {def.label}
                                                </span>
                                            </td>

                                            {/* 状态 */}
                                            <td className="py-3 px-3">
                                                {isUsed ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-white/50">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                                        已激活
                                                    </span>
                                                ) : isRevoked ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                        已作废
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        未激活
                                                    </span>
                                                )}
                                            </td>

                                            {/* 激活者 */}
                                            <td className="py-3 px-3 text-white/70">
                                                {card.user_email ? (
                                                    <span className="truncate max-w-[140px] block" title={card.user_email}>
                                                        {card.user_email}
                                                    </span>
                                                ) : isUsed ? (
                                                    <span className="text-white/40">已核销</span>
                                                ) : (
                                                    <span className="text-white/20">—</span>
                                                )}
                                            </td>

                                            {/* 时间 */}
                                            <td className="py-3 px-3 text-[11px] text-white/50">
                                                <div>创建：{new Date(card.created_at).toLocaleDateString('zh-CN')}</div>
                                                {card.used_at && (
                                                    <div className="text-emerald-400/80">激活：{new Date(card.used_at).toLocaleDateString('zh-CN')}</div>
                                                )}
                                            </td>

                                            {/* 操作 */}
                                            <td className="py-3 px-3 text-right">
                                                {card.status === 'unused' && (
                                                    <button
                                                        onClick={() => handleRevoke(card.id)}
                                                        disabled={actionLoadingId === card.id}
                                                        className="px-2.5 py-1 rounded-lg text-[11px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                                                    >
                                                        作废
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
