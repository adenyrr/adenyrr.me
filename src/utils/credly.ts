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
    const response = await fetch(
      `https://www.credly.com/users/${username}/badges.json`
    );
    if (!response.ok) {
      console.warn(`[Credly] Failed to fetch badges for ${username}: ${response.status}`);
      return [];
    }
    const data = await response.json();
    const pinnedSet = new Set(pinnedIds);
    const badges: CredlyBadge[] = (data.data || []).map((badge: any) => ({
      id: badge.id,
      title: badge.badge_template?.name || 'Unknown',
      issuer: badge.issuer?.entities?.[0]?.entity?.name || 'Unknown',
      date: badge.issued_at?.split('T')?.[0] || '',
      imageUrl: badge.badge_template?.image_url || '',
      credlyUrl: `https://www.credly.com/badges/${badge.id}/public_url`,
      description: badge.badge_template?.description || '',
      pinned: pinnedSet.has(badge.id),
    }));

    // Pinned badges first (in the order given in pinnedIds), then the rest
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
