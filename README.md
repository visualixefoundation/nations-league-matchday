# Matchday — UEFA Nations League

A single-competition site: fixtures, live scores, results, standings, team pages
and match detail for the UEFA Nations League only. Next.js (App Router), deployed
to Vercel, data from the Highlightly Football API.

Forked from the UCL Matchday build — same stack, same "night pitch" theme, same
free-tier caching discipline.

## 1. Get an API key

Free tier: 100 requests/day, no card required.

1. Sign up at https://highlightly.net/login
2. Copy your API key

## 2. Find the Nations League league ID (already done)

Highlightly identifies competitions by a numeric `leagueId`. Already confirmed:

```bash
curl "https://soccer.highlightly.net/leagues?leagueName=UEFA%20Nations%20League" \
  -H "x-rapidapi-key: YOUR_KEY_HERE"
```

`id` is **5039**, `name` "UEFA Nations League" — that's the `NATIONS_LEAGUE_ID`
below (and the app falls back to it if the env var is unset).

(If you signed up via RapidAPI instead of highlightly.net directly, use
`https://football-highlights-api.p.rapidapi.com/leagues?...` with both the
`x-rapidapi-key` and `x-rapidapi-host: football-highlights-api.p.rapidapi.com`
headers, and set `HIGHLIGHTLY_SOURCE=rapidapi` in your env.)

## 3. Local setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local: HIGHLIGHTLY_API_KEY (NATIONS_LEAGUE_ID already defaults to 5039)
npm run dev
```

Open http://localhost:3000.

## 4. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo
2. Add environment variables (Project Settings → Environment Variables):
   - `HIGHLIGHTLY_API_KEY`
   - `HIGHLIGHTLY_SOURCE` (`direct` or `rapidapi`)
   - `NATIONS_LEAGUE_ID` (optional — defaults to `5039` if unset)
3. Deploy — Next.js is detected automatically

## Notes on the free tier

Pages cache server-side so repeat visitors don't burn the 100 req/day cap:

| Page | `revalidate` |
|------|----------------|
| Fixtures (7-day window) | 90s |
| Match detail | 60s |
| Results / highlights | 300s |
| Standings | 3600s |
| Team page | 300s |

The home page loads a **7-day fixture window** (parallel date queries) so
non-match days still show upcoming games. Cached responses keep API usage low.

**Do not manually spam-refresh during dev/testing** — this is what burned the
UCL site's daily quota the first time around. Use the cached pages as they are;
only hit the raw API directly (via curl/ReqBin) when you actually need to
inspect a new response shape.

## Known quirk: biennial seasons

Nations League runs on a two-year cycle (seasons `2020`, `2022`, `2024`, `2026`
on Highlightly), unlike club football's annual Aug–Jul season. The season-resolving
logic in `lib/highlightly.ts` currently reuses the Aug–Jul heuristic from the UCL
build, which resolves correctly for 2026 but will need revisiting once the 2026
edition wraps and the 2028 cycle isn't live on Highlightly yet.

## What's in v1

- **Home** — fixtures across the next week, live scores, grouped by day, kickoff countdown, manual refresh
- **Match detail** (`/match/[id]`) — scoreboard, venue/ref when available, event timeline
- **Standings** — table per league/division group (A/B/C/D), secondary sort (position → points → GD → GF); teams link to team pages
- **Team pages** (`/team/[id]`) — crest + recent form (W/D/L)
- **Results & highlights** — finished matches with embedded highlights, link out to SuperSport
- Loading skeletons on all routes
- Dark "night pitch" UI only (by design)

Not in v1 (easy to add later): search, push notifications, light theme.
