# longwalkhome.net — project context

Personal blog for Ryan Hoffman. This file is the technical briefing for any new
Claude session. Read it before making changes.

## The basics

- **Live site:** https://longwalkhome.net
- **Repo:** https://github.com/rhoffmanseattle/longwalkhome (private)
- **Hosting:** Netlify, auto-deploys on every push to `main`. Build config in `netlify.toml` (npm run build → `dist/`, Node 22).
- **DNS:** hosted at Netlify.
- **Stack:** Astro 5 (static output), plain CSS, no framework, no CMS, no database. Deps: `astro`, `@astrojs/rss`, `fast-xml-parser`.

## Publish flow

Push to `main` = deploy. Netlify builds in about a minute. There is no staging;
verify with a local `npm run build` before pushing.

- **GitHub auth for pushing:** a fine-grained PAT is stored in `.env` (gitignored, never commit it) as `GITHUB_PAT`. Push with:
  `git push https://x-access-token:$GITHUB_PAT@github.com/rhoffmanseattle/longwalkhome.git main`
- Ryan has explicitly authorized Claude to push to this repo (recorded July 2026). The git-commit-workflow skill's no-push default is overridden here.
- Commit style: plain prose subject + body, author `Ryan Hoffman <longwalkhome@gmail.com>`, `Co-Authored-By: Claude <noreply@anthropic.com>` trailer. Stage specific files, never `git add .`.

## Content model

- **Posts** are Markdown files in `src/content/posts/`. Frontmatter schema (validated in `src/content.config.ts`): `title` (required), `date` (required), `description` (optional, shown as excerpt in home feed), `tags` (optional array, currently unused by templates), `draft` (bool, `true` excludes from build).
- Filename becomes the URL: `foo.md` → `/posts/foo/`.
- Raw HTML is allowed in Markdown (used for YouTube embeds, etc.).

## Photos integration

- The home feed interleaves posts with photo entries pulled at **build time** from the RSS feed of Ryan's separate photo app: `https://photo.longwalkhome.net/feed.xml` (note: photo singular, photos.* does not resolve).
- Parser: `src/lib/photos.ts`. Handles RSS 2.0 and Atom, extracts image from media:content/enclosure/first-img, parses album name from the `ALBUM` line in the description. **Fails soft**: if the feed is down, the build succeeds without photos.
- Feed URL override: `PHOTOS_FEED_URL` env var (settable in Netlify UI).
- Home feed shows the **20 most recent** photos (`PHOTO_LIMIT` in `src/pages/index.astro`).
- New photos appear only on rebuild. A scheduled daily rebuild (Netlify build hook + cron) has been discussed but is NOT set up yet.

## Pages and templates

- `src/layouts/Base.astro` — HTML shell, header/nav (Home, Projects, Photos, RSS), footer.
- `src/pages/index.astro` — home: merged post+photo feed, newest first.
- `src/pages/posts/[...slug].astro` — individual post pages.
- `src/pages/projects.astro` — Projects page: five side projects, Ryan's descriptions verbatim, screenshot each (in `public/images/projects/`, captured July 2026 via headless Chromium at 1440x900). Photo-App entry links to its GitHub repo.
- `src/pages/rss.xml.js` — site RSS (posts only) at `/rss.xml`.
- No archive page, no tag pages, no pagination yet — flat reverse-chronological feed by design (v1).

## Styling

- All design tokens (colors, fonts, measure, radius) are CSS custom properties at the top of `src/styles/global.css`, with automatic dark mode via `prefers-color-scheme`. Restyle by editing that block.
- `.prose iframe/video/embed` are forced responsive 16:9 full-width (for pasted YouTube embeds).

## History and decisions

- Site name renders lowercase: **longwalkhome** (header, page titles, RSS).
- WordPress deliberately rejected; Ryan wanted Markdown authoring, instant loads, full style control, and content aggregation from his other apps.
- Cloudflare Pages was considered but DNS lives at Netlify, so Netlify hosts (its 100 GB/month free bandwidth is sufficient).
- Ryan's related projects: shouldyoubuythiscamera.com, slicer.longwalkhome.net, seen.longwalkhome.net, photo.longwalkhome.net (repo: github.com/rhoffmanseattle/Photo-App, security-audited clean July 2026, was private), parkbound.app.

## Open items

- Scheduled daily rebuild for fresh photos (needs a Netlify build hook URL from Ryan).
- `hello-world.md` scaffold post still published; Ryan may want it removed.
- Sandbox note: local builds must run on the VM's local disk (`/tmp`), not the mounted folder (npm is unusably slow there), and `/tmp` may be wiped between commands — recreate and reinstall as needed (`npm install` takes ~5-30s).
