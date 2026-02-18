import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: 'adenyrr.me - Blog',
    description: 'Blog personnel - Tech, Homelab & DevOps',
    site: context.site,
    items: posts
      .sort((a, b) => (b.data.pubDate?.valueOf() || 0) - (a.data.pubDate?.valueOf() || 0))
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
      })),
  });
}
