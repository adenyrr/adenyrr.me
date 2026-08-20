// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import expressiveCode from 'astro-expressive-code';
import robotsTxt from 'astro-robots-txt';
import compress from '@playform/compress';
import fs from 'node:fs';
import YAML from 'yaml';
import { remarkReadingTime } from './src/utils/reading-time.ts';

const siteConfig = YAML.parse(fs.readFileSync(new URL('./config/site.yaml', import.meta.url), 'utf8'));

// https://astro.build/config
export default defineConfig({
  site: siteConfig.site.url,
  integrations: [
    expressiveCode({
      themes: ['one-dark-pro'],
      defaultProps: {
        // Disable macOS window chrome (the '...' dots cap)
        frame: 'none',
        // Always show line numbers
        showLineNumbers: true,
      },
    }),
    mdx(),
    ...(siteConfig.seo.sitemap ? [sitemap()] : []),
    ...(siteConfig.seo.robots ? [robotsTxt({
      policy: [{ userAgent: '*', allow: '/' }],
      sitemap: `${siteConfig.site.url}/sitemap-index.xml`,
    })] : []),
    react(),
    compress(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  image: {
    // Autorise l'optimisation au build des badges Credly. Leur CDN ignore
    // tout redimensionnement (ni ?w=, ni /size/WxH/ : il renvoie toujours
    // l'original, 35–280 Ko par badge). Sans ça, /home tirait ~1,5 Mo
    // d'images tierces pour les afficher en 44 px.
    domains: ['images.credly.com'],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
