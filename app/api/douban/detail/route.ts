import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 获取豆瓣影片详情（导演、演员、类型、地区等）
 * 使用 subject_abstract API 获取基本信息
 * 因豆瓣反爬限制，部分影片可能返回空数据，前端需优雅降级
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://movie.douban.com/j/subject_abstract?subject_id=${id}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': `https://movie.douban.com/subject/${id}/`,
                },
                next: { revalidate: 86400 },
            }
        );

        if (!response.ok) {
            throw new Error(`Douban API returned ${response.status}`);
        }

        const data = await response.json();

        // API 返回错误
        if (data.r === 'error' || !data.subject) {
            return NextResponse.json({
                id, description: '', directors: [], actors: [],
                year: '', types: [], region: '',
            });
        }

        const subject = data.subject;

        return NextResponse.json({
            id,
            title: subject.title || '',
            description: subject.short_info || '',
            directors: subject.directors || [],
            actors: subject.actors || [],
            year: subject.year || '',
            types: subject.types || [],
            region: Array.isArray(subject.region) ? subject.region.join(' / ') : (subject.region || ''),
        }, {
            headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                'CDN-Cache-Control': 'public, s-maxage=86400',
                'Cloudflare-CDN-Cache-Control': 'public, s-maxage=86400',
            },
        });
    } catch (error) {
        console.error('Douban detail API error:', error);
        return NextResponse.json({
            id, description: '', directors: [], actors: [],
            year: '', types: [], region: '',
        }, { status: 200 });
    }
}
