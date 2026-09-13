# dashbad — Portfolio

Personal portfolio website. Built with **Astro 7**, **Tailwind CSS 4**, **React** (islands only), **MDX** and
**TypeScript**, served in production by **Caddy 2** with heavy media mounted from the host.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output → dist/
npm run check      # astro type-check
```

Requires Node ≥ 22.12.

## Structure

```
src/
  components/      VideoPlayer, SoundCloudPlayer, YouTubeEmbed (Astro)
    ui/            React components adapted from 21st.dev (navbar, lattice hero, editorial hero, galleries, footer, key-value list)
  content/
    config.ts      Content collection schemas (art, music)
    art/*.mdx      Work pages
    music/*.mdx    Tracks
  layouts/         BaseLayout (fonts, meta, navbar/footer)
  lib/content.ts   Collection helpers + social links
  lib/utils.ts     `cn()` class helper used by the React components
  pages/           /, /art, /art/[slug], /music, /about, 404
  styles/global.css  shadcn/ui design tokens + prose styles
public/media/      Local-only media (git-ignored, docker-ignored)
host-media/        Production media mount (git-ignored, docker-ignored)
```

## Design system

Dark, neutral palette (charcoal ground, off-white text) using the standard shadcn/ui token names (`background`, `foreground`, `muted`,
`muted-foreground`, `border`, `ring`), defined in `src/styles/global.css`. Single theme; the `dark:`
variant is class-based and never activated, so components render from the base tokens only. Font: **Inter Variable** (self-hosted via Fontsource).

UI components live in `src/components/ui/` and were installed from [21st.dev](https://21st.dev) then
adapted (demo data replaced by props, headings/filters/buttons removed). `components.json` holds the
shadcn CLI config; `.mcp.json` points at the 21st.dev MCP server (needs `API_KEY_21ST` in the shell).
Only the navbar, the home-page Lattice Hero (three.js via React Three Fiber, loaded on the home page
only) and the work-page gallery lightbox are hydrated; everything else renders to static HTML.
React is pinned to 19.2 because React Three Fiber's peer range excludes 19.3.

## Media strategy

All media is referenced by `/media/...` paths and is **never** part of the repo or the Docker
image.

- **Local:** drop files in `public/media/...` — `astro dev` serves them at `/media/...`.
- **Production:** put the same tree in `host-media/`. `docker-compose.yml` bind-mounts it to
  `/usr/share/caddy/media` and the `Caddyfile` routes every `/media/*` request there.

If a file is missing the components render a styled "media offline" placeholder rather than a
broken element, so the site stays presentable while media is being produced.

### Producing hero loops and stills

`scripts/hero-media.sh` turns raw Pixel footage into the exact files the art pages expect
(needs `ffmpeg`, `brew install ffmpeg`):

```bash
# hero-loop.mp4 + poster.jpg (first frame of the loop) into public/media/art/<slug>/
scripts/hero-media.sh loop ~/Downloads/PXL_20260920_203000.mp4 geodesic-dome --start 4 --duration 8 --aspect 21:9

# loop whose animation period is not exact: cross-fade the tail into the head
scripts/hero-media.sh loop clip.mp4 comb-jelly --duration 10 --xfade 0.8

# gallery still: resized, EXIF and HDR gain map stripped
scripts/hero-media.sh photo ~/Downloads/PXL_20260920_203100.jpg public/media/art/geodesic-dome/build-1.jpg
```

Shoot video with the Pixel's 10-bit HDR video switched off; `--help` lists every option.

```bash
docker compose build
docker compose up -d     # http://localhost:8080
```

## Authoring with Front Matter CMS

Install the recommended VS Code extensions (`.vscode/extensions.json`). Front Matter reads
`frontmatter.json`, which extends `.frontmatter/config/taxonomy.json` (custom taxonomy +
field groups) and the split config under `.frontmatter/config/` (page folders, content types).

- The public folder is set to `public`, so image/file pickers resolve to `public/media/...`
  and write `/media/...` paths — matching what Caddy serves in production.
- Pasted images land in `public/media`.
- Art entries get `title`, `category` (taxonomy), `year`, hero video/poster, `specs`
  (nested fields), a `gallery` block and sort/draft flags. Music entries take the raw
  SoundCloud embed `<iframe>` string; the `SoundCloudPlayer` component validates it and
  re-renders it with the Neon Cyan player colour.

3D design sections are authored as 2D renders inside the MDX body using `<Gallery />` — there
is no binary model field.
