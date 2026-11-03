import { useEffect, useId, useState } from 'react';
import { HiOutlineExclamationCircle, HiOutlineExclamationTriangle, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { FormSection } from '@/components/Form';
import HelpPatientsRegister from '@/components/HelpPatientsRegister';
import { useAppDispatch } from '@/rtk-base/hooks';
import { searchPatients } from '@/rtk-base/slices/recordsSlice';
import type { PatientMatch } from '@/rtk-base/slices/recordsSlice';
import { ageFrom, formatDate } from '@/utils/dates';

const SEARCH_DELAY_MS = 300;

function Avatar({ patient, size }: { patient: PatientMatch; size: 'sm' | 'md' }) {
  const classes = size === 'md' ? 'size-12 text-sm' : 'size-10 text-sm';
  const initials = patient.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return patient.photoUrl ? (
    <img src={patient.photoUrl} alt="" className={`${classes} shrink-0 rounded-full object-cover`} />
  ) : (
    <span
      className={`${classes} flex shrink-0 items-center justify-center rounded-full font-semibold ${size === 'md' ? 'bg-accent text-accent-foreground' : 'bg-accent-soft text-accent-ink'}`}
    >
      {initials}
    </span>
  );
}

function SelectedPatientCard({ patient, onChange }: { patient: PatientMatch; onChange: () => void }) {
  const age = patient.dateOfBirth ? ageFrom(patient.dateOfBirth) : null;
  const facts = [
    { label: 'Fidelity Health ID', value: patient.fhId },
    { label: 'Date of birth', value: patient.dateOfBirth ? `${formatDate(patient.dateOfBirth)}${age !== null ? ` (${age})` : ''}` : '—' },
    { label: 'Sex', value: patient.sexAtBirth ?? '—' },
    { label: 'Phone', value: patient.phone ?? '—' },
    { label: 'Blood group', value: patient.bloodGroup ?? '—' },
    { label: 'Genotype', value: patient.genotype ?? '—' },
  ];

  return (
    <div className="rounded-2xl border border-accent/40 bg-accent-soft/40 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar patient={patient} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-foreground">{patient.name}</p>
          <p className="text-sm text-ink-soft">{patient.city ?? 'City not provided'}</p>
        </div>
        <button type="button" onClick={onChange} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
          Change patient
        </button>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-ink-faint">{fact.label}</dt>
            <dd className="mt-0.5 font-medium text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {patient.allergies.length > 0 ? (
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          <HiOutlineExclamationTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Allergies:</strong> {patient.allergies.join(', ')}
          </span>
        </p>
      ) : (
        <p className="mt-5 text-sm text-ink-soft">{patient.noKnownAllergies ? 'No known allergies.' : 'No allergies recorded.'}</p>
      )}
    </div>
  );
}

type PatientPickerSectionProps = {
  selected: PatientMatch | null;
  onSelect: (patient: PatientMatch | null) => void;
  // Shown after a submit attempt with no patient selected.
  missing: boolean;
};

type SearchState = { query: string; status: 'idle' | 'loading' | 'done' | 'error'; results: PatientMatch[]; error?: string };

export function PatientPickerSection({ selected, onSelect, missing }: PatientPickerSectionProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState<SearchState>({ query: '', status: 'idle', results: [] });
  const inputId = useId();
  const trimmed = query.trim();

  // Search the registered patients a moment after typing stops; ignore stale answers.
  useEffect(() => {
    if (trimmed.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearch({ query: trimmed, status: 'loading', results: [] });
      const outcome = await dispatch(searchPatients(trimmed));
      if (cancelled) return;
      if (searchPatients.fulfilled.match(outcome)) setSearch({ query: trimmed, status: 'done', results: outcome.payload });
      else setSearch({ query: trimmed, status: 'error', results: [], error: outcome.payload ?? 'Search failed' });
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dispatch, trimmed]);

  const current = trimmed.length >= 2 && search.query === trimmed ? search : null;

  return (
    <FormSection id="patient" step={2} title="Patient" description="Find the registered patient this record belongs to.">
      {selected ? (
        <SelectedPatientCard patient={selected} onChange={() => onSelect(null)} />
      ) : (
        <>
          <div className="grid gap-1.5">
            <label htmlFor={inputId} className="text-sm font-medium text-foreground">
              Search patients <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input
                id={inputId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, Fidelity Health ID or phone number"
                autoComplete="off"
                aria-describedby={`${inputId}-hint`}
                className={`h-12 w-full rounded-xl border bg-white pr-4 pl-11 text-[15px] placeholder:text-ink-faint ${missing ? 'border-danger' : 'border-line'}`}
              />
            </div>
            <p id={`${inputId}-hint`} className="text-xs text-ink-faint">
              Type at least two characters. Patients find their Fidelity Health ID on their profile.
            </p>
          </div>

          {missing ? (
            <p role="alert" className="flex items-center gap-2 text-sm text-danger">
              <HiOutlineExclamationCircle className="size-4" aria-hidden="true" />
              Select the patient this record belongs to.
            </p>
          ) : null}

          <div aria-live="polite">
            {trimmed.length >= 2 && (!current || current.status === 'loading') ? (
              <p className="px-1 text-sm text-ink-faint">Searching…</p>
            ) : current?.status === 'error' ? (
              <p role="alert" className="text-sm text-danger">
                {current.error}
              </p>
            ) : current?.status === 'done' ? (
              current.results.length > 0 ? (
                <ul className="grid gap-2" aria-label="Matching patients">
                  {current.results.map((patient) => {
                    const age = patient.dateOfBirth ? ageFrom(patient.dateOfBirth) : null;
                    return (
                      <li key={patient.fhId}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(patient);
                            setQuery('');
                          }}
                          className="flex w-full items-center gap-4 rounded-2xl border border-line p-3.5 text-left transition hover:border-accent/50 hover:bg-accent-soft/40"
                        >
                          <Avatar patient={patient} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-foreground">{patient.name}</span>
                            <span className="block truncate text-sm text-ink-soft">
                              {[patient.fhId, [patient.sexAtBirth, age !== null ? String(age) : null].filter(Boolean).join(', '), patient.city].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                          <span className="hidden text-sm font-medium text-accent sm:block">Select</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-ink-soft">No registered patient matches “{trimmed}”.</p>
              )
            ) : null}
          </div>

          <HelpPatientsRegister
            title="Patient not registered yet?"
            body="Every patient needs their own Fidelity Health account before records can be added. Help them sign up on their phone. It takes about a minute, and then you can search for them here."
          />
        </>
      )}
    </FormSection>
  );
}
