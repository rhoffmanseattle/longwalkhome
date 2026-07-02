# longwalkhome.net

Personal blog built with [Astro](https://astro.build), deployed on Netlify.

## Writing a post

Add a Markdown file to `src/content/posts/`:

```markdown
---
title: My post title
date: 2026-07-15
description: Optional one-line summary shown in the feed.
tags: [optional, tags]
draft: false
---

Post body in Markdown.
```

Push to `main` and Netlify builds and publishes automatically. Set `draft: true` to keep a post out of the build.

## Photos feed

At build time the site fetches the RSS feed from photo.longwalkhome.net and interleaves photo entries with posts in the home feed, sorted by date. If the feed is unreachable the build still succeeds, just without photos.

- Feed URL defaults to `https://photo.longwalkhome.net/feed.xml`; override with the `PHOTOS_FEED_URL` environment variable (set it in Netlify site settings).
- New photos appear on the next build. To pick them up without writing a post, trigger a rebuild (Netlify build hook), or set up a scheduled daily rebuild.

## Styling

All design tokens (colors, fonts, spacing) live at the top of `src/styles/global.css` as CSS custom properties, with automatic dark mode. Layout templates are in `src/layouts/` and `src/pages/`.

## Local development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # production build to dist/
```
