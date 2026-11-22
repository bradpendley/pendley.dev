/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT CONFIG — edit this file to add apps, swap URLs, or change badges.
 * ─────────────────────────────────────────────────────────────────────────────
 *  • category  → drives the filter pills (a project can be in several).
 *  • status    → drives the coloured status badge on each card.
 *  • size      → 'wide' spans both bento columns on desktop; 'normal' is one.
 *  • links     → any URL containing "INSERT_" renders as a disabled
 *                "coming soon" pill, so you never ship a dead link.
 *  • details   → optional; when present, the card gets an
 *                "Architecture details" button that opens an accessible modal.
 */

export type Category = 'apps' | 'enterprise' | 'hardware';

export type Status =
  | 'live-app-store'
  | 'testflight'
  | 'in-development'
  | 'internal'
  | 'open-source';

export type LinkKind = 'app-store' | 'testflight' | 'live' | 'github' | 'docs';

export interface ProjectLink {
  kind: LinkKind;
  label: string;
  url: string;
}

export interface ProjectDetails {
  /** Short paragraphs shown at the top of the modal. */
  overview: string[];
  /** Labelled architecture notes, rendered as a definition list. */
  architecture: { label: string; text: string }[];
}

export interface Project {
  id: string;
  title: string;
  kicker: string; // e.g. "Indie Mobile App"
  category: Category[];
  status: Status;
  /** Mono "platform" pill, e.g. "iOS • SwiftUI". */
  platform: string;
  size: 'normal' | 'wide';
  problem: string;
  solution: string;
  highlights: string[];
  tags: string[];
  links: ProjectLink[];
  details?: ProjectDetails;
  /**
   * Optional App Store lookup. When set, every build pulls the live version,
   * release date and rating, fills in the App Store link, and switches the
   * badge to "Live on App Store" automatically. Use the numeric id from the
   * App Store URL (apps.apple.com/.../id123456789) or the bundle id.
   */
  appStore?: { id?: string; bundleId?: string };
}

export const statusMeta: Record<Status, { label: string; tone: 'emerald' | 'cyan' | 'amber' | 'slate' }> = {
  'live-app-store': { label: 'Live on App Store', tone: 'emerald' },
  testflight: { label: 'In TestFlight', tone: 'cyan' },
  'in-development': { label: 'In Development', tone: 'amber' },
  internal: { label: 'Internal Enterprise', tone: 'slate' },
  'open-source': { label: 'Open Source', tone: 'emerald' },
};

export const filters: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'apps', label: 'Published Apps' },
  { id: 'enterprise', label: 'Enterprise Systems' },
  { id: 'hardware', label: 'Hardware' },
];

export const projects: Project[] = [
  {
    id: 'lofi-words',
    title: 'Lo-Fi Word Puzzle Suite',
    kicker: 'Indie Mobile App',
    category: ['apps'],
    status: 'testflight',
    platform: 'iOS • SwiftUI',
    size: 'wide',
    problem:
      'Most word games are loud, ad-heavy, and stressful — the opposite of what a five-minute break should feel like.',
    solution:
      'A native iOS suite combining crosswords, anagrams, and word searches in calm, customizable themes like Rainy Cafe, with tactile audio-visual polish.',
    highlights: [
      'Three puzzle modes sharing one native SwiftUI engine',
      'Atmospheric, swappable themes with ambient audio',
      'Haptics and motion tuned to feel physical',
    ],
    tags: ['Swift', 'iOS', 'UI/UX Design', 'App Store'],
    links: [
      { kind: 'app-store', label: 'App Store', url: '[INSERT_APP_STORE_URL]' },
      { kind: 'testflight', label: 'Join TestFlight', url: '[INSERT_TESTFLIGHT_URL]' },
    ],
    // appStore: { id: '1234567890' },   // ← uncomment once the app is live
  },
  {
    id: 'cad-erp-integration',
    title: 'CAD & ERP Integration Add-ins',
    kicker: 'Enterprise Systems',
    category: ['enterprise'],
    status: 'internal',
    platform: 'C# • .NET 8/10',
    size: 'normal',
    problem:
      'Engineering teams often re-key ERP data into CAD and spreadsheets by hand — slow, and a steady source of BOM errors.',
    solution:
      'Custom add-ins that bring ERP data directly into SolidWorks, AutoCAD, and Excel, so engineers work in the tools they already know.',
    highlights: [
      'SolidWorks and AutoCAD add-ins over COM interop',
      'Excel-DNA functions backed by live ERP data',
      'Reporting with stored, reusable layouts',
    ],
    tags: ['C#', '.NET', 'SolidWorks API', 'AutoCAD API', 'Excel-DNA', 'SAP'],
    links: [],
    details: {
      overview: [
        'Add-ins live inside someone else\u2019s process, so the first rule is never to make the host application feel slower.',
      ],
      architecture: [
        { label: 'Interop', text: 'SolidWorks and AutoCAD through their COM APIs; native libraries through P/Invoke where managed wrappers fall short.' },
        { label: 'Excel', text: 'Excel-DNA user-defined functions surface ERP and BOM data as formulas, so the spreadsheet stays the engineer\u2019s interface.' },
        { label: 'ERP', text: 'The ERP system stays the source of truth; add-ins read from it rather than duplicating it.' },
        { label: 'Reporting', text: 'Report designs are stored and versioned as data instead of being hard-coded.' },
      ],
    },
  },
  {
    id: 'cad-export',
    title: 'Automated CAD Export Pipeline',
    kicker: 'CAD Automation',
    category: ['enterprise'],
    status: 'internal',
    platform: 'Web API • SolidWorks',
    size: 'normal',
    problem:
      'Sharing CAD models outside a company risks exposing IP, and preparing each one by hand ties up engineering time.',
    solution:
      'An unattended service that simplifies assemblies and produces clean, neutral-format STEP files on request.',
    highlights: [
      'Queue-driven CAD worker that runs unattended',
      'Automatic defeaturing to strip internal detail',
      'Web API and request page for submission and download',
    ],
    tags: ['C#', 'ASP.NET Core', 'SolidWorks API', 'STEP'],
    links: [],
  },
  {
    id: 'edge-telemetry',
    title: 'Edge & Embedded Home Telemetry',
    kicker: 'Hardware & IoT',
    category: ['hardware'],
    status: 'in-development',
    platform: 'ESP32 • Apple Silicon',
    size: 'wide',
    problem:
      'Off-the-shelf smart-home gear is closed, cloud-dependent, and can’t be wired into the things that actually matter in a house.',
    solution:
      'Custom ESP32/Arduino sensor nodes and optocoupler-isolated triggers feeding a local pipeline, with local LLMs on Apple Silicon making sense of the data.',
    highlights: [
      'ESP32 sensor nodes and optocoupler hardware triggers',
      'Local LLM orchestration — data stays in the house',
      'Cloudflare Workers for the few things that must be reachable remotely',
    ],
    tags: ['C++', 'ESP32', 'Local LLMs', 'Cloudflare Workers'],
    links: [
      { kind: 'github', label: 'GitHub', url: '[INSERT_GITHUB_REPO_URL]' },
      { kind: 'docs', label: 'Schematic Notes', url: '[INSERT_SCHEMATIC_NOTES_URL]' },
    ],
  },
];
