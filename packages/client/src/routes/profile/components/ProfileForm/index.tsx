import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import SectionNav from '@/components/SectionNav';
import { useActiveSection } from '@/utils/useActiveSection';

type ProfileFormProps = {
  sections: readonly { id: string; title: string }[];
  header: ReactNode;
  // Shown above the sections, e.g. a notice or help card.
  intro?: ReactNode;
  children: ReactNode;
  // Called with the form once it passes validation.
  onSave: (form: HTMLFormElement) => void;
  saving: boolean;
  saveError: string | null;
  saved: boolean;
  // Clears the saved/error message once the user edits again.
  onEdit: () => void;
};

// Frame for both profile pages: header card, section navigation, the form
// sections, and a sticky save bar with validation and save status.
export default function ProfileForm({ sections, header, intro, children, onSave, saving, saveError, saved, onEdit }: ProfileFormProps) {
  const [attempted, setAttempted] = useState(false);
  const [problemCount, setProblemCount] = useState(0);
  const active = useActiveSection(sections.map((section) => section.id));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    const invalid = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(':invalid'));
    setProblemCount(invalid.length);

    if (invalid.length > 0) {
      const first = invalid[0];
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (first instanceof HTMLInputElement || first instanceof HTMLSelectElement || first instanceof HTMLTextAreaElement) first.focus({ preventScroll: true });
      return;
    }

    onSave(event.currentTarget);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:pt-14">
      {header}

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <SectionNav sections={sections} active={active} label="Profile sections" />

        <form
          noValidate
          onSubmit={onSubmit}
          onChange={() => {
            if (saved || saveError) onEdit();
          }}
          data-submitted={attempted ? '' : undefined}
          className="group/form grid min-w-0 gap-6"
        >
          {intro}

          {attempted && problemCount > 0 ? (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-red-50 px-5 py-4 text-sm text-danger">
              <HiOutlineExclamationTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>
                <strong className="font-semibold">
                  {problemCount} {problemCount === 1 ? 'field needs' : 'fields need'} attention.
                </strong>{' '}
                Missing or invalid fields are outlined in red.
              </p>
            </div>
          ) : null}

          {children}

          <div className="sticky bottom-0 z-10 -mx-5 mt-2 border-t border-line bg-white/95 px-5 py-4 backdrop-blur sm:mx-0 sm:rounded-t-2xl sm:border-x">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-sm text-ink-faint" aria-live="polite">
                {saveError ? (
                  <>
                    <HiOutlineExclamationTriangle className="size-5 shrink-0 text-danger" aria-hidden="true" />
                    <span className="text-danger">{saveError}</span>
                  </>
                ) : saved ? (
                  <>
                    <HiOutlineCheckCircle className="size-5 shrink-0 text-accent" aria-hidden="true" />
                    <span className="font-medium text-foreground">Changes saved.</span>
                  </>
                ) : (
                  <>
                    Fields marked <span className="text-danger">*</span> are required.
                  </>
                )}
              </p>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
