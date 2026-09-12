/**
 * GalleryGridBlock — adapted from 21st.dev "Gallery Grid with Lightbox"
 * (@moumensoliman). A grid of images; clicking one opens a lightbox with
 * previous/next navigation and the image caption. The heading, category
 * badges, filter buttons and entrance animations from the original were
 * removed.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

const lightboxButton =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

export function GalleryGridBlock({ images, className }: { images: GalleryImage[]; className?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedIndex = images.findIndex((img) => img.id === selectedId);
  const selected = selectedIndex >= 0 ? images[selectedIndex] : null;

  const step = useCallback(
    (delta: number) => {
      if (selectedIndex < 0 || images.length === 0) return;
      const next = (selectedIndex + delta + images.length) % images.length;
      setSelectedId(images[next].id);
    },
    [images, selectedIndex],
  );

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selected, step]);

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedId(id);
    }
  };

  return (
    <section className={className} aria-label="Gallery">
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {images.map((image) => (
            <div
              key={image.id}
              role="listitem"
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-ring"
              onClick={() => setSelectedId(image.id)}
              onKeyDown={(event) => handleCardKeyDown(event, image.id)}
              tabIndex={0}
              aria-label={`Open image: ${image.caption || image.alt || 'untitled'}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden="true"
                >
                  <ZoomIn className="h-7 w-7 text-white" strokeWidth={1.5} />
                  {image.caption && <span className="px-4 text-center text-sm text-white/80">{image.caption}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setSelectedId(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="gallery-dialog-title"
            >
              <button
                type="button"
                className={`${lightboxButton} absolute right-4 top-4`}
                onClick={() => setSelectedId(null)}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${lightboxButton} absolute left-4 top-1/2 -translate-y-1/2`}
                    onClick={(event) => {
                      event.stopPropagation();
                      step(-1);
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button
                    type="button"
                    className={`${lightboxButton} absolute right-4 top-1/2 -translate-y-1/2`}
                    onClick={(event) => {
                      event.stopPropagation();
                      step(1);
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              )}

              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-[90vh] max-w-5xl flex-col items-center"
              >
                <img
                  key={selected.id}
                  src={selected.url}
                  alt={selected.alt}
                  className="max-h-[78vh] w-auto rounded-lg"
                />
                <p id="gallery-dialog-title" className="mt-4 text-center text-sm text-white/80">
                  {selected.caption || selected.alt}
                  {images.length > 1 && (
                    <span className="ml-3 text-white/50">
                      {selectedIndex + 1} / {images.length}
                    </span>
                  )}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default GalleryGridBlock;
