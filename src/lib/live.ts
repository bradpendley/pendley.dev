/**
 * Build-time "live" data. Runs once per build (daily via GitHub Actions),
 * so the shipped site stays 100% static with zero client-side fetching.
 *
 * Every fetch is fail-soft: if an API is down or rate-limited, the build still
 * succeeds and the affected UI simply hides itself.
 *
 * Env:
 *   GITHUB_TOKEN        Optional locally, provided automatically in Actions.
 *                       Enables the contribution calendar (GraphQL needs auth).
 *   LIVE_DATA=off       Skip all network calls (fast offline builds).
 *   LIVE_DATA=mock      Use sample data (handy for designing locally).
 */
import { execSync } from 'node:child_process';

const env = (k: string) => (typeof process !== 'undefined' ? process.env[k] : undefined);
const MODE = env('LIVE_DATA') ?? 'on';

async function getJSON<T>(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<T | null> {
  if (MODE === 'off') return null;
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      console.warn(`[live] ${url} → HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[live] ${url} failed: ${(err as Error).message}`);
    return null;
  }
}

/* ── GitHub ─────────────────────────────────────────────────────────────── */

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  pushedAt: string;
  language: { name: string; color: string | null } | null;
  stars: number;
}
export interface ContributionDay { date: string; count: number }
export interface GitHubData {
  username: string;
  repos: Repo[];
  /** Weeks (Sun→Sat) of the last ~year. Empty when no token is available. */
  calendar: ContributionDay[][];
  totalContributions: number | null;
  activeDays30: number | null;
}

const GQL = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(first: 6, privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER,
                 orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes { name description url pushedAt stargazerCount primaryLanguage { name color } }
    }
  }
}`;

async function fetchGitHub(username: string): Promise<GitHubData | null> {
  if (MODE === 'mock') return mockGitHub(username);
  const token = env('GITHUB_TOKEN');

  if (token) {
    type R = { data?: { user?: {
      contributionsCollection: { contributionCalendar: { totalContributions: number; weeks: { contributionDays: { date: string; contributionCount: number }[] }[] } };
      repositories: { nodes: { name: string; description: string | null; url: string; pushedAt: string; stargazerCount: number; primaryLanguage: { name: string; color: string | null } | null }[] };
    } } };
    const r = await getJSON<R>('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'pendley.dev-build' },
      body: JSON.stringify({ query: GQL, variables: { login: username } }),
    });
    const u = r?.data?.user;
    if (u) {
      const cal = u.contributionsCollection.contributionCalendar;
      const calendar = cal.weeks.map((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
      return {
        username,
        repos: u.repositories.nodes.map((n) => ({
          name: n.name, description: n.description, url: n.url, pushedAt: n.pushedAt,
          language: n.primaryLanguage, stars: n.stargazerCount,
        })),
        calendar,
        totalContributions: cal.totalContributions,
        activeDays30: calendar.flat().slice(-30).filter((d) => d.count > 0).length,
      };
    }
  }

  // Unauthenticated fallback: public repos only, no calendar.
  type RestRepo = { name: string; description: string | null; html_url: string; pushed_at: string; fork: boolean; language: string | null; stargazers_count: number };
  const rest = await getJSON<RestRepo[]>(
    `https://api.github.com/users/${username}/repos?sort=pushed&per_page=12&type=owner`,
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'pendley.dev-build' } },
  );
  if (!rest) return null;
  return {
    username,
    repos: rest.filter((r) => !r.fork).slice(0, 6).map((r) => ({
      name: r.name, description: r.description, url: r.html_url, pushedAt: r.pushed_at,
      language: r.language ? { name: r.language, color: null } : null, stars: r.stargazers_count,
    })),
    calendar: [],
    totalContributions: null,
    activeDays30: null,
  };
}

/* ── App Store (public iTunes Lookup API, no key needed) ────────────────── */

export interface AppStoreLookup { id?: string; bundleId?: string; country?: string }
export interface AppStoreData {
  name: string;
  version: string;
  releasedAt: string;
  rating: number | null;
  ratingCount: number;
  url: string;
  releaseNotes: string | null;
}

