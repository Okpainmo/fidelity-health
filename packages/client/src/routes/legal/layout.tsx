import { NavLink, Outlet } from 'react-router';
import PublicFooter from '@/components/PublicFooter';
import PublicHeader from '@/components/PublicHeader';
import { legalDocuments } from './documents';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition md:rounded-xl md:px-3 md:py-2 ${
    isActive ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-soft hover:bg-muted hover:text-foreground'
  }`;

// Layout for /legal and its documents: page list on the left (a scrolling
// row of pills on small screens), document on the right.
export default function LegalLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 pt-10 pb-24 md:flex-row md:gap-14 md:pt-16">
        <nav aria-label="Legal pages" className="md:w-56 md:shrink-0">
          <ul className="scrollbar-thin -mx-5 flex gap-1 overflow-x-auto px-5 pb-1 md:sticky md:top-24 md:mx-0 md:grid md:overflow-visible md:px-0">
            <li>
              <NavLink to="/legal" end className={linkClass}>
                Overview
              </NavLink>
            </li>
            {legalDocuments.map((doc) => (
              <li key={doc.slug}>
                <NavLink to={`/legal/${doc.slug}`} className={linkClass}>
                  {doc.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="max-w-2xl min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
