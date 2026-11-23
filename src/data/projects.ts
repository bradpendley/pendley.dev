/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT CONFIG: edit this file to add apps, swap URLs, or change badges.
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
    id: 'grannys-games',
    title: "Granny's Games",
    kicker: 'Indie Mobile App',
    category: ['apps'],
    status: 'live-app-store',
    platform: 'iOS • SwiftUI',
    size: 'normal',
    problem:
      'Most word games are loud, ad-heavy, and timed. A five-minute break should feel calm, and the game should be easy to read at any age.',
    solution:
      'A native iOS collection of sixteen word puzzles, from crosswords and codewords to Wordoku and Word Ladder, with hundreds of levels from Easy to Insanity.',
    highlights: [
      'Sixteen games on one shared, unit-tested Swift puzzle engine',
      'Large text, a dyslexia-friendly font, and VoiceOver support',
      'English, Spanish, French, and German; offline, with no ads or tracking',
    ],
    tags: ['Swift', 'SwiftUI', 'iOS', 'Accessibility', 'App Store'],
    links: [{ kind: 'app-store', label: 'App Store', url: 'https://apps.apple.com/us/app/grannys-games/id6832384946' }],
    appStore: { id: '6832384946' },
  },
  {
    id: 'pawpaws-puzzles',
    title: "Pawpaw's Puzzles",
    kicker: 'Indie Mobile App',
    category: ['apps'],
    status: 'live-app-store',
    platform: 'iOS • SwiftUI',
    size: 'normal',
    problem:
      'Logic puzzles tend to be either cluttered with ads or so abstract they feel like homework.',
    solution:
      'The sister app to Granny\'s Games: twelve hands-on logic puzzles built from wood, blocks, and shapes, set in a grandpa\'s workshop, barn, and fishing pond.',
    highlights: [
      'Twelve games, each with four difficulty modes and 100 levels',
      'SharePlay multiplayer and Game Center leaderboards',
      'Shares a level, theme, and save foundation with Granny\'s Games',
    ],
    tags: ['Swift', 'SwiftUI', 'iOS', 'SharePlay', 'Game Center', 'App Store'],
    links: [{ kind: 'app-store', label: 'App Store', url: 'https://apps.apple.com/us/app/pawpaws-puzzles/id6833190988' }],
    appStore: { id: '6833190988' },
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
      'Engineering teams often re-key ERP data into CAD and spreadsheets by hand, which is slow and a steady source of BOM errors.',
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
      'Local LLM orchestration that keeps data in the house',
      'Cloudflare Workers for the few things that must be reachable remotely',
    ],
    tags: ['C++', 'ESP32', 'Local LLMs', 'Cloudflare Workers'],
    links: [
      { kind: 'github', label: 'GitHub', url: '[INSERT_GITHUB_REPO_URL]' },
      { kind: 'docs', label: 'Schematic Notes', url: '[INSERT_SCHEMATIC_NOTES_URL]' },
    ],
  },
];
