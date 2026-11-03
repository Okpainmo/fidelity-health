import { Outlet, ScrollRestoration } from 'react-router';

// Root of every route: starts each new page at the top and restores the
// scroll position on back/forward.
export default function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
