import { cfEnv } from '@/lib/server/cf-env';

/**
 * Workers KV（绑定 KVIDEO_KV）的读写。2026-10-08 起片库在 D1，KV 只存求片记录、后台审计日志、专线配置与探活、
 * 专题与线路排序这几类小数据。没有绑定（构建阶段）时读返回 null、写不做任何事。
 */
interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

function kv(): KVLike | null {
  return (cfEnv()?.KVIDEO_KV as KVLike | undefined) ?? null;
}

export async function kvGet(key: string): Promise<string | null> {
  try {
    return (await kv()?.get(key)) ?? null;
  } catch (err) {
    console.warn(`[kv] 读取 ${key} 失败:`, err);
    return null;
  }
}

export async function kvPut(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
  try {
    await kv()?.put(key, value, options);
  } catch (err) {
    console.warn(`[kv] 写入 ${key} 失败:`, err);
  }
}
