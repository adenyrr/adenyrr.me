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
    title: z.string().min(1), description: z.string().min(1), url: z.string().url(),
    author: z.string().min(1), email: z.string().email().optional(),
    locale: z.string().min(2), defaultImage: z.string().min(1),
  }).strict(),
  gpg: z.object({
    enabled: z.boolean().default(false), publicKeyUrl: z.string().min(1).optional(),
    fingerprint: z.string().min(1).optional(),
  }).strict().optional(),
  features: z.object({ infra: z.boolean(), blog: z.boolean(), docu: z.boolean() }).strict(),
  appearance: z.object({ ambientBackground: z.boolean() }).strict(),
  header: z.object({
    show: z.boolean().default(true), brandName: z.string().min(1), brandHost: z.string(),
    navigation: z.array(z.object({
      label: z.string(), route: z.string().optional(), url: z.string().optional(),
      feature: z.enum(['infra', 'blog', 'docu']).optional(),
      enabled: z.boolean().default(true), external: z.boolean().optional(),
    }).strict()),
    socialLinks: z.array(z.object({
      label: z.string(), url: z.string(), icon: z.string(), enabled: z.boolean().default(true),
    }).strict()),
  }).strict(),
  footer: z.object({
    show: z.boolean().default(true), copyright: z.string(), author: z.string(),
    authorUrl: z.string(), signatureCommand: z.string(), note: z.string(),
    navigationLabel: z.string(), connectLabel: z.string(), backToTopLabel: z.string(),
    shellPrompt: z.string(), branch: z.string(), rss: z.boolean().default(true),
    poweredBy: z.array(z.object({ label: z.string(), url: z.string() }).strict()),
  }).strict(),
  seo: z.object({
    sitemap: z.boolean(), robots: z.boolean(), openGraph: z.boolean(), twitterCard: z.boolean(),
  }).strict(),
  blog: z.object({
    pageTitle: z.string(), pageDescription: z.string(), path: z.string(), heading: z.string(),
    headingAccent: z.string(), introduction: z.string(), emptyLabel: z.string(),
    readMoreLabel: z.string(), readingTimeSuffix: z.string(), backLabel: z.string(),
    rssTitle: z.string(), rssDescription: z.string(),
  }).strict(),
}).strict();

const actionSchema = z.object({ label: z.string(), url: z.string() }).strict();
const sectionHeaderSchema = z.object({
  index: z.string(), path: z.string(), title: z.string(), introduction: z.string(),
}).strict();

const homeConfigSchema = z.object({
  profile: z.object({ pseudo: z.string(), tagline: z.string() }).strict(),
  hero: z.object({
    kicker: z.string(), role: z.string(), statementLead: z.string(), qualities: z.array(z.string()),
    consolePrompt: z.string(), consoleCommands: z.array(z.string()).min(1),
    primaryAction: actionSchema, secondaryAction: actionSchema,
  }).strict(),
  systemWidget: z.object({
    ariaLabel: z.string(), monogram: z.string().length(1), orbitLabel: z.string(),
    windowTitle: z.string(), terminal: z.string(), status: z.string(),
    prompt: z.string(), command: z.string(), commandFlag: z.string(), identity: z.string(),
    hostSuffix: z.string(), subtitle: z.string(), operator: z.string(), host: z.string(),
    role: z.string(), location: z.string(), edgeNodes: z.number().int().nonnegative(),
    architecture: z.string(), memoryType: z.string(), networkStack: z.array(z.string()),
    securityStack: z.array(z.string()), platformStack: z.array(z.string()),
    systems: z.array(z.string()), availability: z.string(),
  }).strict(),
  sections: z.object({
    projects: z.boolean(), lab: z.boolean(), journey: z.boolean(), contact: z.boolean(),
    diplomas: z.boolean(), certifications: z.boolean(), jobs: z.boolean(),
  }).strict(),
  sectionHeaders: z.object({
    projects: sectionHeaderSchema, lab: sectionHeaderSchema,
    journey: sectionHeaderSchema, contact: sectionHeaderSchema,
  }).strict(),
  labLayers: z.array(z.object({
    id: z.string(), label: z.string(), eyebrow: z.string(), title: z.string(), text: z.string(),
    tech: z.string().optional(), metrics: z.enum(['compute', 'platform', 'storage']).optional(), icon: z.string(),
  }).strict()),
  journey: z.object({
    careerCommand: z.string(), experienceLabel: z.string(), educationLabel: z.string(),
    credentialsCommand: z.string(), credentialsTitle: z.string(), otherCredentialsLabel: z.string(),
  }).strict(),
  contact: z.object({
    discordLabel: z.string(), emailLabel: z.string(), gpgPath: z.string(), gpgTitle: z.string(),
    gpgDescription: z.string(), gpgDownloadLabel: z.string(), gpgPendingLabel: z.string(),
  }).strict(),
  credly: z.object({
    enabled: z.boolean(), username: z.string(), featuredCount: z.number().int().positive(),
    pinnedIds: z.array(z.string()),
  }).strict(),
  projects: z.array(z.object({
    id: z.string(), title: z.string(), description: z.string(), tech: z.array(z.string()),
    icon: z.string(), link: z.string().optional(), repo: z.string().optional(),
    year: z.number().int(), image: z.string().optional(),
  }).strict()),
  diplomas: z.array(z.object({
    id: z.string(), title: z.string(), institution: z.string(), period: z.string(),
  }).strict()),
  certifications: z.array(z.object({
    id: z.string(), title: z.string(), issuer: z.string(), date: z.string(),
    credly_url: z.string(), badge_image: z.string(),
  }).strict()),
  jobs: z.array(z.object({
    id: z.string(), title: z.string(), company: z.string(), location: z.string(), period: z.string(),
  }).strict()),
}).strict();

