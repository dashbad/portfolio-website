import { getCollection, type CollectionEntry } from 'astro:content';

export type ArtEntry = CollectionEntry<'art'>;
export type MusicEntry = CollectionEntry<'music'>;

const orderOf = (n: number | undefined) => n ?? Number.MAX_SAFE_INTEGER;

export function sortWorks(a: ArtEntry, b: ArtEntry) {
  const diff = orderOf(a.data.order) - orderOf(b.data.order);
  return diff !== 0 ? diff : b.data.year - a.data.year;
}

export function sortTracks(a: MusicEntry, b: MusicEntry) {
  const diff = orderOf(a.data.order) - orderOf(b.data.order);
  return diff !== 0 ? diff : (b.data.year ?? 0) - (a.data.year ?? 0);
}

export async function getPublishedArt(): Promise<ArtEntry[]> {
  const entries = await getCollection('art', ({ data }) => !data.draft);
  return entries.sort(sortWorks);
}

export async function getPublishedMusic(): Promise<MusicEntry[]> {
  const entries = await getCollection('music', ({ data }) => !data.draft);
  return entries.sort(sortTracks);
}

export const SOCIALS = [
  { label: 'GitHub', handle: 'github.com/dashbad', href: 'https://github.com/dashbad' },
  { label: 'SoundCloud', handle: 'soundcloud.com/dashbad', href: 'https://www.soundcloud.com/dashbad' },
  { label: 'LinkedIn', handle: 'in/dashbadcock', href: 'https://www.linkedin.com/in/dashbadcock/' },
  { label: 'Instagram', handle: '@dashbad', href: 'https://www.instagram.com/dashbad/' },
] as const;
