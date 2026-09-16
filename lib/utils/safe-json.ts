/**
 * Safe JSON Parser for BigInt / Snowflake IDs
 * 第三方采集站（如巨量资源等）的 vod_id 使用了 64 位雪花大整数（例如 629599638457942021）
 * 标准 JavaScript JSON.parse 在解析超出 Number.MAX_SAFE_INTEGER (9007199254740991) 的数字时
 * 会强制舍入截断导致末尾变为 000（如 629599638457942000），引发接口 400 死链
 * 本模块在 JSON.parse 之前通过正则将大整数字段安全转化为字符串，彻底杜绝精度丢失
 */

export function safeJsonParse<T = any>(jsonString: string): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return jsonString as any;
  }

  // 匹配大于等于 15 位数字的 vod_id, emp_content_id, id 字段并包装成字符串
  const sanitized = jsonString.replace(
    /"(vod_id|emp_content_id|type_id|id)":\s*(\d{15,})/g,
    '"$1":"$2"'
  );

  return JSON.parse(sanitized);
}

/**
 * 异步从 Fetch Response 安全解析 JSON（带大整数保护）
 */
export async function safeParseResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  return safeJsonParse<T>(text);
}
