'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  Zap,
  Radio,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  Film,
} from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';
import { SerpPreview } from '@/components/admin/SerpPreview';

export function EntityEditClient({ id }: { id: string }) {
  const router = useRouter();

  const [entity, setEntity] = useState<TitleEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushingGoogle, setPushingGoogle] = useState(false);
  const [pushingIndexNow, setPushingIndexNow] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表单状态
  const [formData, setFormData] = useState<Partial<TitleEntity>>({});

  useEffect(() => {
    async function loadEntity() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/entities/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.entity) {
          setEntity(data.entity);
          setFormData(data.entity);
        } else {
          setMessage({ type: 'error', text: data.error || '无法找到实体' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || '加载实体数据失败' });
      } finally {
        setLoading(false);
      }
    }
    if (id) loadEntity();
  }, [id]);

  // 表单字段变更
  const handleChange = (field: keyof TitleEntity, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'genres' | 'directors' | 'actors' | 'keywords', raw: string) => {
    const arr = raw
      .split(/[,，/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, [field]: arr }));
  };

  // 保存修改
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`/api/admin/entities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setEntity(data.entity);
        setFormData(data.entity);
        setMessage({ type: 'success', text: '实体修改已成功保存至 Cloudflare KV 并自动同步全套索引' });
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络请求异常' });
    } finally {
      setSaving(false);
    }
  };

  // 单条推送 Google
  const handlePushGoogle = async () => {
    if (!entity) return;
    try {
      setPushingGoogle(true);
      const targetUrl = `https://www.ikanpp.com/title/${entity.entityId}-${entity.slug}`;
      const res = await fetch('/api/admin/indexing/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [targetUrl], type: 'URL_UPDATED' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Google Indexing 促抓推送成功 (HTTP 200)` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Google Indexing 推送失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络异常' });
    } finally {
      setPushingGoogle(false);
    }
  };

  // 单条广播 IndexNow
  const handlePushIndexNow = async () => {
    if (!entity) return;
    try {
      setPushingIndexNow(true);
      const targetUrl = `https://www.ikanpp.com/title/${entity.entityId}-${entity.slug}`;
      const res = await fetch('/api/admin/indexing/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [targetUrl] }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'IndexNow 广播成功已下发' });
      } else {
        setMessage({ type: 'error', text: data.error || 'IndexNow 广播失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络异常' });
    } finally {
      setPushingIndexNow(false);
    }
  };

  // 物理删除
  const handleDelete = async () => {
    if (!confirm(`确定要物理删除《${entity?.title}》吗？删除后所有反向索引都将清除！`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/entities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('删除成功');
        router.push('/admin/entities');
      } else {
        setMessage({ type: 'error', text: data.error || '删除失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络异常' });
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        正在加载实体数据...
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/entities"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回实体列表</span>
        </Link>
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/20 text-center text-red-300 text-sm">
          未找到实体 {id}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部导航与快捷操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/entities"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>编辑影视实体</span>
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                {entity.entityId}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              修改后将同步更新 KV 存储、TMDB 别名映射与 14 套反向索引集合
            </p>
          </div>
        </div>

        {/* 右侧动作按钮组 */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/title/${entity.entityId}-${entity.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 border border-white/10 transition-colors"
          >
            <span>前台详情</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handlePushGoogle}
            disabled={pushingGoogle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{pushingGoogle ? '推送中...' : '促抓 Google'}</span>
          </button>

          <button
            type="button"
            onClick={handlePushIndexNow}
            disabled={pushingIndexNow}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{pushingIndexNow ? '广播中...' : 'IndexNow'}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
            title="删除实体"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 提示条 */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">
            关闭
          </button>
        </div>
      )}

      {/* SERP 实时高保真预览 */}
      <SerpPreview entity={formData} />

      {/* 编辑表单 */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 只读物理属性栏 */}
        <div className="admin-glass-panel p-4 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>核心物理主键 (只读保护)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[11px]">Entity ID:</span>
              <div className="font-mono font-semibold text-slate-200 mt-0.5">{entity.entityId}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[11px]">TMDB ID:</span>
              <div className="font-mono font-semibold text-slate-200 mt-0.5">
                {entity.tmdbId} ({entity.tmdbType})
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[11px]">入库时间:</span>
              <div className="font-mono text-slate-200 mt-0.5 text-[11px]">
                {entity.createdAt ? new Date(entity.createdAt).toLocaleDateString('zh-CN') : '-'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[11px]">实时 SEO 评分:</span>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">
                {formData.seoScore ?? entity.seoScore ?? 80} 分
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容编辑区 */}
        <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-white">影视基本信息</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* 标题 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">中文主标题 *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 原标题 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">原语言标题</label>
              <input
                type="text"
                value={formData.originalTitle || ''}
                onChange={(e) => handleChange('originalTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 拼音别名 Slug */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">拼音别名 Slug *</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 类型 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">频道类型</label>
              <select
                value={formData.type || 'movie'}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#12121A] border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              >
                <option value="movie">电影 (Movie)</option>
                <option value="tv">电视剧 (TV)</option>
                <option value="anime">动漫 (Anime)</option>
                <option value="variety">综艺 (Variety)</option>
                <option value="documentary">纪录片 (Documentary)</option>
                <option value="short">短剧 (Short)</option>
              </select>
            </div>

            {/* 年份 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">上映年份</label>
              <input
                type="text"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 评分 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">评分 (豆瓣/TMDB)</label>
              <input
                type="text"
                value={formData.rate || ''}
                onChange={(e) => handleChange('rate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 国家地区 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">制片国家/地区</label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 语言 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">语言</label>
              <input
                type="text"
                value={formData.language || ''}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            {/* 连载状态 */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">状态 (完结 / 连载中)</label>
              <input
                type="text"
                value={formData.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>
          </div>

          {/* 媒体图片 URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">海报 URL (Cover)</label>
              <input
                type="text"
                value={formData.cover || ''}
                onChange={(e) => handleChange('cover', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[11px] focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">剧照横图 URL (Backdrop)</label>
              <input
                type="text"
                value={formData.backdrop || ''}
                onChange={(e) => handleChange('backdrop', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[11px] focus:outline-hidden focus:border-red-500/50"
              />
            </div>
          </div>

          {/* 标签列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">题材分类 (用逗号分隔)</label>
              <input
                type="text"
                value={(formData.genres || []).join(', ')}
                onChange={(e) => handleArrayChange('genres', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">核心标签/关键词 (用逗号分隔)</label>
              <input
                type="text"
                value={(formData.keywords || []).join(', ')}
                onChange={(e) => handleArrayChange('keywords', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>
          </div>

          {/* 演职员 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">导演 (用逗号分隔)</label>
              <input
                type="text"
                value={(formData.directors || []).join(', ')}
                onChange={(e) => handleArrayChange('directors', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">主要演员 (用逗号分隔)</label>
              <input
                type="text"
                value={(formData.actors || []).join(', ')}
                onChange={(e) => handleArrayChange('actors', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-red-500/50"
              />
            </div>
          </div>

          {/* 剧情梗概 */}
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">剧情简介 (完整中文梗概，用于 SEO 丰富度)</label>
              <span className="text-slate-400 font-mono text-[11px]">
                {(formData.description || '').length} 字 (≥80字获评最高质量分)
              </span>
            </div>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white leading-relaxed focus:outline-hidden focus:border-red-500/50"
            />
          </div>
        </div>

        {/* 底部保存提交按钮 */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/entities"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
          >
            取消
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '正在写回 KV 并重建索引...' : '保存实体修改'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
