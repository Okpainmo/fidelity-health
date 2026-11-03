import { useState } from 'react';
import { HiOutlineCheck, HiOutlineDocumentDuplicate, HiOutlineUserPlus } from 'react-icons/hi2';

type HelpPatientsRegisterProps = {
  title?: string;
  body?: string;
};

// Every patient must have their own account before a hospital can add their
// records, and Fidelity Health asks hospitals to help them sign up. Shows the
// patient sign-up link with a copy button.
export default function HelpPatientsRegister({
  title = 'Help your patients register',
  body = 'Records can only be added for registered patients. Share the sign-up link at reception or during visits, or help patients sign up on their phone. It takes about a minute.',
}: HelpPatientsRegisterProps) {
  const [copied, setCopied] = useState(false);
  const signupUrl = `${window.location.origin}/signup`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked - the link is still visible to copy by hand.
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-accent-soft/60 p-5 sm:flex-row sm:items-start">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white">
        <HiOutlineUserPlus className="size-5 text-accent" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-ink-soft">{body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="max-w-full truncate rounded-lg bg-white px-3 py-1.5 text-sm text-foreground">{signupUrl}</code>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-white px-3 py-1.5 text-sm font-medium text-accent-ink transition hover:bg-accent-soft"
          >
            {copied ? <HiOutlineCheck className="size-4" aria-hidden="true" /> : <HiOutlineDocumentDuplicate className="size-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
}
