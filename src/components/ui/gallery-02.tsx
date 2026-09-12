/**
 * Gallery02 — adapted from 21st.dev "Gallery Grid with Captions" (@ln-dev7).
 * Each tile is a link with an image and a caption underneath. The section
 * heading and gradient placeholders from the original were removed.
 */
export interface GalleryItem {
  href: string;
  image: string;
  caption: string;
  sub?: string;
}

export default function Gallery02({ items }: { items: GalleryItem[] }) {
  return (
    <section className="pb-20 pt-6 sm:pb-28 sm:pt-10">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <a key={item.href} href={item.href} className="group flex flex-col gap-3">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted transition-transform duration-300 group-hover:scale-[1.01]">
                <img src={item.image} alt="" className="h-full w-full object-cover" decoding="async" />
              </div>
              <figcaption className="px-1">
                <p className="text-sm font-medium text-foreground">{item.caption}</p>
                {item.sub && <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>}
              </figcaption>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
