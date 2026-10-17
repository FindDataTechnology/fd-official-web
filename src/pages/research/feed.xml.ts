import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { loadXingyanSurface, slugOf } from '../../lib/xingyan';

// 星研订阅源（official-web-surface-refresh）：三栏合并 RSS 2.0。
// 只在构建期生成一次，与页面同源——不存在「页面更新了但 feed 没更新」。
const SITE = 'https://www.finddatatech.cloud';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

interface Item {
  title: string;
  link: string;
  date: string;
  description: string;
  category: string;
}

export const GET: APIRoute = async () => {
  const { courses, briefings, articles } = await loadXingyanSurface();
  const items: Item[] = [];

  // Courses: `updated` is the freshness signal; fall back to nothing rather
  // than inventing a date (an undated course simply stays out of the feed).
  for (const course of courses.en) {
    if (!course.data.updated) continue;
    items.push({
      title: course.data.title,
      link: `${SITE}/research/academy/${slugOf(course)}`,
      date: course.data.updated,
      description: course.data.summary,
      category: 'Academy',
    });
  }
  for (const briefing of briefings.en) {
    items.push({
      title: briefing.data.title,
      link: `${SITE}/research/briefings/${slugOf(briefing)}`,
      date: briefing.data.date,
      description: briefing.data.summary,
      category: 'Briefings',
    });
  }
  for (const article of articles.en) {
    items.push({
      title: article.data.title,
      link: `${SITE}/research/articles/${slugOf(article)}`,
      date: article.data.date,
      description: article.data.summary,
      category: 'Research',
    });
  }

  items.sort((a, b) => b.date.localeCompare(a.date));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>寻数·星研 / FindData Xingyan</title>
    <link>${SITE}/research</link>
    <description>研究与教育线：学院课程、内参、研究长文。</description>
    <language>zh-cn</language>
${items
  .map(
    (item) => `    <item>
      <title>${esc(item.title)}</title>
      <link>${esc(item.link)}</link>
      <guid isPermaLink="true">${esc(item.link)}</guid>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(item.category)}</category>
      <description>${esc(item.description)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
