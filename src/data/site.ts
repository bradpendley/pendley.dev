/**
 * Global site configuration.
 * Anything that still contains "INSERT_" is treated as a placeholder and is
 * rendered as a non-clickable "coming soon" state instead of a broken link.
 */
export const site = {
  name: 'Bradley Pendley',
  domain: 'pendley.dev',
  title: 'Bradley Pendley — Software Developer & Systems Architect',
  description:
    'Bradley Pendley builds resilient .NET systems, SolidWorks/AutoCAD/Excel integrations wired into SAP, and native iOS apps — grounded in 15 years of electric motor design.',
  role: 'Software Developer & Systems Architect',
  location: 'Building in Georgia',
  email: 'bradley@pendley.dev',
  links: {
    linkedin: 'https://www.linkedin.com/in/bradleypendley',
    github: 'https://github.com/bradpendley',
    appStoreDeveloper: '[INSERT_APP_STORE_DEVELOPER_URL]',
  },
  /** Endpoint the contact form posts to (Cloudflare Pages Function in /functions/api/contact.ts). */
  contactEndpoint: '/api/contact',
} as const;

export const isPlaceholder = (url?: string | null): boolean =>
  !url || url.includes('INSERT_');
