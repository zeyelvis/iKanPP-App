/**
 * Chinese Traditional ↔ Simplified conversion using opencc-js.
 * Provides comprehensive, dictionary-based conversion (not a fixed mapping).
 */

import * as OpenCC from 'opencc-js';

let t2sConverter: ((text: string) => string) | null = null;
let s2tConverter: ((text: string) => string) | null = null;

function getT2SConverter() {
  if (!t2sConverter) {
    t2sConverter = OpenCC.Converter({ from: 'tw', to: 'cn' });
  }
  return t2sConverter;
}

function getS2TConverter() {
  if (!s2tConverter) {
    s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  }
  return s2tConverter;
}

/**
 * Convert Traditional Chinese to Simplified Chinese (comprehensive).
 * Used for search query normalization.
 */
export function traditionalToSimplified(text: string): string {
  try {
    const converter = getT2SConverter();
    return converter ? converter(text) : text;
  } catch {
    return text;
  }
}

/**
 * Convert Simplified Chinese to Traditional Chinese (comprehensive).
 * Used for UI locale conversion.
 */
export function simplifiedToTraditional(text: string): string {
  try {
    const converter = getS2TConverter();
    return converter ? converter(text) : text;
  } catch {
    return text;
  }
}
