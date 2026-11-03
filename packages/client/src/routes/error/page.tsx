import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import StatusScreen from '@/components/StatusScreen';

// Shown when a page crashes, instead of React Router's developer screen.
export default function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <StatusScreen code="404" title="Page not found" description="The page you're looking for doesn't exist or has moved." />;
  }

  if (import.meta.env.DEV) console.error(error);

  return (
    <StatusScreen
      title="Something went wrong"
      description="We hit an unexpected problem loading this page. Try again, and if it keeps happening, come back a little later."
      actions={
        <>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover"
          >
            Try again
          </button>
          <Link to="/" className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
            Go to home
          </Link>
        </>
      }
    />
  );
}
