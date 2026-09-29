/**
 * 专线视频右上角角标几何定位与缩放计算 (Watermark Placement Engine)
 * 
 * 专线部分源片右上角烧有固定尺寸标识（1920 宽源片下约为 201×64，距顶 18px、距右 68px）。
 * 宽画幅片源在播放器中按比例缩放，本函数基于元素尺寸与视频实际分辨率计算其准确的 CSS 像素坐标与缩放比例。
 */

const MARK = { top: 18, width: 201, height: 64, right: 68, rightPerExtraPx: 0.018 };
const PAD = 8;

/** 角标原始像素尺寸（按此尺寸绘制 SVG，再通过 scale 等比缩放） */
export const COVER = { width: MARK.width + 2 * PAD, height: MARK.height + 2 * PAD };

export interface CoverPlace {
  /** 距离播放器元素右边缘和上边缘的 CSS 像素 */
  right: number;
  top: number;
  /** 相对源片像素的缩放比例 */
  scale: number;
}

/**
 * 计算角标在播放器容器中的对齐位置与缩放比例
 * 视频以 contain 方式在容器中居中显示
 */
export function watermarkCover(
  box: { width: number; height: number },
  video: { width: number; height: number }
): CoverPlace | null {
  if (!box.width || !box.height || !video.width || !video.height) return null;
  const scale = Math.min(box.width / video.width, box.height / video.height);
  const sideBar = (box.width - video.width * scale) / 2;
  const topBar = (box.height - video.height * scale) / 2;
  const right = MARK.right + MARK.rightPerExtraPx * (video.width - 1920) - PAD;
  return { right: sideBar + right * scale, top: topBar + (MARK.top - PAD) * scale, scale };
}
