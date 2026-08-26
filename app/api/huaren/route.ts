import { NextRequest, NextResponse } from 'next/server';
import { HUAREN_REAL_SECTIONS } from '@/lib/data/huaren-real-data';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get('mode') || 'home';

        if (mode === 'home') {
            return NextResponse.json({
                success: true,
                sections: HUAREN_REAL_SECTIONS,
                updatedAt: Date.now(),
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            });
        }

        return NextResponse.json({ success: true, sections: HUAREN_REAL_SECTIONS });
    } catch {
        return NextResponse.json({ success: true, sections: HUAREN_REAL_SECTIONS });
    }
}
