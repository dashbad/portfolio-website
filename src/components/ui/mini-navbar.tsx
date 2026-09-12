/**
 * Navbar — adapted from 21st.dev "Mini Navbar" (@aghasisahakyan1).
 * Floating pill header: wordmark left, links right, disclosure menu on mobile.
 * Login/signup buttons and the dot logo from the original were removed.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  name: string;
  links: NavLink[];
  currentPath?: string;
}

const isActive = (href: string, path?: string) =>
  !!path && (path === href || path.startsWith(`${href}/`));

function AnimatedNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className="group relative block h-5 overflow-hidden text-sm leading-5"
    >
      <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span className={active ? 'block h-5 text-foreground' : 'block h-5 text-muted-foreground'}>{children}</span>
        <span className="block h-5 text-foreground" aria-hidden="true">
          {children}
        </span>
      </span>
    </a>
  );
}

export function Navbar({ name, links, currentPath }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={cn(
        'fixed left-1/2 top-4 z-40 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center',
        'border border-border bg-background/80 px-5 py-2.5 backdrop-blur-md sm:w-auto',
        'transition-[border-radius] duration-300',
        isOpen ? 'rounded-2xl' : 'rounded-full',
      )}
    >
      <div className="flex w-full items-center justify-between gap-x-8 sm:gap-x-10">
        <a
          href="/"
          className="text-sm font-medium tracking-tight text-foreground"
          aria-label={`${name} — home`}
        >
          {name}
        </a>

        <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
          {links.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href} active={isActive(link.href, currentPath)}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-muted-foreground sm:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <nav
        className={cn(
          'flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden',
          isOpen ? 'max-h-60 pt-4 opacity-100' : 'pointer-events-none max-h-0 pt-0 opacity-0',
        )}
        aria-label="Primary"
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href, currentPath) ? 'page' : undefined}
            className="w-full py-2 text-center text-base text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
