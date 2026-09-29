import { Cairo } from 'next/font/google';
import './globals.css';
import AppShell from '@/_components/AppShell';

/**
 * Self-hosted through next/font. The previous two <link> tags to Google Fonts
 * and Fontshare were render-blocking requests to two separate origins, which
 * delayed first paint on every page.
 */
const cairo = Cairo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Arial', 'sans-serif'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'U Can Flix';
const DESCRIPTION =
  'Stream free movies and TV shows in HD. Thousands of titles, full seasons, no sign up and no ads.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Watch Free Movies & TV Shows Online HD | U Can Flix',
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Watch Free Movies & TV Shows Online HD',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Free Movies & TV Shows Online HD',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#05060a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cairo.variable} h-full`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Posters and backdrops come from here; warming the connection removes
            a DNS + TLS round trip from the critical image path. */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              description: DESCRIPTION,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
