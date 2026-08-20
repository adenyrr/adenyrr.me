import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSiteConfig } from '../utils/config';

export async function GET(context) {
  const posts = await getCollection('blog');
  const config = getSiteConfig();
  return rss({
    title: config.blog.rssTitle,
    description: config.blog.rssDescription,
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
