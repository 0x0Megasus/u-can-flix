import SearchPageClient from '@/_components/SearchPageClient'

export const metadata = {
  title: 'Search',
  description: 'Search movies, TV shows, and anime available on U Can Flix.',
  alternates: { canonical: '/search' },
  openGraph: {
    title: 'Search - U Can Flix',
    description: 'Search movies, TV shows, and anime available on U Can Flix.',
    url: '/search',
  },
}

export default function SearchPage() {
  return <SearchPageClient />
}
