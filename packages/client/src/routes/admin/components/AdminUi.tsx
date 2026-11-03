import type { ReactNode } from 'react';
import { HiOutlineArrowPath, HiOutlineChevronLeft, HiOutlineExclamationTriangle, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Link } from 'react-router';

// Small building blocks shared by the admin pages.

export function AdminHeader({ title, description, back, actions }: { title: string; description?: string; back?: { to: string; label: string }; actions?: ReactNode }) {
  return (
    <header className="mb-6">
      {back ? (
        <Link to={back.to} className="mb-3 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-foreground">
          <HiOutlineChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="poppins text-[28px] leading-tight font-medium tracking-tight sm:text-[32px]">{title}</h1>
          {description ? <p className="mt-1.5 text-[15px] text-ink-soft">{description}</p> : null}
        </div>
        {actions}
      </div>
    </header>
  );
}

export function Panel({ title, children, action, className = '' }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-line bg-white p-5 sm:p-6 ${className}`}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-sm font-semibold tracking-wide text-ink-faint uppercase">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">Search</span>
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-line bg-white pr-4 pl-11 text-[15px] placeholder:text-ink-faint"
      />
    </label>
  );
}

// Pill group for a single-choice filter.
export function FilterPills<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <fieldset className="flex min-w-0 flex-wrap gap-1.5 border-0">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
            value === option.value ? 'border-accent bg-accent text-accent-foreground' : 'border-line bg-white text-ink-soft hover:bg-accent-soft hover:text-accent-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-red-50 px-5 py-4 text-sm text-danger">
      <span className="flex items-center gap-2">
        <HiOutlineExclamationTriangle className="size-5 shrink-0" aria-hidden="true" />
        {message}
      </span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-medium text-foreground ring-1 ring-line hover:bg-muted">
          <HiOutlineArrowPath className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="grid animate-pulse gap-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="h-[72px] rounded-2xl bg-muted" />
      ))}
    </ul>
  );
}

export function EmptyList({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-ink-soft">{children}</p>;
}

// Label/value pairs; empty values are skipped.
export function Facts({ items, cols = 2 }: { items: { label: string; value: ReactNode }[]; cols?: 2 | 3 }) {
  const shown = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== '');
  if (shown.length === 0) return <p className="text-sm text-ink-faint">Nothing added yet.</p>;
  return (
    <dl className={`grid gap-x-6 gap-y-4 text-[15px] ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {shown.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-sm text-ink-faint">{item.label}</dt>
          <dd className="mt-0.5 break-words text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const text = (profile: Record<string, unknown> | null | undefined, key: string): string | null => {
  const value = profile?.[key];
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return null;
};
