// Auto-extraction of a thumbnail image and a short excerpt from a post's
// raw Markdown body, used by the home feed. Fails soft: posts with no
// image, or where every paragraph is unusable, just render without one.

const MD_IMAGE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
const HTML_IMAGE = /<img[^>]+src=["']([^"']+)["']/i;

/** First image referenced in the post body, Markdown or raw <img>. */
export function getFirstImage(body: string): string | null {
  const md = body.match(MD_IMAGE);
  if (md) return md[1];
  const html = body.match(HTML_IMAGE);
  if (html) return html[1];
  return null;
}

/** True if a paragraph is just an image (optionally link-wrapped), no real text. */
function isImageOnlyParagraph(paragraph: string): boolean {
  const withoutImages = paragraph.replace(/!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)/g, '');
  const withoutLinkWrapper = withoutImages.replace(/\[|\]/g, '').replace(/\([^)]*\)/g, '');
  return withoutLinkWrapper.trim().length === 0;
}

/** Strip Markdown syntax down to plain text. */
function toPlainText(paragraph: string): string {
  return paragraph
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> link text
    .replace(/[*_`]{1,3}/g, '') // bold/italic/code markers
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + '…';
}

/**
 * First usable paragraph of body text, Markdown stripped and truncated.
 * Skips headings, raw HTML blocks (e.g. pasted embeds), and image-only
 * paragraphs. Returns null if nothing usable is found.
 */
export function getAutoExcerpt(body: string, maxLen = 150): string | null {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith('#')) continue;
    if (paragraph.startsWith('<')) continue;
    if (isImageOnlyParagraph(paragraph)) continue;

    const text = toPlainText(paragraph);
    if (text.length === 0) continue;

    return truncate(text, maxLen);
  }

  return null;
}
