'use client';

import React, { useState } from 'react';
import { TitleEntity } from '@/lib/types/entity';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';

interface AiFaqSectionProps {
  entity: TitleEntity;
}

export function AiFaqSection({ entity }: AiFaqSectionProps) {
  const faqs = entity.aiContent?.faqs;
  if (!faqs || faqs.length === 0) return null;

  const [openIndices, setOpenIndices] = useState<number[]>([0]); // 默认展开第 1 条

  const toggleIndex = (index: number) => {
    setOpenIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <section 
      aria-label="iKanPP 观影答疑与权威常见问题指南" 
      className="my-10 p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-md shadow-xl below-fold-section"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {/* 模块头部 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
              <span>iKanPP 观影指南与答疑</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                官方 FAQ
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              iKanPP 官方观影指南 · 海外华人高频搜索问答权威解答
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>iKanPP 官方认证 · 100% 免费流畅</span>
        </div>
      </div>

      {/* 手风琴问答列表 */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div 
              key={index} 
              className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/15"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                type="button"
                onClick={() => toggleIndex(index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm sm:text-base text-white/90 flex items-center gap-2.5" itemProp="name">
                  <span className="w-6 h-6 rounded-lg bg-white/5 text-blue-400 text-xs flex items-center justify-center shrink-0 font-bold">
                    Q
                  </span>
                  <span>{faq.question}</span>
                </span>
                <span className="text-white/40 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div 
                  className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pl-8 text-neutral-300">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
