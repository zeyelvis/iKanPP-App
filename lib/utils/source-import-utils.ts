/**
 * Source Import Utilities - Handle parsing and importing sources from various formats
 */

import type { VideoSource, SourceSubscription } from '@/lib/types';

/**
 * Simplified source format for import
 */
export interface ImportSourceFormat {
    id: string;
    name: string;
    baseUrl: string;
    /** 旧格式里的分组；'premium'（午夜特区）的片源在主站一律跳过 */
    group?: 'normal' | 'premium';
    enabled?: boolean;
    priority?: number;
}

/**
 * Import result containing categorized sources
 */
export interface ImportResult {
    normalSources: VideoSource[];
    totalCount: number;
}

/**
 * Convert simplified import format to full VideoSource
 */
export function convertToVideoSource(source: ImportSourceFormat): VideoSource {
    return {
        id: source.id,
        name: source.name,
        baseUrl: source.baseUrl,
        searchPath: '',
        detailPath: '',
        enabled: source.enabled !== false,
        priority: source.priority || 1,
    };
}

/**
 * Validate if an object is a valid source format
 */
export function isValidSourceFormat(obj: unknown): obj is ImportSourceFormat {
    if (typeof obj !== 'object' || obj === null) return false;
    const source = obj as Record<string, unknown>;
    return (
        typeof source.id === 'string' &&
        typeof source.name === 'string' &&
        typeof source.baseUrl === 'string' &&
        source.id.length > 0 &&
        source.name.length > 0 &&
        source.baseUrl.length > 0
    );
}

/**
 * Parse sources from JSON string
 * Supports both array format and wrapped object format
 */
export function parseSourcesFromJson(jsonString: string): ImportResult {
    const data = JSON.parse(jsonString);

    let sourcesArray: unknown[];

    // Handle different JSON structures
    if (Array.isArray(data)) {
        sourcesArray = data;
    } else if (data.sources && Array.isArray(data.sources)) {
        sourcesArray = data.sources;
    } else if (data.list && Array.isArray(data.list)) {
        sourcesArray = data.list;
    } else {
        throw new Error('无法识别的JSON格式');
    }

    const normalSources: VideoSource[] = [];

    for (const item of sourcesArray) {
        if (!isValidSourceFormat(item) || item.group === 'premium') continue;
        normalSources.push(convertToVideoSource(item));
    }

    return {
        normalSources,
        totalCount: normalSources.length,
    };
}

/**
 * Fetch and parse sources from a URL
 */
export async function fetchSourcesFromUrl(url: string): Promise<ImportResult> {
    // 浏览器直接请求订阅地址；主站没有代理接口（AGENTS 第 1、8 条）
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
        throw new Error(`获取失败: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return parseSourcesFromJson(text);
}

/**
 * Create a new subscription object
 */
export function createSubscription(name: string, url: string): SourceSubscription {
    return {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: name.trim() || '未命名订阅',
        url: url.trim(),
        lastUpdated: 0,
        autoRefresh: true,
    };
}

/**
 * Merge new sources with existing sources, avoiding duplicates
 */
export function mergeSources(
    existing: VideoSource[],
    newSources: VideoSource[]
): VideoSource[] {
    const existingIds = new Set(existing.map(s => s.id));
    const merged = [...existing];

    for (const source of newSources) {
        if (existingIds.has(source.id)) {
            // Update existing source
            const idx = merged.findIndex(s => s.id === source.id);
            if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...source };
            }
        } else {
            // Add new source
            merged.push({
                ...source,
                priority: merged.length + 1,
            });
            existingIds.add(source.id);
        }
    }

    return merged;
}
