export interface Pillar {
  id: string;
  title: string;
  /** Short mono label shown above the title. */
  code: string;
  items: string[];
}

export const pillars: Pillar[] = [
  {
    id: 'core',
    code: '01 / CORE',
    title: 'Languages & Frameworks',
    items: ['C#', '.NET 8 / .NET 10', 'ASP.NET Core', 'EF Core', 'Blazor', 'Swift / SwiftUI', 'TypeScript', 'SQL Server', 'Snowflake'],
  },
  {
    id: 'enterprise',
    code: '02 / INTEGRATE',
    title: 'Integrations & Enterprise',
    items: ['SolidWorks API', 'AutoCAD API', 'Excel-DNA', 'SAP', 'DevExpress', 'COM Interop / P/Invoke', 'OAuth 2.0 / SSO', 'Power Automate'],
  },
  {
    id: 'cloud',
    code: '03 / SHIP',
    title: 'Cloud, Edge & DevOps',
    items: ['Cloudflare Pages & Workers', 'Git', 'CI/CD', 'Linux / macOS', 'Windows Services', 'Health & Heartbeat Monitoring'],
  },
  {
    id: 'ai-hw',
    code: '04 / BUILD',
    title: 'AI & Hardware',
    items: ['Local LLM Pipelines (Ollama, LM Studio)', 'Model Context Protocol', 'Agentic Workflows', 'ESP32 / Embedded', 'CAD / 3D Prototyping'],
  },
];

/** "How I build" principles shown under the hero. */
export const principles = [
  {
    code: 'P-01',
    title: 'Physics before pixels',
    text: 'Fifteen years in electric motor design means the math comes first: typed units, sourced formulas, and results an engineer can check by hand.',
  },
  {
    code: 'P-02',
    title: 'Built for the shop floor',
    text: 'Enterprise software runs unattended at 5 a.m. I design for that — heartbeats, failure alerts, and logs that explain themselves.',
  },
  {
    code: 'P-03',
    title: 'AI where it earns its place',
    text: 'Agents get real tools through MCP and confidence gates before anything reaches a human. Useful, auditable, never magic.',
  },
];
