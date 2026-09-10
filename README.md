# Dashiell Badcock — Portfolio

Personal portfolio website. Built with **Astro 7**, **Tailwind CSS 4**, **MDX** and **TypeScript**, served in
production by **Caddy 2** with heavy media mounted from the host.

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
  components/      Header, Footer, VideoPlayer, Gallery, SoundCloudPlayer, SpecsTable, WorkCard
  content/
    config.ts      Content collection schemas (art, music)
    art/*.mdx      Work pages
    music/*.mdx    Tracks
  layouts/         BaseLayout (fonts, meta, header/footer)
  lib/content.ts   Collection helpers + social links
  pages/           /, /art, /art/[slug], /music, /about, 404
  styles/global.css  Design tokens (Neon Cyan system) + utilities
public/media/      Local-only media (git-ignored, docker-ignored)
host-media/        Production media mount (git-ignored, docker-ignored)
```

## Design system

| Token        | Value     | Use                                            |
| ------------ | --------- | ---------------------------------------------- |
| `void`       | `#0a0a0c` | Page background                                |
| `charcoal`   | `#121216` | Cards, distinct sections                       |
| `neon`       | `#00ffff` | Links, hovers, focus rings, active nav, tags   |
| `silver`     | `#a1a1aa` | Body text                                      |
| `white`      | `#ffffff` | Headings, technical values                     |

Fonts: **Inter Variable** (body) and **JetBrains Mono Variable** (nav, labels, specs, code),
self-hosted via Fontsource. Utilities: `mono-label`, `tag`, `btn-neon`, `btn-ghost`, `bg-grid`.

## Media strategy

All media is referenced by `/media/...` paths and is **never** part of the repo or the Docker
image.

- **Local:** drop files in `public/media/...` — `astro dev` serves them at `/media/...`.
- **Production:** put the same tree in `host-media/`. `docker-compose.yml` bind-mounts it to
  `/usr/share/caddy/media` and the `Caddyfile` routes every `/media/*` request there.

If a file is missing the components render a styled "media offline" placeholder rather than a
broken element, so the site stays presentable while media is being produced.

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
