/**
 * Fetch Credly badges for a user at build time
 */
export async function fetchCredlyBadges(username: string): Promise<CredlyBadge[]> {
  try {
    const response = await fetch(
      `https://www.credly.com/users/${username}/badges.json`
    );
    if (!response.ok) {
      console.warn(`[Credly] Failed to fetch badges for ${username}: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return (data.data || []).map((badge: any) => ({
      id: badge.id,
      title: badge.badge_template?.name || 'Unknown',
      issuer: badge.issuer?.entities?.[0]?.entity?.name || 'Unknown',
      date: badge.issued_at?.split('T')?.[0] || '',
      imageUrl: badge.badge_template?.image_url || '',
      credlyUrl: `https://www.credly.com/badges/${badge.id}/public_url`,
      description: badge.badge_template?.description || '',
    }));
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
}
