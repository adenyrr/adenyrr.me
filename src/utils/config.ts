import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const cache = new Map<string, unknown>();

/**
 * Load and parse a YAML config file from /config/ (cached per build)
 */
export function loadConfig<T = Record<string, any>>(filename: string): T {
  if (cache.has(filename)) return cache.get(filename) as T;
  const configPath = path.resolve(process.cwd(), 'config', filename);
  const content = fs.readFileSync(configPath, 'utf-8');
  const result = yaml.parse(content) as T;
  cache.set(filename, result);
  return result;
}

/**
 * Get site config
 */
export function getSiteConfig() {
  return loadConfig('site.yaml');
}

/**
 * Get home config
 */
export function getHomeConfig() {
  return loadConfig('home.yaml');
}

/**
 * Get infra config
 */
export function getInfraConfig() {
  return loadConfig('infra.yaml');
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  const config = getSiteConfig();
  return config.features?.[feature] === true;
}
