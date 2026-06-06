# U CAN FLIX

> Stream free movies, TV shows & anime — zero sign-up, full HD.

## Stack

Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 · Plain JS

## Structure

```
src/
├── app/                  # App Router pages & API routes
│   ├── movies/           # /movies
│   ├── tv-shows/         # /tv-shows
│   ├── anime/            # /anime
│   ├── search/           # /search
│   ├── dmca/             # /dmca
│   ├── api/              # API routes (data proxy)
│   └── layout.js         # Root layout
├── _components/          # Shared UI components
│   ├── HeroBanner/       # Hero section
│   ├── ContentCard/      # Movie card
│   ├── ShowCard/         # TV/Anime card with season modal
│   ├── ContentRow/       # Horizontal scrollable row
│   ├── GroupedRow/       # Grouped show row
│   ├── TopRatedRow/      # Top rated row
│   ├── CategoryPage/     # Category page shell
│   ├── SearchResults/    # Search page
│   ├── Navbar/           # Top navigation
│   ├── Footer/           # Site footer
│   ├── EpisodeModal/     # Season/EP picker
│   └── PlayerModal/      # Video player
├── _hooks/               # Custom hooks
└── _lib/                 # Utilities & helpers
```
