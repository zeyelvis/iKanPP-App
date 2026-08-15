import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// 常用海外华人国家与大区中文映射字典
const COUNTRY_MAP: Record<string, { name: string; region: string }> = {
    US: { name: '美国', region: '北美' },
    CA: { name: '加拿大', region: '北美' },
    SG: { name: '新加坡', region: '东南亚' },
    MY: { name: '马来西亚', region: '东南亚' },
    AU: { name: '澳大利亚', region: '大洋洲' },
    NZ: { name: '新西兰', region: '大洋洲' },
    GB: { name: '英国', region: '欧洲' },
    DE: { name: '德国', region: '欧洲' },
    FR: { name: '法国', region: '欧洲' },
    IT: { name: '意大利', region: '欧洲' },
    ES: { name: '西班牙', region: '欧洲' },
    NL: { name: '荷兰', region: '欧洲' },
    JP: { name: '日本', region: '东亚' },
    KR: { name: '韩国', region: '东亚' },
    HK: { name: '中国香港', region: '港澳台' },
    TW: { name: '中国台湾', region: '港澳台' },
    MO: { name: '中国澳门', region: '港澳台' },
    TH: { name: '泰国', region: '东南亚' },
    PH: { name: '菲律宾', region: '东南亚' },
    ID: { name: '印度尼西亚', region: '东南亚' },
    VN: { name: '越南', region: '东南亚' },
    CN: { name: '中国大陆', region: '亚太' },
};

// 常见 Cloudflare 边缘机房机场三字代码映射
const AIRPORT_IATA_MAP: Record<string, string> = {
    SJC: '美西硅谷 (SJC)',
    LAX: '美西洛杉矶 (LAX)',
    SFO: '美西旧金山 (SFO)',
    SEA: '美西北西雅图 (SEA)',
    JFK: '美东纽约 (JFK)',
    EWR: '美东纽瓦克 (EWR)',
    IAD: '美东华盛顿 (IAD)',
    ORD: '美中芝加哥 (ORD)',
    DFW: '美南达拉斯 (DFW)',
    YVR: '加拿大温哥华 (YVR)',
    YYZ: '加拿大多伦多 (YYZ)',
    SIN: '新加坡 (SIN)',
    KUL: '马来西亚吉隆坡 (KUL)',
    HKG: '中国香港 (HKG)',
    TPE: '中国台北 (TPE)',
    NRT: '日本东京 (NRT)',
    KIX: '日本大阪 (KIX)',
    ICN: '韩国首尔 (ICN)',
    SYD: '澳大利亚悉尼 (SYD)',
    MEL: '澳大利亚墨尔本 (MEL)',
    AKL: '新西兰奥克兰 (AKL)',
    LHR: '英国伦敦 (LHR)',
    FRA: '德国法兰克福 (FRA)',
    CDG: '法国巴黎 (CDG)',
    AMS: '荷兰阿姆斯特丹 (AMS)',
};

/**
 * GET /api/geo
 * 毫秒级返回 Cloudflare Edge 识别的地理位置、国家、城市与最近边缘加速节点
 */
export async function GET(request: NextRequest) {
    const countryCode = (request.headers.get('cf-ipcountry') || 'US').toUpperCase();
    const city = request.headers.get('cf-ipcity') || '';
    const regionName = request.headers.get('cf-region') || '';
    const timezone = request.headers.get('cf-timezone') || 'UTC';
    const rayId = request.headers.get('cf-ray') || '';

    // 解析 Cloudflare 机房代码（如 a2b59ac7be2b5f5e-SIN 中的 SIN）
    const nodeMatch = rayId.match(/-([A-Z]{3})$/i);
    const nodeCode = nodeMatch ? nodeMatch[1].toUpperCase() : '';
    const nodeName = AIRPORT_IATA_MAP[nodeCode] || (nodeCode ? `Cloudflare 边缘节点 (${nodeCode})` : 'Cloudflare 全球边缘网络');

    const countryInfo = COUNTRY_MAP[countryCode] || {
        name: countryCode,
        region: '全球',
    };

    const isOverseas = countryCode !== 'CN';

    return NextResponse.json({
        countryCode,
        countryName: countryInfo.name,
        region: countryInfo.region,
        city: decodeURIComponent(city),
        state: decodeURIComponent(regionName),
        timezone,
        cfNode: nodeName,
        cfNodeCode: nodeCode,
        isOverseas,
        directStreamingAccelerated: true,
    }, {
        headers: {
            'Cache-Control': 'public, max-age=600, s-maxage=600',
        },
    });
}
