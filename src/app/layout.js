import "./globals.css";
import AppShell from "@/_components/AppShell";

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'UCanFlix';
  
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Watch Free Movies, TV Shows & Anime Online HD | UCanFlix',
      template: `%s - ${siteName}`,
    },
    description: 'Stream free movies, TV shows & anime in HD on UCanFlix. No sign up, no ads, no limits. Watch action, drama, crime & more 24/7.',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Watch Free Movies, TV Shows & Anime Online HD | UCanFlix',
      description: 'Stream free movies, TV shows & anime in HD on UCanFlix. No sign up, no ads, no limits. Watch action, drama, crime & more 24/7.',
      url: siteUrl,
      siteName,
      locale: 'en_US',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: 'Watch Free Movies, TV Shows & Anime Online HD | UCanFlix',
      description: 'Stream free movies, TV shows & anime in HD on UCanFlix. No sign up, no ads, no limits. Watch action, drama, crime & more 24/7.',
      images: ['/og-image.jpg'],
    }
  };
}

export default function RootLayout({ children }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'UCanFlix';

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11133077',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: siteUrl,
              description: 'Stream free movies, TV shows & anime in HD on UCanFlix. No sign up, no ads, no limits.',
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full text-[var(--text-primary)] font-['Cairo',Arial,Helvetica,sans-serif] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
