import { XMLParser } from 'fast-xml-parser';

/**
 * Fetches photo entries from the photos.longwalkhome.net RSS/Atom feed
 * at build time. Fails soft: if the feed is unreachable or malformed,
 * the site still builds, just without photo entries.
 *
 * Override the feed URL with the PHOTOS_FEED_URL environment variable.
 */

const FEED_URL =
  import.meta.env.PHOTOS_FEED_URL ?? 'https://photo.longwalkhome.net/feed.xml';

export interface PhotoItem {
  title: string;
  link: string;
  date: Date;
  image: string | null;
  description: string | null;
  album: string | null;
}

function albumFrom(html: string | null): string | null {
  if (!html) return null;
  const m = html.match(/ALBUM\s+([^\n<]+)/);
  return m ? m[1].trim() : null;
}

function firstImgSrc(html: string | undefined): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function text(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && '#text' in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>)['#text']);
  }
  return String(v);
}

export async function getPhotos(): Promise<PhotoItem[]> {
  try {
    const res = await fetch(FEED_URL, {
      signal: AbortSignal.timeout(15000),
      headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml.trim()) throw new Error('empty feed body');

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const doc = parser.parse(xml);

    // RSS 2.0
    const rssItems = asArray(doc?.rss?.channel?.item);
    if (rssItems.length > 0) {
      return rssItems
        .map((item: any): PhotoItem | null => {
          const dateStr = text(item.pubDate) ?? text(item['dc:date']);
          const date = dateStr ? new Date(dateStr) : null;
          if (!date || isNaN(date.getTime())) return null;
          const image =
            item.enclosure?.['@_url'] ??
            asArray(item['media:content'])[0]?.['@_url'] ??
            item['media:thumbnail']?.['@_url'] ??
            firstImgSrc(text(item['content:encoded']) ?? text(item.description) ?? undefined);
          const description = text(item.description);
          return {
            title: text(item.title) ?? 'Untitled',
            link: text(item.link) ?? FEED_URL,
            date,
            image: image ?? null,
            description,
            album: albumFrom(description),
          };
        })
        .filter((p): p is PhotoItem => p !== null);
    }

    // Atom
    const atomEntries = asArray(doc?.feed?.entry);
    if (atomEntries.length > 0) {
      return atomEntries
        .map((entry: any): PhotoItem | null => {
          const dateStr = text(entry.published) ?? text(entry.updated);
          const date = dateStr ? new Date(dateStr) : null;
          if (!date || isNaN(date.getTime())) return null;
          const links = asArray(entry.link);
          const alt =
            links.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel'])?.['@_href'] ??
            links[0]?.['@_href'];
          const image =
            links.find((l: any) => l['@_rel'] === 'enclosure')?.['@_href'] ??
            asArray(entry['media:content'])[0]?.['@_url'] ??
            firstImgSrc(text(entry.content) ?? text(entry.summary) ?? undefined);
          const description = text(entry.summary);
          return {
            title: text(entry.title) ?? 'Untitled',
            link: alt ?? FEED_URL,
            date,
            image: image ?? null,
            description,
            album: albumFrom(description),
          };
        })
        .filter((p): p is PhotoItem => p !== null);
    }

    throw new Error('unrecognized feed format');
  } catch (err) {
    console.warn(
      `[photos] feed unavailable (${err instanceof Error ? err.message : err}); building without photo entries`
    );
    return [];
  }
}
