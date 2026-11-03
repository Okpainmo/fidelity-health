import { Outlet } from 'react-router';
import PublicFooter from '@/components/PublicFooter';
import PublicHeader from '@/components/PublicHeader';

// Layout for the public about page.
export default function AboutLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
