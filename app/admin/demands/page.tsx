'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Inbox,
  Flame,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  Film,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { TitleDemandRecord } from '@/lib/services/entity-kv';

export default function AdminDemandsPage() {
  const [demands, setDemands] = useState<TitleDemandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/demands');
      if (res.ok) {
        const json = await res.json();
        setDemands(json.data || []);
      }
    } catch (err) {
      console.error('Fetch demands error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = demands.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.year && d.year.includes(search)) ||
    d.entityId.toLowerCase().includes(search.toLowerCase())
  );

  const totalRequests = demands.reduce((acc, cur) => acc + (cur.count || 1), 0);
  const topDemand = demands[0];

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">用户求片需求工单</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              实时留痕
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            监控用户在全网无源或经典老片详情页提交的补源需求，精准洞察冷门高价值片源缺口
          </p>
        </div>

        <button
          onClick={fetchDemands}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-200 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>刷新数据</span>
        </button>
      </div>

      {/* 统计指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">累计求片影视</span>
            <Film size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{demands.length} <span className="text-sm font-normal text-slate-400">部</span></div>
          <p className="text-xs text-slate-500 mt-2">被用户主动登记的无片源影视总数</p>
        </div>

        <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">总工单请求人次</span>
            <Flame size={18} className="text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalRequests} <span className="text-sm font-normal text-slate-400">次</span></div>
          <p className="text-xs text-slate-500 mt-2">用户累计点击求片补源的总频次</p>
        </div>

        <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">当前最迫切需求</span>
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">
            {topDemand ? topDemand.title : '暂无数据'}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {topDemand ? `累计热度 ${topDemand.count} 次，上榜最高优先级` : '持续监控中'}
          </p>
        </div>
      </div>

      {/* 搜索与过滤 */}
      <div className="flex items-center justify-between gap-4 bg-[#0E0E17] border border-white/10 rounded-2xl p-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索片名、上映年份或实体 ID..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 pr-2">
          显示 {filtered.length} 条记录
        </div>
      </div>

      {/* 列表区域 */}
      <div className="bg-[#0E0E17] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={28} className="animate-spin text-red-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">正在拉取全网求片工单数据...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Inbox size={40} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">暂无求片工单记录</h3>
            <p className="text-sm text-slate-500 mt-1">当用户在无片源详情页点击求片后，将在此实时呈现</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">排名</th>
                  <th className="px-6 py-4">影视条目</th>
                  <th className="px-6 py-4">分类 / 年份</th>
                  <th className="px-6 py-4">求片热度</th>
                  <th className="px-6 py-4">首次请求</th>
                  <th className="px-6 py-4">最新请求</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item, index) => {
                  const isTop3 = index < 3;
                  return (
                    <tr key={item.entityId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0
                              ? 'bg-amber-500 text-black'
                              : index === 1
                              ? 'bg-slate-300 text-black'
                              : index === 2
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="w-10 h-14 object-cover rounded-md border border-white/10 shrink-0 bg-white/5"
                            />
                          ) : (
                            <div className="w-10 h-14 rounded-md border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                              <Film size={18} className="text-slate-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{item.title}</span>
                              <span className="text-[11px] text-slate-500 font-mono">({item.entityId})</span>
                            </div>
                            <button
                              onClick={() => handleCopy(item.title, item.entityId)}
                              className="text-xs text-slate-400 hover:text-slate-200 mt-0.5 inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === item.entityId ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span className="text-emerald-400">已复制片名</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>复制片名去补源</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-slate-300">
                            {item.type === 'movie' ? '电影' : item.type === 'tv' ? '电视剧' : '影视'}
                          </span>
                          {item.year && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{item.year} 年</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <Flame size={13} className="fill-red-400" />
                          <span>{item.count} 次求片</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {item.firstRequestedAt ? new Date(item.firstRequestedAt).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {item.lastRequestedAt ? new Date(item.lastRequestedAt).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/title/${item.entityId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer border border-white/10"
                        >
                          <span>查看详情</span>
                          <ExternalLink size={12} />
                        </Link>
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
