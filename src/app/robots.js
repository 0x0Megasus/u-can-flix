export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  }
}
