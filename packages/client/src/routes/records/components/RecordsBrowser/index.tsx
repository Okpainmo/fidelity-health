import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { HiOutlineArrowPath, HiOutlineChevronDown, HiOutlineExclamationTriangle, HiOutlineFolderOpen, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import PageTitle from '@/components/PageTitle';
import RecordRow from '@/components/RecordRow';
import { RECORD_TYPES } from '@/data/records';
import type { RecordTypeValue } from '@/data/records';
import type { RecordStatus, RecordSummary } from '@/rtk-base/slices/recordsSlice';

type RecordsBrowserProps = {
  title: string;
  description: string;
  records: RecordSummary[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  stats: { label: string; value: number }[];
  searchPlaceholder: string;
  // Hospitals see many patients' records; patients see records from many hospitals.
  forHospital: boolean;
  action?: ReactNode;
  emptyState: ReactNode;
};

// Search, filter, sort and list records. Used for the patient's "My records"
// and the hospital's "Patient records".
export default function RecordsBrowser({ title, description, records, loading, error, onRetry, stats, searchPlaceholder, forHospital, action, emptyState }: RecordsBrowserProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<RecordTypeValue | 'all'>('all');
  const [status, setStatus] = useState<'all' | RecordStatus>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // Only offer type filters that actually have records.
  const typesInUse = useMemo(() => RECORD_TYPES.filter((option) => records.some((record) => record.recordType === option.value)), [records]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((record) => type === 'all' || record.recordType === type)
      .filter((record) => status === 'all' || record.status === status)
      .filter((record) => {
        if (!q) return true;
        return [record.title, record.reference, record.clinician, record.department, record.hospital.name, record.patient.name, record.patient.fhId].some((field) =>
          field.toLowerCase().includes(q),
        );
      })
      .sort((a, b) => (sort === 'newest' ? b.encounterDate.localeCompare(a.encounterDate) : a.encounterDate.localeCompare(b.encounterDate)));
  }, [records, query, type, status, sort]);

  function clearFilters() {
    setQuery('');
    setType('all');
    setStatus('all');
  }

  const selectClass = 'h-11 w-full appearance-none rounded-full border border-line bg-white pr-10 pl-4 text-[15px] sm:w-auto';
  const firstLoad = loading && records.length === 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-10 pb-20 sm:pt-14">
      <PageTitle title={title} />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="poppins text-[32px] leading-tight font-medium tracking-tight sm:text-[38px]">{title}</h1>
          <p className="mt-2 text-[16px] leading-7 text-ink-soft">{description}</p>
        </div>
        {action}
      </header>

      <dl className="mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4 sm:px-6">
            <dt className="text-xs text-ink-faint sm:text-sm">{stat.label}</dt>
            <dd className="poppins mt-1 text-2xl font-medium text-accent-ink">{firstLoad ? '–' : stat.value}</dd>
          </div>
        ))}
      </dl>

      {error ? (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-red-50 px-5 py-4 text-sm text-danger">
          <span className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="size-5 shrink-0" aria-hidden="true" />
            {error}
          </span>
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-medium text-foreground ring-1 ring-line hover:bg-muted">
            <HiOutlineArrowPath className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      {firstLoad ? (
        <ul className="mt-8 grid animate-pulse gap-3" aria-busy="true" aria-label="Loading records">
          {[0, 1, 2].map((key) => (
            <li key={key} className="h-[84px] rounded-2xl bg-muted" />
          ))}
        </ul>
      ) : records.length === 0 && !error ? (
        <div className="mt-8">{emptyState}</div>
      ) : records.length > 0 ? (
        <>
          {/* Filters */}
          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search records</span>
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-full border border-line bg-white pr-4 pl-11 text-[15px] placeholder:text-ink-faint"
              />
            </label>
            <label className="relative block">
              <span className="sr-only">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={selectClass}>
                <option value="all">All statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending review</option>
                {forHospital ? <option value="rejected">Rejected</option> : null}
              </select>
              <HiOutlineChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            </label>
            <label className="relative block">
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectClass}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <HiOutlineChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            </label>
          </div>

          <fieldset className="scrollbar-thin -mx-5 mt-3 flex min-w-0 gap-2 overflow-x-auto border-0 px-5 pb-1">
            <legend className="sr-only">Filter by record type</legend>
            {[{ value: 'all' as const, label: 'All' }, ...typesInUse].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={type === option.value}
                onClick={() => setType(option.value)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
                  type === option.value ? 'border-accent bg-accent text-accent-foreground' : 'border-line text-ink-soft hover:bg-accent-soft hover:text-accent-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </fieldset>

          <p className="mt-6 text-sm text-ink-faint" aria-live="polite">
            {visible.length} {visible.length === 1 ? 'record' : 'records'}
          </p>
          {visible.length > 0 ? (
            <ul className="mt-3 grid gap-3">
              {visible.map((record) => (
                <RecordRow key={record.id} record={record} showPatient={forHospital} showHospital={!forHospital} />
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
              <HiOutlineFolderOpen className="mx-auto size-7 text-ink-faint" aria-hidden="true" />
              <p className="mt-3 font-medium text-foreground">No records match</p>
              <p className="mt-1 text-sm text-ink-soft">Try a different search or filter.</p>
              <button type="button" onClick={clearFilters} className="mt-5 rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                Clear filters
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
