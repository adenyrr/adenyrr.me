// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { remarkReadingTime } from './src/utils/reading-time.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://adenyrr.me',
  integrations: [
    starlight({
      title: 'Documentation',
      description: 'Documentation technique — réseau, services, virtualisation, domotique et outils.',
      defaultLocale: 'root',
      locales: { root: { label: 'Français', lang: 'fr' } },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/adenyrr/docu' },
        { icon: 'gitlab', label: 'GitLab', href: 'https://gitlab.com/adenyrr' },
      ],
      sidebar: [
        {
          label: '/calamares',
          slug: 'docu',
        },
        {
          label: '/network',
          items: [
            { slug: 'docu/reseau/swag' },
            { slug: 'docu/reseau/stepca' },
          ],
        },
        {
          label: '/srv',
          items: [
            { slug: 'docu/services/jellyfin' },
            { slug: 'docu/services/ollama' },
          ],
        },
        {
          label: '/assist',
          items: [
            { slug: 'docu/hassio/install' },
            { slug: 'docu/hassio/hacs' },
            { slug: 'docu/hassio/integrations' },
            { slug: 'docu/hassio/meteo' },
          ],
        },
        {
          label: '/virtu',
          items: [
            { slug: 'docu/virtu/pve' },
          ],
        },
        {
          label: '/tools',
          items: [
            { slug: 'docu/outils/commandes' },
            { slug: 'docu/outils/softwares' },
            { slug: 'docu/outils/ressources' },
            { slug: 'docu/outils/links' },
          ],
        },
      ],
      customCss: ['./src/styles/starlight-custom.css'],
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#141416' },
        },
      ],
      components: {
        SiteTitle: './src/components/starlight/SiteTitle.astro',
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
        Pagination: './src/components/starlight/Pagination.astro',
      },
    }),
    mdx(),
    sitemap(),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
