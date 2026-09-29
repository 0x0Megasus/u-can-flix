export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Filtered views and the search page have no standalone value.
      disallow: ['/search', '/api/'],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  }
}
