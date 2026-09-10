# MatchDay — Football Streaming Platform

A schedule + stream-links site for live football, built with Next.js 16, Tailwind CSS 4 and a simple JSON data store. Visitors see live/upcoming matches with kickoff times in their own timezone; each match page supports **multiple stream links** (tabs, quality/language labels, optional in-page embed player). Includes an admin panel to manage matches and links, and ready-to-go ad slots.

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000
```

First boot seeds 4 demo matches (one "live") so you can see how everything looks. Replace them via the admin panel.

- **Site:** `/` — schedule, live matches, recent results
- **Match page:** `/match/[id]` — kickoff countdown, multiple stream tabs, ad slots
- **Admin:** `/admin` — password is `admin123` by default. **Change it** via `ADMIN_PASSWORD` env var (copy `.env.example` → `.env.local`).

## Features

- ⚽ Homepage: live section, upcoming grouped by day, recent results
- ⏱ Kickoff countdown + visitor-local kickoff times (works for any audience)
- 🔗 Multiple stream links per match: tabs, HD/FHD/SD badges, language selector, click counters
- 📺 In-page embed player for embeddable sources, or external-link buttons
- 🛠 Admin panel: create/delete matches, set status (scheduled/live/finished), manage links, see click stats per link
- 💰 Ad slots: leaderboard (top of home), billboard (bottom), rectangle (sidebar), in-content (match page) — see below
- 📱 Fully responsive, dark sports theme

## Monetization (the legal way)

The site ships with clean, policy-friendly **ad infrastructure** — no popunders or forced redirects (these violate every mainstream ad network's terms and get sites banned).

### 1. Display ads

- Apply to **Google AdSense** (https://adsense.google.com) once your site has original content and some traffic.
- Put your publisher ID in `NEXT_PUBLIC_ADSENSE_CLIENT` (e.g. `ca-pub-1234567890123456`) — every `<AdSlot />` in the app instantly starts serving real ads.
- Alternatives once you have traffic: Media.net, Ezoic, Monumetric, Raptive.

### 2. Affiliate income (often pays better than ads)

Legal streaming services pay per new signup, typically **$25–$70**:

| Program | Where to apply |
|---|---|
| fuboTV affiliates | fubotv.com affiliate program |
| DAZN partners | dazn.com partner page |
| Paramount+ (shows Serie A, Champions League…) | via Impact/CJ affiliate networks |
| Sling TV, Vidgo, Fubo | CJ / Impact / ShareASale networks |

Idea: on each match page, add a link labeled *"Watch on [Official Broadcaster] (affiliate)"* — it fits naturally in the stream list via the admin panel.

### 3. What content can you legally link?

The platform is **source-agnostic** — links are added by you. Sources that are free and legal to link/embed:

- **FIFA+** (plus.fifa.com) — free official live matches & replays
- **Official league/club YouTube channels** — many stream matches, press conferences and classics free
- **UEFA.tv** and regional broadcaster free streams where available
- **Free-to-air broadcasters' own streaming platforms** (e.g. BBC iPlayer Sport, ITVX in the UK; regional equivalents elsewhere)
- **Your own licensed streams** — lower leagues, youth and futsal rights are often cheap or revenue-share

⚠️ **What not to do:** don't link to pirated restreams of paid broadcasts. That violates copyright law in most countries, gets AdSense accounts banned forever, attracts domain seizures and lawsuits, and makes the site unsellable. The "popunder" ad networks that accept pirate sites routinely shave stats and don't pay. Legal + affiliate is the model that compounds.

## Architecture

```
app/
  page.tsx                 # Homepage (server component, reads DB directly)
  match/[id]/page.tsx      # Match page: countdown, StreamTabs, ads
  admin/page.tsx           # Admin panel (client, cookie-gated API)
  api/
    matches/               # GET public match list
    click/                 # POST stream link click counter
    admin/                 # login/logout/session + matches & links CRUD (auth-gated)
components/
  AdSlot.tsx               # AdSense-ready ad slots w/ placeholder fallback
  StreamTabs.tsx           # multi-link tab player (embed iframe or external)
  Countdown.tsx            # live kickoff countdown
  MatchCard.tsx, KickoffTime.tsx, Header.tsx, Footer.tsx
lib/
  db.ts                    # JSON file store (data/db.json, atomic writes, seeded on first boot)
  auth.ts                  # admin cookie session (HMAC of ADMIN_PASSWORD)
```

### Data storage

v1 uses a JSON file (`data/db.json`) — zero setup, perfect for a VPS (this also keeps hosting costs at ~$5/mo). If you deploy to **serverless** (Vercel), the file resets per-instance: swap `lib/db.ts` for SQLite/Turso/Supabase — the interface (`listMatches`, `getMatch`, `createMatch`, …) is already isolated to that one file, so it's a 30-minute swap.

### Deploying on a VPS

```bash
npm run build
ADMIN_PASSWORD=yourpassword npm start   # port 3000, put Nginx/Caddy in front for HTTPS
```

HTTPS matters: AdSense and affiliate programs require a real domain with SSL.

## SEO checklist (sports sites live on search)

- Metadata + titles already generated per match page (`teamA vs teamB — Live Stream & Kickoff Time`)
- Add `app/sitemap.ts` listing match pages (easy win once you have real fixtures)
- Submit to Google Search Console; kickoff-time-in-local-timezone pages rank well for "X vs Y kickoff time" queries

## Disclaimer

This software lists schedules and links added by its operator. It hosts no video. You are responsible for ensuring the links you publish are legal in the jurisdictions you serve.
