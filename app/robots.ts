import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

const DISALLOW_PATHS = [
    '/api/',
    '/admin/',
    '/settings',
    '/profile',
    '/premium/',
    '/*?q=*',
    '/*?ref=*',
    '/*?source=*',
    '/*?share=*',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: DISALLOW_PATHS,
            },
        ],
        sitemap: `${BASE_URL}/sitemap-index.xml`,
    };
}
