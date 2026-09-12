/**
 * Footer16 — adapted from 21st.dev "Simple Centered Footer" (@ln-dev7).
 * One row of external links and a copyright line. Logo, second nav row and
 * social icon buttons from the original were removed.
 */
export interface FooterLink {
  label: string;
  href: string;
}

export default function Footer16({ name, links }: { name: string; links: FooterLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col items-center gap-6">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Elsewhere">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="me noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-center text-xs text-muted-foreground">
            &copy; {year} {name}
          </p>
        </div>
      </div>
    </footer>
  );
}
