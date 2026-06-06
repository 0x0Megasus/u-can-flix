# U CAN FLIX

> Stream free movies, TV shows & anime — zero sign-up, full HD.

Built with Next.js 16, powered by WordPress headless CMS + IMDB API integration.

## Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Styling** — Tailwind CSS v4
- **Data** — WordPress REST API (`_embed` + custom endpoints), IMDB top charts
- **Images** — Next.js `<Image>` with WordPress CDN + IMDB media proxy
- **Deploy** — Ready for Vercel / any Node host

## Features

- **Category pages** — `/movies`, `/tv-shows`, `/anime` with paginated grids
- **Smart grouping** — TV shows grouped by series, auto-picks best season
- **Hero banners** — Largest available image from WordPress, IMDB CDN fallback
- **Episode browser** — Season/EP picker modal for TV content
- **Search** — Debounced with type filter (All / Movies / TV / Anime)
- **Responsive** — Mobile pill nav, 40px gutters, fluid card grid
- **SEO** — Dynamic metadata, sitemap, robots.txt, OG images, JSON-LD
- **Keyboard accessible** — `focus-visible` rings, semantic HTML, ARIA labels

## Quick start

```bash
cp .env.example .env   # fill in your API keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Var | What |
|---|---|
| `WP_API_BASE` | WordPress REST API root |
| `WP_ORIGIN` | WordPress origin (for image proxy) |
| `IMDB_MOVIES_URL` | IMDB top movies JSON |
| `IMDB_TV_URL` | IMDB top TV shows JSON |
| `IMDB_ANIME_URL` | IMDB top anime JSON |

---
