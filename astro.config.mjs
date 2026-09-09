// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Update to the production domain before deploying (used for canonical/OG URLs).
  site: 'https://dashbad.com',
  output: 'static',
  server: {
    host: true,
  },
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
