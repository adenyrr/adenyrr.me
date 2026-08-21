import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const configPath = path.join(projectRoot, 'config', 'home.yaml');

async function fetchCredlyBadges(username, pinnedIds = []) {
  const rawBadges = [];
  let nextPageUrl = `https://www.credly.com/users/${encodeURIComponent(username)}/badges.json`;
  let pageCount = 0;

  while (nextPageUrl && pageCount < 50) {
    const response = await fetch(nextPageUrl, {
      headers: {
        accept: 'application/json',
        'user-agent': 'adenyrr-me-sync/1.0',
      },
    });

    if (!response.ok) {
      console.warn(`[Credly] Failed to fetch badges for ${username}: ${response.status}`);
      if (rawBadges.length === 0) return [];
      break;
    }

    const page = await response.json();
    rawBadges.push(...(page.data || []));
    pageCount += 1;
    nextPageUrl = page.metadata?.next_page_url
      ? new URL(page.metadata.next_page_url, 'https://www.credly.com').toString()
      : undefined;
  }

  const pinnedSet = new Set(pinnedIds);
  const seenIds = new Set();
  const badges = rawBadges
    .filter((badge) => badge?.id && !seenIds.has(badge.id))
    .map((badge) => {
      seenIds.add(badge.id);
      return {
        id: badge.id,
        title: badge.badge_template?.name || 'Unknown',
        issuer: badge.issuer?.entities?.[0]?.entity?.name || 'Unknown',
        date: badge.issued_at?.split('T')?.[0] || '',
        badge_image: badge.badge_template?.image_url || '',
        credly_url: `https://www.credly.com/badges/${badge.id}/public_url`,
        description: badge.badge_template?.description || '',
        pinned: pinnedSet.has(badge.id),
      };
    });

  const pinned = pinnedIds
    .map((id) => badges.find((badge) => badge.id === id))
    .filter(Boolean);
  const unpinned = badges.filter((badge) => !pinnedSet.has(badge.id));

  return [...pinned, ...unpinned];
}

async function main() {
  const source = await fs.readFile(configPath, 'utf8');
  const config = YAML.parse(source);

  const username = config?.credly?.username ?? 'adenyrr';
  const pinnedIds = Array.isArray(config?.credly?.pinnedIds) ? config.credly.pinnedIds : [];

  const updated = await fetchCredlyBadges(username, pinnedIds);
  if (!updated.length) {
    console.warn('[Credly] No badges found; leaving config unchanged.');
    return;
  }

  config.certifications = updated.map((badge) => ({
    id: badge.id,
    title: badge.title,
    issuer: badge.issuer,
    date: badge.date,
    credly_url: badge.credly_url,
    badge_image: badge.badge_image,
  }));

  await fs.writeFile(configPath, `${YAML.stringify(config, { lineWidth: 0 })}\n`, 'utf8');
  console.log(`[Credly] Synced ${config.certifications.length} certifications from ${username}.`);
}

main().catch((error) => {
  console.error('[Credly] Failed to sync certifications:', error);
  process.exit(1);
});
