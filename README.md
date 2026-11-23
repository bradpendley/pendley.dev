# pendley.dev

Personal portfolio for Bradley Pendley, built with Astro 7 + Tailwind CSS v4, static, deployed on Cloudflare Pages.

- ~18 KB gzipped HTML (CSS inlined), one ~1 KB script, self-hosted variable fonts
- Project filter and architecture modals use native HTML (`:has()` + radio inputs, Popover API) with **zero JS**
- Strict CSP (`script-src 'self'`) in `public/_headers`

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build → dist/
npm run preview
```

Requires Node 22+.

## Where to edit

| What | File |
|---|---|
| Name, email, LinkedIn/GitHub/App Store URLs | `src/data/site.ts` |
| Projects, status badges, links, modal content | `src/data/projects.ts` |
| Stack matrix and "How I build" principles | `src/data/stack.ts` |
| Colors, fonts, animations (Tailwind theme) | `src/styles/global.css` → `@theme` |

Any URL containing `INSERT_` is a placeholder: it renders as a dashed "soon" pill (or is hidden in
the nav/footer) so you never ship a dead link. Replace it with the real URL and it becomes live.

Status badges: `live-app-store`, `testflight`, `in-development`, `internal`, `open-source`.
Add `details: {...}` to any project to give it an "Architecture Details" modal.
Use `size: 'wide'` to span both bento columns.

## Deploy to Cloudflare Pages

**Dashboard (Git):** connect the repo, framework preset *Astro*, build command `npm run build`,
output `dist`. Add custom domain `pendley.dev`.

**CLI:**
```bash
npx wrangler login
npm run deploy
```

### Contact form (Resend)

`functions/api/contact.ts` is a Pages Function that emails submissions via Resend.

1. Verify `pendley.dev` in Resend and create an API key.
2. `npx wrangler pages secret put RESEND_API_KEY --project-name pendley-dev`
3. Adjust `CONTACT_TO` / `CONTACT_FROM` in `wrangler.toml` if needed.

The form works without JavaScript (POST → redirect to `/?sent=1#contact`) and upgrades to inline
status when JS is available. A honeypot field filters basic bots; add Cloudflare Turnstile if spam appears.

## Automated pipeline (GitHub Actions)

`.github/workflows/deploy.yml` builds and deploys on **every push to `main`**, **daily at ~5 AM ET**,
and on demand (Actions → *Build & deploy* → *Run workflow*). Each build refreshes:

| Section | Source | Notes |
|---|---|---|
| Recent Activity (§02) | GitHub GraphQL/REST | Heatmap + recently pushed public repos. Hides itself if GitHub is unreachable. |
| App Store status | iTunes Lookup API | Set `appStore: { id: '…' }` on a project; version, rating and link fill in and the badge flips to *Live on App Store*. |
| Build strip (hero terminal) | CI env | Run number, commit, trigger, deploy time. |

All data is fetched at **build time**, so the shipped site is still static with no client-side API calls.

### One-time setup

1. Push this folder to a GitHub repo (e.g. `bradpendley/pendley.dev`) with `main` as the default branch.
2. Repo → Settings → Secrets and variables → Actions → add:
   - `CLOUDFLARE_API_TOKEN`: Cloudflare → My Profile → API Tokens → *Create token* →
     template **Edit Cloudflare Workers** (or a custom token with *Account · Cloudflare Pages · Edit*).
   - `CLOUDFLARE_ACCOUNT_ID`: shown on the Workers & Pages overview page.
   - `GH_STATS_TOKEN` *(optional)*: fine-grained PAT with no extra scopes; only needed if the
     default token can't read your contribution calendar.
3. To count private work in the heatmap: GitHub → your profile → *Contribution settings* →
   enable **Private contributions** (shows counts only, never repo names).

### Local builds

- `LIVE_DATA=mock npm run dev`: design with sample data
- `LIVE_DATA=off npm run build`: skip all network calls
- `GITHUB_TOKEN=$(gh auth token) npm run build`: real data locally

## Still to do

- Replace `INSERT_` placeholders (App Store, TestFlight, schematic notes)
- `public/og.png` is a hero screenshot; regenerate it if you change the hero
- For the App Store button, you may swap in Apple's official badge from Apple's marketing resources
