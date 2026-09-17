/**
 * Hero07 — adapted from 21st.dev "Editorial Image Hero" (@felipemenezes098).
 * Full-width media on top, then title, tagline and description in one
 * left-aligned column. Rendered statically: the motion, text balancer
 * and call-to-action buttons from the original were removed.
 */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface Hero07Props {
  tagline?: string;
  title: string;
  description?: string;
  landscapeImage?: string;
  landscapeAlt?: string;
  /** Custom media (e.g. a video player). Takes precedence over `landscapeImage`. */
  children?: ReactNode;
  variant?: 'standard' | 'compact';
}

const variantStyles = {
  standard: {
    copy: 'pb-16 pt-10 sm:pb-20 sm:pt-12',
    tagline: 'text-sm sm:text-base',
    title: 'text-3xl sm:text-4xl md:text-5xl',
    description: 'text-base sm:text-lg',
    header: 'gap-6 sm:gap-8',
  },
  compact: {
    copy: 'pb-12 pt-8 sm:pb-16 sm:pt-10',
    tagline: 'text-sm',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    description: 'text-sm sm:text-base',
    header: 'gap-4 sm:gap-5',
  },
} as const;

export function Hero07({
  tagline,
  title,
  description,
  landscapeImage,
  landscapeAlt = '',
  children,
  variant = 'standard',
}: Readonly<Hero07Props>) {
  const vs = variantStyles[variant];

  const media =
    children ??
    (landscapeImage ? (
      <img
        src={landscapeImage}
        alt={landscapeAlt}
        decoding="async"
        className="aspect-[2/1] w-full rounded-xl border border-border object-cover object-center sm:aspect-[21/9]"
      />
    ) : null);

  return (
    <section className="relative isolate w-full pt-2 sm:pt-4">
      {media && <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">{media}</div>}

      <div className={cn('mx-auto w-full max-w-7xl px-6 sm:px-10', vs.copy)}>
        <div className={cn('flex max-w-3xl flex-col items-start', vs.header)}>
          <h1 className={cn('text-balance font-semibold tracking-tight text-foreground', vs.title)}>{title}</h1>
          {tagline && (
            <p className={cn('-mt-2 leading-relaxed tracking-tight text-muted-foreground', vs.tagline)}>{tagline}</p>
          )}
          {description && (
            <p className={cn('whitespace-pre-line leading-relaxed text-muted-foreground', vs.description)}>
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero07;
