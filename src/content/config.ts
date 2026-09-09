/**
 * Astro Content Collections
 * ------------------------------------------------------------------
 * Astro 5+ looks for `src/content.config.ts`; that file simply re-exports
 * this module so the schema lives here as specified.
 *
 * Media strategy: `heroVideo`, `heroPoster` and gallery images are string
 * paths under `/media/...`. Locally they resolve to `public/media/...`; in
 * production Caddy serves `/media/*` from an external volume mount.
 * No binary 3D model fields are defined — "3D Design" sections use 2D
 * image fallbacks rendered via <Gallery /> inside the MDX body.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const mediaPath = z
  .string()
  .regex(/^\/media\//, 'Media paths must start with /media/ (served from the external media mount)');

const galleryImage = z.object({
  src: mediaPath,
  alt: z.string(),
  caption: z.string().optional(),
});

const art = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/art' }),
  schema: z.object({
    title: z.string(),
    category: z.string(), // e.g. "Kinetic Lighting"
    year: z.number().int().min(1990).max(2100),
    summary: z.string().optional(),
    heroVideo: mediaPath,
    heroPoster: mediaPath,
    specs: z.object({
      dimensions: z.string().optional(),
      controller: z.string().optional(),
      power: z.string().optional(),
      illumination: z.string().optional(),
      materials: z.array(z.string()).default([]),
    }),
    /** Bench / fabrication log images, rendered with <Gallery /> on the work page. */
    gallery: z.array(galleryImage).default([]),
    /** Lower numbers sort first; ties fall back to newest year. */
    order: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});

const music = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/music' }),
  schema: z.object({
    title: z.string(),
    soundcloudUrl: z
      .string()
      .regex(/^https:\/\/(www\.)?soundcloud\.com\//, 'Must be a soundcloud.com URL'),
    /** Raw <iframe> embed code copied from SoundCloud's "Share → Embed" dialog. */
    soundcloudEmbedIframe: z.string(),
    description: z.string(),
    year: z.number().int().optional(),
    order: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { art, music };
