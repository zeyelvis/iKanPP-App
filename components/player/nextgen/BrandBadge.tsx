import React from 'react';
import { COVER } from './watermark';

/**
 * 专线视频专用品牌覆盖角标 (Brand Badge for ShadowLine Stream)
 * 采用 SVG 矢量绘制并等比缩放，避免移动端字体受限于浏览器最小字号
 */
export function BrandBadge() {
  return (
    <svg viewBox={`0 0 ${COVER.width} ${COVER.height}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ng-badge-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a45" />
          <stop offset="100%" stopColor="#d0461f" />
        </linearGradient>
      </defs>
      {/* 暗夜高级遮盖底板 */}
      <rect width={COVER.width} height={COVER.height} rx="14" fill="#121318" />
      {/* 品牌微晶 Icon */}
      <g transform="translate(12, 10) scale(0.92)">
        <rect width="64" height="64" rx="16" fill="url(#ng-badge-grad)" />
        <rect x="13" y="15" width="31" height="26" rx="6" fill="#ffffff" fillOpacity="0.35" />
        <rect x="20" y="22" width="32" height="27" rx="6.5" fill="#ffffff" />
        <path d="M32.5 29.5v13c0 0.9 1 1.4 1.7 0.9l9.5-6.5c0.6-0.4 0.6-1.3 0-1.7l-9.5-6.5c-0.7-0.5-1.7 0-1.7 0.8z" fill="#d0461f" />
      </g>
      {/* 品牌主标题 */}
      <text
        x="80"
        y="42"
        fill="#ffffff"
        fontSize="28"
        fontWeight="800"
        letterSpacing="1"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        iKanPP
      </text>
      {/* 域名副标 */}
      <text
        x="81"
        y="64"
        fill="#ffffff"
        fillOpacity="0.75"
        fontSize="15"
        fontWeight="600"
        letterSpacing="1.2"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        ikanpp.com
      </text>
    </svg>
  );
}
