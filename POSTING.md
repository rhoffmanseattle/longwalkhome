# Posting spec for longwalkhome.net

How a post goes from idea to live site. This is the reference for authoring,
whether written by hand, by Claude, or by any future tool.

## The file

One post = one Markdown file in `src/content/posts/`.

- **Filename becomes the URL:** `my-camera-review.md` → `longwalkhome.net/posts/my-camera-review/`
- Use lowercase, hyphens, no spaces: `first-post-again.md`, not `First Post.md`.
- The filename is permanent once published; changing it changes the URL and breaks inbound links.

## Frontmatter

Required and optional fields, validated at build time by `src/content.config.ts`.
A build fails loudly if `title` or `date` is missing or malformed.

```markdown
---
title: Review of the Panasonic G9ii     # required
date: 2026-07-07                        # required, YYYY-MM-DD
description: One-line summary.          # optional, shown as the excerpt in the home feed
tags: [cameras, reviews]                # optional, accepted but not yet displayed anywhere
draft: false                            # optional, true = excluded from the build entirely
---
```

- `date` controls feed position (newest first) and the displayed date. Future dates publish immediately; there is no scheduling.
- `description` is worth writing: without it, the home feed shows only the title.
- `draft: true` keeps a work-in-progress out of the live site while still committed to the repo.

## Body

Plain Markdown below the frontmatter. Everything standard works: headers,
links, lists, blockquotes, code blocks.

- **Raw HTML is allowed.** Paste YouTube/Vimeo embed code directly; CSS forces all iframes/videos responsive at 16:9 full column width.
- **Images:** reference remote images with standard Markdown (`![alt](https://...)`). Flickr image URLs from photo.longwalkhome.net posts work directly. For local images, put files in `public/images/` and reference as `/images/filename.jpg`.
- **Linked images** (image that clicks through) use the nested syntax: `[![alt](image-url)](link-url)`.
- No space between `]` and `(` in links — `[here] (url)` silently breaks.

## Publishing

1. The file lands in `src/content/posts/` (author directly there, or hand the file/text to Claude).
2. Verify: `npm run build` must pass locally (Claude does this in its sandbox before every push).
3. Commit it (see CLAUDE.md for commit conventions) and push to `main`.
4. Netlify auto-builds and deploys; live in about a minute. There is no staging environment.
5. The post automatically appears in the home feed and `/rss.xml`. Nothing to update manually.

## Unpublishing / editing

- Edit the file and push; the change deploys the same way.
- To unpublish, set `draft: true` (keeps the file) or delete the file. Either way, push.

## What Claude checks before publishing a post

- Frontmatter parses and has required fields
- All external links and image URLs return 200
- Malformed Markdown link syntax
- Local `npm run build` passes
