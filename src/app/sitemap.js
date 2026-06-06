const routes = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/movies', changeFrequency: 'daily', priority: 0.9 },
  { path: '/tv-shows', changeFrequency: 'daily', priority: 0.9 },
  { path: '/anime', changeFrequency: 'daily', priority: 0.9 },
  { path: '/search', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/dmca', changeFrequency: 'monthly', priority: 0.3 },
]

export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com'
  const lastModified = new Date()

  return routes.map(route => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
