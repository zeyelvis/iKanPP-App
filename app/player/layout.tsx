import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
    themeColor: '#0A0A0F',
};

export const metadata: Metadata = {
    referrer: 'no-referrer',
};

export default function PlayerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