async function fetchApp(q: AppStoreLookup): Promise<AppStoreData | null> {
  if (!q.id && !q.bundleId) return null;
  if (MODE === 'mock') {
    return { name: 'Sample App', version: '1.4.2', releasedAt: new Date(Date.now() - 3 * 864e5).toISOString(), rating: 4.8, ratingCount: 37, url: 'https://apps.apple.com/', releaseNotes: 'New theme and haptics polish.' };
  }
  const key = q.id ? `id=${encodeURIComponent(q.id)}` : `bundleId=${encodeURIComponent(q.bundleId!)}`;
  type R = { resultCount: number; results: { trackName: string; version: string; currentVersionReleaseDate: string; averageUserRatingForCurrentVersion?: number; averageUserRating?: number; userRatingCount?: number; trackViewUrl: string; releaseNotes?: string }[] };
  const r = await getJSON<R>(`https://itunes.apple.com/lookup?${key}&country=${q.country ?? 'us'}&entity=software`);
  const a = r?.results?.[0];
  if (!a) return null;
  return {
    name: a.trackName,
    version: a.version,
    releasedAt: a.currentVersionReleaseDate,
    rating: a.userRatingCount ? (a.averageUserRating ?? null) : null,
    ratingCount: a.userRatingCount ?? 0,
    url: a.trackViewUrl.split('?')[0],
    releaseNotes: a.releaseNotes ?? null,
  };
}

/* ── Build info ─────────────────────────────────────────────────────────── */

export interface BuildInfo { sha: string | null; run: string | null; builtAt: string; trigger: string }

function buildInfo(): BuildInfo {
  let sha = env('GITHUB_SHA') ?? env('CF_PAGES_COMMIT_SHA') ?? null;
  if (!sha) {
    try { sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* not a git checkout */ }
  }
  const event = env('GITHUB_EVENT_NAME');
  const trigger = event === 'schedule' ? 'daily refresh' : event === 'push' ? 'push' : event === 'workflow_dispatch' ? 'manual' : 'local';
  return { sha: sha ? sha.slice(0, 7) : null, run: env('GITHUB_RUN_NUMBER') ?? null, builtAt: new Date().toISOString(), trigger };
}

/* ── Memoized accessors (each runs once per build) ──────────────────────── */

let gh: Promise<GitHubData | null> | undefined;
export const getGitHub = (username: string) => (gh ??= fetchGitHub(username));

const apps = new Map<string, Promise<AppStoreData | null>>();
export const getApp = (q: AppStoreLookup) => {
  const k = JSON.stringify(q);
  if (!apps.has(k)) apps.set(k, fetchApp(q));
  return apps.get(k)!;
};

let bi: BuildInfo | undefined;
export const getBuildInfo = () => (bi ??= buildInfo());

/* ── Formatting helpers ─────────────────────────────────────────────────── */

export function relTime(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  const d = Math.round(s / 86400);
  if (d < 30) return `${d}d ago`;
  const m = Math.round(d / 30);
  return m < 12 ? `${m}mo ago` : `${Math.round(m / 12)}y ago`;
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' });

/* ── Mock data for LIVE_DATA=mock ───────────────────────────────────────── */

function mockGitHub(username: string): GitHubData {
  const days: ContributionDay[] = [];
  const start = new Date(); start.setDate(start.getDate() - 363 - start.getDay());
  for (let i = 0; i < 371; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    if (d > new Date()) break;
    const weekday = d.getDay() > 0 && d.getDay() < 6;
    const r = Math.sin(i * 1.7) * 0.5 + 0.5;
    days.push({ date: d.toISOString().slice(0, 10), count: r > (weekday ? 0.35 : 0.7) ? Math.round(r * 9) : 0 });
  }
  const calendar: ContributionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) calendar.push(days.slice(i, i + 7));
  const ago = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();
  return {
    username,
    calendar,
    totalContributions: days.reduce((a, d) => a + d.count, 0),
    activeDays30: days.slice(-30).filter((d) => d.count > 0).length,
    repos: [
      { name: 'sample-ios-app', description: 'Native SwiftUI puzzle game.', url: `https://github.com/${username}`, pushedAt: ago(5), language: { name: 'Swift', color: '#F05138' }, stars: 3 },
      { name: 'esp32-telemetry', description: 'Sensor nodes and local pipeline.', url: `https://github.com/${username}`, pushedAt: ago(30), language: { name: 'C++', color: '#f34b7d' }, stars: 1 },
      { name: 'pendley.dev', description: 'This site.', url: `https://github.com/${username}`, pushedAt: ago(80), language: { name: 'Astro', color: '#ff5a03' }, stars: 0 },
      { name: 'excel-dna-tools', description: 'Excel-DNA helpers.', url: `https://github.com/${username}`, pushedAt: ago(400), language: { name: 'C#', color: '#178600' }, stars: 0 },
    ],
  };
}
