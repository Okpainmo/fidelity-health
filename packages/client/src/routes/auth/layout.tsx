import { Link, Navigate, Outlet, useSearchParams } from 'react-router';
import Brand from '@/components/Brand';
import { useAppSelector } from '@/rtk-base/hooks';
import { safeNextPath } from '@/utils/safeNextPath';

const footerLinks = [
  { to: '/about', label: 'About' },
  { to: '/legal/terms-of-use', label: 'Terms of Use' },
  { to: '/legal/privacy-policy', label: 'Privacy Policy' },
];

// Layout for /login and /signup. Signed-in users skip straight to the app.
export default function AuthLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    return <Navigate to={safeNextPath(searchParams.get('next')) ?? '/'} replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center px-5 py-4">
        <Link to="/about" aria-label="About Fidelity Health">
          <Brand />
        </Link>
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 pb-24">
        <Outlet />
      </main>
      <footer className="flex flex-wrap justify-center gap-x-1 gap-y-2 px-4 pb-6 text-xs text-ink-faint">
        {footerLinks.map((link, index) => (
          <span key={link.to} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden="true">·</span> : null}
            <Link to={link.to} className="px-1 transition hover:text-ink-soft">
              {link.label}
            </Link>
          </span>
        ))}
      </footer>
    </div>
  );
}
