// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://pendley.dev',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Inline the (small) stylesheet so first paint needs zero extra requests.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    // Never inline JS, so the strict CSP (script-src 'self') in public/_headers holds.
    build: { assetsInlineLimit: 0 },
  },
});
