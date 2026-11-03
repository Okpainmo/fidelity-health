import { Link, NavLink } from 'react-router';
import Brand from '@/components/Brand';
import { useAppSelector } from '@/rtk-base/hooks';

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/legal', label: 'Legal' },
];

// Header for public pages (about, legal). Pages using it must give their
// main content `id="main"` for the skip link.
export default function PublicHeader() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <header className="sticky top-0 z-20 border-b border-transparent bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <a
        href="#main"
        className="sr-only rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-5 py-3.5">
        <Link to={isAuthenticated ? '/' : '/about'} aria-label="Fidelity Health home" className="mr-auto">
          <Brand />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm transition ${isActive ? 'font-medium text-accent-ink' : 'text-ink-soft hover:text-foreground'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {isAuthenticated ? (
          <Link to="/" className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover">
            Go to app
          </Link>
        ) : (
          <>
            <Link to="/login" className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              Log in
            </Link>
            <Link to="/signup" className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
