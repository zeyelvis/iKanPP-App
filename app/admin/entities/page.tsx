'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Film,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Edit,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
} from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';

export default function AdminEntitiesPage() {
  const [items, setItems] = useState<TitleEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);

  // 筛选与搜索
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('all');
  const [scoreRange, setScoreRange] = useState('all');
  const [sort, setSort] = useState('latest');

  // 批量勾选
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEntities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '24');
      if (channel !== 'all') params.set('channel', channel);
      if (scoreRange !== 'all') params.set('scoreRange', scoreRange);
      if (sort) params.set('sort', sort);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/entities?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPageCount(data.pageCount || 1);
      }
    } catch (err: any) {
      console.error('[Fetch Entities] 失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, channel, scoreRange, sort, search]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // 处理全选 / 反选
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.entityId));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 单条删除
  const handleDelete = async (entity: TitleEntity) => {
    if (!confirm(`确定要从 KV 中物理删除影视实体《${entity.title}》(${entity.entityId}) 吗？此操作不可撤销！`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/entities/${entity.entityId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: `已成功删除《${entity.title}》` });
        fetchEntities();
      } else {
        setActionMessage({ type: 'error', text: data.error || '删除失败' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '删除请求异常' });
    }
  };

  // 批量推送 Google
  const handleBatchPushGoogle = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const selectedEntities = items.filter((i) => selectedIds.includes(i.entityId));
      const urls = selectedEntities.map(
        (e) => `https://www.ikanpp.com/title/${e.entityId}-${e.slug}`
      );
      const res = await fetch('/api/admin/indexing/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, type: 'URL_UPDATED' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `批量推送成功：${data.pushedCount || urls.length} 条已推至 Google Indexing`,
        });
        setSelectedIds([]);
      } else {
        setActionMessage({ type: 'error', text: data.error || '推送失败' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '网络异常' });
    } finally {
      setBatchActionLoading(false);
    }
  };

  // 批量推送 IndexNow
  const handleBatchIndexNow = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const selectedEntities = items.filter((i) => selectedIds.includes(i.entityId));
      const urls = selectedEntities.map(
        (e) => `https://www.ikanpp.com/title/${e.entityId}-${e.slug}`
      );
      const res = await fetch('/api/admin/indexing/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `IndexNow 广播已触发：共提交 ${urls.length} 条 URL`,
        });
        setSelectedIds([]);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'IndexNow 广播失败' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '网络异常' });
    } finally {
      setBatchActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与快速刷新 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>影视实体库管理</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-mono">
              共 {total.toLocaleString()} 条
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            基于 Cloudflare KV 原子索引，支持实时多维检索、SEO 评分查看与手动促抓
          </p>
        </div>

        <button
          onClick={() => fetchEntities()}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
          <span>{loading ? '检索中...' : '刷新列表'}</span>
        </button>
      </div>

      {/* 消息提示框 */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs hover:underline px-2 py-0.5"
          >
            关闭
          </button>
        </div>
      )}

      {/* 搜索与多维过滤条 */}
      <div className="admin-glass-panel p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="搜索片名、原名、entityId (如 ik000001) 或 TMDB ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500/50 transition-colors"
            />
          </div>

          {/* 频道分类 */}
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-[#12121A] border border-white/10 text-xs text-slate-300 focus:outline-hidden focus:border-red-500/50"
          >
            <option value="all">全站频道 (全部)</option>
            <option value="movie">电影 (Movie)</option>
            <option value="tv">电视剧 (TV)</option>
            <option value="anime">动漫 (Anime)</option>
            <option value="variety">综艺 (Variety)</option>
            <option value="documentary">纪录片 (Documentary)</option>
            <option value="short">短剧 (Short Drama)</option>
          </select>

          {/* SEO 质量分 */}
          <select
            value={scoreRange}
            onChange={(e) => {
              setScoreRange(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-[#12121A] border border-white/10 text-xs text-slate-300 focus:outline-hidden focus:border-red-500/50"
          >
            <option value="all">SEO 评分 (全部)</option>
            <option value="excellent">优秀 (≥80分)</option>
            <option value="good">合格 (60~79分)</option>
            <option value="needsWork">待优化 (&lt;60分)</option>
          </select>

          {/* 排序方式 */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-[#12121A] border border-white/10 text-xs text-slate-300 focus:outline-hidden focus:border-red-500/50"
          >
            <option value="latest">最新入库</option>
            <option value="rating">最高评分</option>
            <option value="popularity">最高热度</option>
          </select>
        </div>

        {/* 批量操作工具条（当有选中时显现） */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-medium">已勾选 {selectedIds.length} 项</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-red-400 hover:underline text-[11px]"
              >
                取消勾选
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchPushGoogle}
                disabled={batchActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>批量推送 Google</span>
              </button>

              <button
                onClick={handleBatchIndexNow}
                disabled={batchActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>批量广播 IndexNow</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 实体数据表格 */}
      <div className="admin-glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-medium select-none">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-white/5"
                  />
                </th>
                <th className="py-3 px-4 w-28">Entity ID</th>
                <th className="py-3 px-4 min-w-[200px]">片名 / 别名 Slug</th>
                <th className="py-3 px-3 w-20">分类</th>
                <th className="py-3 px-3 w-20">年份</th>
                <th className="py-3 px-3 w-20">评分</th>
                <th className="py-3 px-3 w-24">SEO 质量分</th>
                <th className="py-3 px-4 w-32 text-right">操作</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                      <span>正在加载实体数据...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    未检索到符合条件的影视实体。请调整关键词或清除筛选条件。
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isSelected = selectedIds.includes(item.entityId);
                  const score = item.seoScore ?? 75;
                  const scoreColor =
                    score >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : score >= 60
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20';

                  return (
                    <tr
                      key={item.entityId}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.entityId)}
                          className="rounded border-white/20 bg-white/5"
                        />
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                        {item.entityId}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* 封面 */}
                          <div className="w-8 h-12 rounded bg-white/5 overflow-hidden shrink-0 border border-white/10 relative">
                            {item.cover ? (
                              <img
                                src={item.cover}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                                暂无
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate hover:text-red-400 transition-colors">
                              <Link href={`/admin/entities/edit?id=${item.entityId}`}>
                                {item.title}
                              </Link>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">
                              /title/{item.entityId}-{item.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[11px]">
                          {item.type || '未分类'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {item.year || '-'}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {item.rate || '-'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-semibold ${scoreColor}`}
                        >
                          {score} 分
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/title/${item.entityId}-${item.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="前台详情页预览"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/entities/edit?id=${item.entityId}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="编辑实体"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="下架删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控制栏 */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            显示第 {(page - 1) * 24 + 1} 至 {Math.min(page * 24, total)} 条，共 {total} 条
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono px-2 text-slate-200">
              {page} / {pageCount || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
