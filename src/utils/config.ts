import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { z } from 'astro/zod';

/**
 * Zod schemas for configuration validation
 * Ensures data consistency and type safety at build time
 */

const siteConfigSchema = z.object({
  site: z.object({
    title: z.string().min(1, 'Site title is required'),
    description: z.string().min(1, 'Site description is required'),
    url: z.string().url('Invalid site URL'),
    author: z.string().min(1, 'Author name is required'),
    email: z.string().email().optional(),
  }),
  features: z.record(z.boolean()).optional(),
  header: z
    .object({
      show: z.boolean().optional().default(true),
      brandName: z.string().optional(),
      navigation: z
        .array(
          z.object({
            label: z.string(),
            route: z.string().optional(),
            url: z.string().optional(),
            icon: z.string().optional(),
            enabled: z.boolean().optional().default(true),
            external: z.boolean().optional(),
          })
        )
        .optional(),
      socialLinks: z
        .array(
          z.object({
            label: z.string(),
            url: z.string(),
            icon: z.string().optional(),
            enabled: z.boolean().optional().default(true),
          })
        )
        .optional(),
    })
    .optional(),
  theme: z
    .object({
      mode: z.enum(['auto', 'dark', 'light']).optional().default('auto'),
      colors: z.record(z.any()).optional(),
      particles: z.record(z.any()).optional(),
      fonts: z.record(z.string()).optional(),
    })
    .optional(),
  seo: z
    .object({
      openGraph: z.boolean().optional().default(true),
      twitterCard: z.boolean().optional().default(true),
      sitemap: z.boolean().optional().default(true),
    })
    .optional(),
  footer: z
    .object({
      rss: z.boolean().optional().default(true),
      copyright: z.string().optional(),
      author: z.string().optional(),
      authorUrl: z.string().optional(),
      poweredBy: z
        .array(
          z.object({
            label: z.string(),
            url: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

const homeConfigSchema = z.object({
  profile: z
    .object({
      pseudo: z.string().optional(),
      title: z.string().optional(),
      tagline: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
  heroLinks: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
        icon: z.string().optional(),
        internal: z.boolean().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .optional(),
  sections: z
    .object({
      projects: z.boolean().optional(),
      diplomas: z.boolean().optional(),
      certifications: z.boolean().optional(),
      jobs: z.boolean().optional(),
    })
    .optional(),
  credly: z
    .object({
      enabled: z.boolean().optional(),
      username: z.string().optional(),
      pinnedIds: z.array(z.string()).optional(),
    })
    .optional(),
  projects: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        tech: z.array(z.string()).optional(),
        icon: z.string().optional(),
        link: z.string().optional(),
        repo: z.string().optional(),
        year: z.number().optional(),
        image: z.string().optional(),
      })
    )
    .optional(),
  diplomas: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        institution: z.string().optional(),
        period: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        issuer: z.string().optional(),
        date: z.string().optional(),
        credly_url: z.string().optional(),
        badge_image: z.string().optional(),
      })
    )
    .optional(),
  jobs: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        company: z.string().optional(),
        location: z.string().optional(),
        period: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

const infraConfigSchema = z.object({
  sections: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        items: z.array(z.any()),
      })
    )
    .optional(),
});

type SiteConfig = z.infer<typeof siteConfigSchema>;
type HomeConfig = z.infer<typeof homeConfigSchema>;
type InfraConfig = z.infer<typeof infraConfigSchema>;

const cache = new Map<string, unknown>();

/**
 * Load and parse a YAML config file from /config/ directory
 * Results are cached per build
 * @param filename - Name of the YAML file to load
 * @param schema - Optional Zod schema for validation
 * @returns Parsed and validated configuration object
 */
export function loadConfig<T = Record<string, any>>(
  filename: string,
  schema?: z.ZodSchema
): T {
  const cacheKey = `${filename}:${schema ? 'validated' : 'raw'}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }

  try {
    const configPath = path.resolve(process.cwd(), 'config', filename);

    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${filename}`);
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const raw = yaml.parse(content);

    // Validate against schema if provided
    const result = schema ? schema.parse(raw) : raw;

    cache.set(cacheKey, result);
    return result as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Configuration validation error in ${filename}:`, error.errors);
      throw new Error(
        `Invalid configuration in ${filename}: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}

/**
 * Get site configuration with validation
 * @returns Validated site configuration
 */
export function getSiteConfig(): SiteConfig {
  return loadConfig<SiteConfig>('site.yaml', siteConfigSchema);
}

/**
 * Get home page configuration with validation
 * @returns Validated home configuration
 */
export function getHomeConfig(): HomeConfig {
  return loadConfig<HomeConfig>('home.yaml', homeConfigSchema);
}

/**
 * Get infrastructure configuration with validation
 * @returns Validated infra configuration
 */
export function getInfraConfig(): InfraConfig {
  return loadConfig<InfraConfig>('infra.yaml', infraConfigSchema);
}

/**
 * Check if a feature is enabled
 * @param feature - Feature flag name
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  const config = getSiteConfig();
  return config.features?.[feature] === true;
}
