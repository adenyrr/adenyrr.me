/**
 * Astro environment variables typing
 * Define public and secret variables used in the project
 */

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_SITE_TITLE: string;
  readonly PUBLIC_SITE_DESCRIPTION: string;
  readonly PUBLIC_SITE_AUTHOR: string;
  readonly PUBLIC_GA_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
