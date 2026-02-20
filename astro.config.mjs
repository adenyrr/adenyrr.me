// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import expressiveCode from 'astro-expressive-code';
import robotsTxt from 'astro-robots-txt';
import compress from '@playform/compress';
import { remarkReadingTime } from './src/utils/reading-time.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://adenyrr.me',
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
    sitemap(),
    robotsTxt({
      policy: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://adenyrr.me/sitemap-index.xml',
    }),
    react(),
    compress(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
