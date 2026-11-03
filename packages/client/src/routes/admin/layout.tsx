import { HiOutlineArrowLeft, HiOutlineBuildingOffice2, HiOutlineDocumentText, HiOutlineSquares2X2, HiOutlineUsers } from 'react-icons/hi2';
import { Link, Navigate, NavLink, Outlet } from 'react-router';
import Brand from '@/components/Brand';
import UserMenu from '@/components/UserMenu';
import { useAppSelector } from '@/rtk-base/hooks';

const NAV = [
  { to: '/admin', label: 'Overview', icon: HiOutlineSquares2X2, end: true },
  { to: '/admin/hospitals', label: 'Institutions', icon: HiOutlineBuildingOffice2, end: false },
  { to: '/admin/users', label: 'Users', icon: HiOutlineUsers, end: false },
  { to: '/admin/records', label: 'Records', icon: HiOutlineDocumentText, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${
    isActive ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-soft hover:bg-muted hover:text-foreground'
  }`;

// /admin/*: Fidelity Health staff dashboard. Admins only (the server checks too).
export default function AdminLayout() {
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-dvh flex-col bg-sidebar">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <a href="#main" className="sr-only rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30">
          Skip to content
        </a>
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-5 py-3">
          <Link to="/admin" aria-label="Admin overview" className="flex items-center gap-2.5">
            <Brand />
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">Admin</span>
          </Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-muted hover:text-foreground">
            <HiOutlineArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to app</span>
          </Link>
          <UserMenu variant="header" />
        </div>
        <nav aria-label="Admin" className="scrollbar-thin flex gap-1 overflow-x-auto px-4 pb-2.5 lg:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-5 py-8">
        <nav aria-label="Admin" className="hidden w-52 shrink-0 lg:block">
          <ul className="sticky top-24 grid gap-0.5">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={linkClass}>
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
