import { HiOutlineSparkles } from 'react-icons/hi2';
import { Link, NavLink, Outlet } from 'react-router';
import Brand from '@/components/Brand';
import UserMenu from '@/components/UserMenu';
import { useAppSelector } from '@/rtk-base/hooks';
import { selectAccountType } from '@/rtk-base/slices/authSlice';

// Hospitals manage their patients' records; patients view their own.
// Profile and settings live in the account menu (UserMenu).
const NAV_LINKS = {
  hospital: [
    { to: '/', label: 'Home', end: true },
    { to: '/records', label: 'Patient records', end: true },
    { to: '/records/upload', label: 'Upload record', end: false },
  ],
  patient: [
    { to: '/', label: 'Home', end: true },
    { to: '/records', label: 'My records', end: true },
  ],
} as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition ${
    isActive ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-soft hover:text-foreground'
  }`;

// Layout for the signed-in platform pages (home, records, upload, profile, settings):
// top navigation with the account menu. On small screens the links move to a
// scrollable row under the header.
export default function PlatformShell() {
  const navLinks = NAV_LINKS[useAppSelector(selectAccountType)];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <a
          href="#main"
          className="sr-only rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30"
        >
          Skip to content
        </a>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3">
          <Link to="/" aria-label="Fidelity Health home" className="mr-auto md:mr-4">
            <Brand />
          </Link>

          <nav aria-label="Main" className="mr-auto hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/missie/chat"
            className="flex items-center gap-2 rounded-full bg-missie px-4 py-2 text-sm font-medium text-missie-foreground transition hover:bg-missie-hover"
          >
            <HiOutlineSparkles className="size-4" aria-hidden="true" />
            Ask Missie
          </Link>
          <UserMenu variant="header" />
        </div>

        <nav aria-label="Main" className="scrollbar-thin flex gap-1 overflow-x-auto px-4 pb-2.5 md:hidden">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
