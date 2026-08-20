/**
 * Fetch Credly badges for a user at build time.
 * pinnedIds — badge IDs to surface first (the Credly public API does not expose
 * pin status, so they are configured manually in home.yaml).
 */
export async function fetchCredlyBadges(
  username: string,
  pinnedIds: string[] = [],
): Promise<CredlyBadge[]> {
  try {
    const rawBadges: any[] = [];
    let nextPageUrl: string | undefined = `https://www.credly.com/users/${encodeURIComponent(username)}/badges.json`;
    let pageCount = 0;

    while (nextPageUrl && pageCount < 50) {
      const response = await fetch(nextPageUrl);
      if (!response.ok) {
        console.warn(`[Credly] Failed to fetch badges for ${username}: ${response.status}`);
        if (rawBadges.length === 0) return [];
        break;
      }

      const page = await response.json();
      rawBadges.push(...(page.data || []));
      pageCount += 1;

      const next = page.metadata?.next_page_url;
      nextPageUrl = next ? new URL(next, 'https://www.credly.com').toString() : undefined;
    }

    const pinnedSet = new Set(pinnedIds);
    const seenIds = new Set<string>();
    const badges: CredlyBadge[] = rawBadges.filter((badge: any) => {
      if (!badge.id || seenIds.has(badge.id)) return false;
      seenIds.add(badge.id);
      return true;
    }).map((badge: any) => ({
      id: badge.id,
      title: badge.badge_template?.name || 'Unknown',
      issuer: badge.issuer?.entities?.[0]?.entity?.name || 'Unknown',
      date: badge.issued_at?.split('T')?.[0] || '',
      imageUrl: badge.badge_template?.image_url || '',
      credlyUrl: `https://www.credly.com/badges/${badge.id}/public_url`,
      description: badge.badge_template?.description || '',
      pinned: pinnedSet.has(badge.id),
    }));

    // Pinned badges first (in configured order), then every remaining page.
    const pinned   = pinnedIds
      .map(id => badges.find(b => b.id === id))
      .filter((b): b is CredlyBadge => b !== undefined);
    const unpinned = badges.filter(b => !pinnedSet.has(b.id));
    return [...pinned, ...unpinned];
  } catch (error) {
    console.warn(`[Credly] Error fetching badges:`, error);
    return [];
  }
}

export interface CredlyBadge {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
  credlyUrl: string;
  description: string;
  pinned: boolean;
}
