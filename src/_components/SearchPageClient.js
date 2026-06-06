'use client';
import { usePlayer } from '@/_components/PlayerProvider'
import SearchResults from '@/_components/SearchResults'

export default function SearchPageClient() {
  const { openPlayer } = usePlayer()
  return <SearchResults onWatch={openPlayer} />
}
