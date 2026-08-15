'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { generateRelatedSearchTags } from '@/lib/utils/seo-keywords';

interface RelatedKeywordsProps {
    query: string;
    onKeywordClick?: (keyword: string) => void;
    className?: string;
}

export function RelatedKeywords({
    query,
    onKeywordClick,
    className = '',
}: RelatedKeywordsProps) {
    const tags = useMemo(() => {
        return generateRelatedSearchTags(query);
    }, [query]);

    if (!query || tags.length === 0) return null;

    return (
        <div className={`my-4 p-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] backdrop-blur-md shadow-sm ${className}`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-color-secondary)] mb-2.5">
                <svg className="w-3.5 h-3.5 text-[var(--accent-color)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>智能相关搜索 · 快速直达</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Link
                        key={tag}
                        href={`/?q=${encodeURIComponent(tag)}`}
                        onClick={(e) => {
                            if (onKeywordClick) {
                                e.preventDefault();
                                onKeywordClick(tag);
                            }
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--accent-color)_8%,transparent)] hover:bg-[var(--accent-color)] text-[var(--text-color)] hover:text-white border border-[var(--glass-border)] hover:border-[var(--accent-color)] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm select-none"
                    >
                        {tag}
                    </Link>
                ))}
            </div>
        </div>
    );
}
