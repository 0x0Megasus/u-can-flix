import "./globals.css";
import AppShell from "@/_components/AppShell";

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'U Can Flix';
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} - Stream Movies, TV Shows & Anime Free Online`,
      template: `%s - ${siteName}`,
    },
    description: `Watch free movies, TV shows, and anime online in HD streaming at ${siteName}. Enjoy the latest action, crime, and drama series without registration. Your destination for top-rated entertainment available 24/7.`,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: `${siteName} - Stream Movies, TV Shows & Anime Free Online`,
      description: `Watch free movies, TV shows, and anime online in HD streaming at ${siteName}.`,
      url: '/',
      siteName,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Stream Movies, TV Shows & Anime Free Online`,
      description: `Watch free movies, TV shows, and anime online in HD streaming at ${siteName}.`,
      images: ['/og-image.jpg'],
    },
    ...(googleVerification && {
      verification: {
        google: googleVerification,
      },
    }),
  };
}

export default function RootLayout({ children }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'U Can Flix';

  return (
    <html lang="en" className="h-full">
      <head>
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
              description: `Watch free movies, TV shows, and anime online in HD streaming at ${siteName}.`,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full bg-[#141414] text-white font-['Cairo',Arial,Helvetica,sans-serif] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
