import type { ReactNode } from 'react';
import { Link } from 'react-router';
import Brand from '@/components/Brand';
import PageTitle from '@/components/PageTitle';

type StatusScreenProps = {
  code?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

// Full-page message used for "not found" and unexpected errors.
export default function StatusScreen({ code, title, description, actions }: StatusScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PageTitle title={title} />
      <header className="px-5 py-4">
        <Link to="/" aria-label="Fidelity Health home" className="inline-flex">
          <Brand />
        </Link>
      </header>
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        {code ? <p className="text-sm font-medium text-ink-faint">{code}</p> : null}
        <h1 className="poppins mt-2 text-[32px] leading-tight font-medium tracking-tight">{title}</h1>
        <p className="mt-3 max-w-md text-[16px] leading-7 text-ink-soft">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {actions ?? (
            <Link to="/" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover">
              Go to home
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