const nodeServiceSchema = z.object({ name: z.string(), type: z.string() }).strict();
const infraNodeSchema = z.object({
  name: z.string(), cpu: z.string(), ram: z.string(), color: z.string(),
  icon: z.string().optional(), services: z.array(nodeServiceSchema).optional(),
}).strict();
const detailedServiceSchema = z.object({
  name: z.string(), description: z.string(), status: z.string(),
}).strict();

const infraConfigSchema = z.object({
  page: z.object({
    title: z.string(), description: z.string(), path: z.string(), heading: z.string(),
    headingAccent: z.string(), introduction: z.string(), explorerLabel: z.string(),
    terminalTitle: z.string(), terminalStatus: z.string(),
  }).strict(),
  documentation: z.object({
    url: z.string(), label: z.string(), serviceLinks: z.record(z.string(), z.string()),
  }).strict(),
  stats: z.object({
    totalCpuCores: z.number(), totalRamGB: z.number(), cephStorage: z.string(), nasStorage: z.string(),
  }).strict(),
  tabs: z.object({
    services: z.object({
      enabled: z.boolean(), label: z.string(), icon: z.string(), hash: z.string(),
      countLabel: z.string(), description: z.string(),
    }).strict(),
    lan: z.object({
      enabled: z.boolean(), label: z.string(), icon: z.string(), hash: z.string(),
      countLabel: z.string(), description: z.string(),
    }).strict(),
    wan: z.object({
      enabled: z.boolean(), label: z.string(), icon: z.string(), hash: z.string(),
      countLabel: z.string(), description: z.string(),
    }).strict(),
  }).strict(),
  vlanCategories: z.record(z.string(), z.object({ label: z.string(), color: z.string() }).strict()),
  proxmoxNodes: z.array(infraNodeSchema),
  networkDevices: z.array(infraNodeSchema),
  vlans: z.array(z.object({
    name: z.string(), subnet: z.string(), icon: z.string(), devices: z.array(z.string()),
    category: z.string(), color: z.string(),
  }).strict()),
  serviceGroups: z.array(z.object({
    vm: z.string(), node: z.string(), type: z.string(), color: z.string(),
    services: z.array(detailedServiceSchema),
  }).strict()),
  wanExposure: z.object({
    description: z.string(),
    chain: z.array(z.object({
      step: z.string(), icon: z.string(), color: z.string(), description: z.string(),
      features: z.array(z.string()).optional(),
    }).strict()),
    exposedServices: z.array(z.object({
      name: z.string(), domain: z.string(), vm: z.string(), node: z.string(),
    }).strict()),
  }).strict(),
}).strict();

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
