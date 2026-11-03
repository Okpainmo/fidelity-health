import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';

type AuthShellProps = {
  // Browser tab title, e.g. "Log in".
  pageTitle: string;
  title: string;
  description?: string;
  fields: ReactNode;
  submitLabel: string;
  submitting: boolean;
  errorMessage?: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  switchPrompt: string;
  switchLinkLabel: string;
  switchHref: string;
  // Small print under the submit button (e.g. terms on sign-up).
  notice?: ReactNode;
  // Extra line under the switch link, e.g. "Registering a hospital? …".
  secondaryLink?: { prompt: string; label: string; href: string };
};

// Shared frame for the login and signup forms.
export default function AuthShell({
  pageTitle,
  title,
  description,
  fields,
  submitLabel,
  submitting,
  errorMessage,
  onSubmit,
  switchPrompt,
  switchLinkLabel,
  switchHref,
  notice,
  secondaryLink,
}: AuthShellProps) {
  return (
    <div className="w-full max-w-[360px]">
      <PageTitle title={pageTitle} />
      <h1 className="poppins text-center text-[28px] font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? <p className="mt-2 text-center text-[15px] text-ink-soft">{description}</p> : null}

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        {fields}

        {errorMessage ? (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-[52px] rounded-full bg-accent text-[15px] font-medium text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Please wait…' : submitLabel}
        </button>

        {notice ? <p className="text-center text-xs leading-5 text-ink-faint">{notice}</p> : null}
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {switchPrompt}{' '}
        <Link to={switchHref} className="font-medium text-accent underline-offset-4 hover:underline">
          {switchLinkLabel}
        </Link>
      </p>
      {secondaryLink ? (
        <p className="mt-2 text-center text-sm text-ink-soft">
          {secondaryLink.prompt}{' '}
          <Link to={secondaryLink.href} className="font-medium text-accent underline-offset-4 hover:underline">
            {secondaryLink.label}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
