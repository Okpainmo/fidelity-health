import { useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBuildingOffice2,
  HiOutlineChevronRight,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlinePhoto,
} from 'react-icons/hi2';
import { Link, useParams } from 'react-router';
import PageTitle from '@/components/PageTitle';
import { TYPE_ICONS } from '@/components/RecordRow';
import StatusBadge from '@/components/StatusBadge';
import { recordTypeLabel } from '@/data/records';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchRecord } from '@/rtk-base/slices/recordsSlice';
import type { RecordDetail, RecordView } from '@/rtk-base/slices/recordsSlice';
import { ageFrom, formatDate } from '@/utils/dates';
import RecordReviewPanel from './components/RecordReviewPanel';

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Card({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={`rounded-3xl border border-line bg-white p-5 sm:p-6 ${className}`}>
      <h2 className="text-sm font-semibold tracking-wide text-ink-faint uppercase">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Label/value pairs; empty values are skipped.
function Facts({ items, cols = 2 }: { items: { label: string; value: ReactNode }[]; cols?: 2 | 3 }) {
  const shown = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== '');
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

function Prose({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="text-sm text-ink-faint">{label}</h3>
      <p className="mt-1 text-[15px] leading-7 whitespace-pre-wrap text-foreground">{text}</p>
    </div>
  );
}

function PatientCard({ record }: { record: RecordDetail }) {
  const { patient } = record;
  const age = patient.dateOfBirth ? ageFrom(patient.dateOfBirth) : null;
  const initials = patient.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card title="Patient">
      <div className="flex items-center gap-4">
        {patient.photoUrl ? (
          <img src={patient.photoUrl} alt="" className="size-14 rounded-full object-cover" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">{initials}</span>
        )}
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold text-foreground">{patient.name}</p>
          <p className="text-sm text-accent-ink tabular-nums">{patient.fhId}</p>
        </div>
      </div>
      <div className="mt-5">
        <Facts
          items={[
            { label: 'Date of birth', value: patient.dateOfBirth ? `${formatDate(patient.dateOfBirth)}${age !== null ? ` (${age})` : ''}` : null },
            { label: 'Sex at birth', value: patient.sexAtBirth },
            { label: 'Phone', value: patient.phone },
            { label: 'Blood group', value: patient.bloodGroup },
            { label: 'Genotype', value: patient.genotype },
          ]}
        />
      </div>
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
    </Card>
  );
}

function HospitalCard({ record }: { record: RecordDetail }) {
  const { hospital } = record;
  return (
    <Card title="Hospital">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft">
          <HiOutlineBuildingOffice2 className="size-5 text-accent" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{hospital.name}</p>
          <p className="text-sm text-ink-soft">{hospital.city}</p>
        </div>
      </div>
      <div className="mt-4">
        <Facts
          items={[
            { label: 'Phone', value: hospital.phone },
            { label: 'Email', value: hospital.contactEmail },
          ]}
        />
      </div>
    </Card>
  );
}

function Vitals({ vitals }: { vitals: RecordDetail['vitals'] }) {
  const { bpSystolic, bpDiastolic, pulse, temperatureC, spo2, respRate, heightCm, weightKg } = vitals;
  const bmi = heightCm && weightKg ? weightKg / (heightCm / 100) ** 2 : null;
  const items = [
    { label: 'Blood pressure', value: bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}`: null, unit: 'mmHg' },
    { label: 'Pulse', value: pulse, unit: 'bpm' },
    { label: 'Temperature', value: temperatureC, unit: '°C' },
    { label: 'SpO₂', value: spo2, unit: '%' },
    { label: 'Respiratory rate', value: respRate, unit: '/min' },
    { label: 'Height', value: heightCm, unit: 'cm' },
    { label: 'Weight', value: weightKg, unit: 'kg' },
    { label: 'BMI', value: bmi ? bmi.toFixed(1) : null, unit: '' },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (items.length === 0) return null;
  return (
    <Card title="Vitals">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-muted px-4 py-3">
            <dt className="text-xs text-ink-faint">{item.label}</dt>
            <dd className="poppins mt-1 text-lg font-medium text-foreground">
              {item.value}
              {item.unit ? <span className="ml-1 text-xs font-normal text-ink-soft">{item.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Attachments({ attachments }: { attachments: RecordDetail['attachments'] }) {
  return (
    <Card title={`Attachments (${attachments.length})`}>
      {attachments.length === 0 ? (
        <p className="text-sm text-ink-soft">No files attached.</p>
      ) : (
        <ul className="grid gap-2">
          {attachments.map((file) => {
            const Icon = file.contentType.startsWith('image/') ? HiOutlinePhoto : HiOutlineDocumentText;
            return (
              <li key={file.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted px-4 py-3 sm:flex-nowrap">
                <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{file.fileName}</span>
                  <span className="block text-xs text-ink-faint">
                    {file.category} · {formatSize(file.sizeBytes)}
                  </span>
                </span>
                {file.url && file.downloadUrl ? (
                  <span className="flex gap-1.5">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-line hover:bg-accent-soft"
                    >
                      <HiOutlineArrowTopRightOnSquare className="size-3.5" aria-hidden="true" />
                      Open
                    </a>
                    <a
                      href={file.downloadUrl}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-line hover:bg-accent-soft"
                    >
                      <HiOutlineArrowDownTray className="size-3.5" aria-hidden="true" />
                      Download
                    </a>
                  </span>
                ) : (
                  <span className="text-xs text-ink-faint">File storage unavailable</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {attachments.some((file) => file.url) ? <p className="mt-3 text-xs text-ink-faint">Links expire after 10 minutes; reload the page for fresh ones.</p> : null}
    </Card>
  );
}

function RecordBody({ record, view }: { record: RecordDetail; view: RecordView }) {
  const Icon = TYPE_ICONS[record.recordType];
  const staff = view !== 'patient';

  return (
    <>
      <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft">
          <Icon className="size-7 text-accent" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={record.status} />
            <span className="text-sm text-ink-faint tabular-nums">{record.reference}</span>
          </div>
          <h1 className="poppins mt-2 text-[28px] leading-tight font-medium tracking-tight sm:text-[34px]">{record.title}</h1>
          <p className="mt-2 text-ink-soft">
            {recordTypeLabel(record.recordType)} · {record.department} · {formatDate(record.encounterDate)}
          </p>
        </div>
      </header>

      {view === 'patient' && record.status === 'pending' ? (
        <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          This record is waiting for the hospital&apos;s records team to verify it.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 content-start gap-6">
          {view === 'hospital' ? <RecordReviewPanel record={record} /> : null}

          <Card title="Record details">
            <Facts
              items={[
                { label: 'Date of visit / service', value: formatDate(record.encounterDate) },
                { label: 'Attending clinician', value: record.clinicianLicence ? `${record.clinician} (licence ${record.clinicianLicence})` : record.clinician },
                { label: 'Diagnosis', value: record.diagnosis ? `${record.diagnosis}${record.icd10 ? ` (${record.icd10})` : ''}` : record.icd10 },
                {
                  label: 'Follow-up',
                  value: record.followUpDate ? `${formatDate(record.followUpDate)}${record.followUpNotes ? ` — ${record.followUpNotes}` : ''}` : record.followUpNotes,
                },
              ]}
            />
            <div className="mt-6 grid gap-5">
              <Prose label="Reason for visit" text={record.reason} />
              <Prose label="Clinical notes" text={record.notes} />
              <Prose label="Medications prescribed" text={record.prescribed} />
              <Prose label="New allergies identified" text={record.newAllergies} />
            </div>
          </Card>

          <Vitals vitals={record.vitals} />
          <Attachments attachments={record.attachments} />

          <Card title="Submission and consent">
            <Facts
              cols={3}
              items={[
                { label: 'Submitted by', value: record.officerName },
                { label: 'Staff ID', value: staff ? record.officerStaffId : null },
                { label: 'Submitted on', value: formatDate(record.submittedOn) },
                { label: 'Consent', value: record.consentMethod },
                { label: 'Visible to patient', value: staff ? (record.visibleToPatient ? 'Yes' : 'No') : null },
                { label: 'Signed', value: staff && record.signature ? `${record.signature}, ${formatDate(record.signedOn)}` : null },
              ]}
            />
          </Card>
        </div>

        <aside className="grid content-start gap-6">
          {staff ? <PatientCard record={record} /> : null}
          <HospitalCard record={record} />
        </aside>
      </div>
    </>
  );
}

// /records/:recordId - one record, for its patient, its hospital or an admin.
export default function RecordDetailPage() {
  const { recordId = '' } = useParams();
  const dispatch = useAppDispatch();
  const entry = useAppSelector((state) => state.records.details[recordId]);
  const { isLoadingDetail, detailError } = useAppSelector((state) => state.records);

  // Always refetch: attachment links are short-lived.
  useEffect(() => {
    if (recordId) dispatch(fetchRecord(recordId));
  }, [dispatch, recordId]);

  const backTo = entry?.view === 'admin' ? { href: '/admin/records', label: 'All records' } : { href: '/records', label: 'Records' };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-20 sm:pt-10">
      <PageTitle title={entry?.record.title ?? 'Record'} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-faint">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <HiOutlineChevronRight className="size-3.5" aria-hidden="true" />
        <Link to={backTo.href} className="hover:text-foreground">
          {backTo.label}
        </Link>
        <HiOutlineChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-foreground" aria-current="page">
          {entry?.record.reference ?? 'Record'}
        </span>
      </nav>

      {entry ? (
        <RecordBody record={entry.record} view={entry.view} />
      ) : isLoadingDetail ? (
        <div className="mt-8 grid animate-pulse gap-6" aria-busy="true" aria-label="Loading record">
          <div className="h-24 rounded-3xl bg-muted" />
          <div className="h-64 rounded-3xl bg-muted" />
        </div>
      ) : (
        <div className="mx-auto mt-16 max-w-md text-center">
          <HiOutlineExclamationTriangle className="mx-auto size-10 text-danger" aria-hidden="true" />
          <h1 className="poppins mt-4 text-2xl font-medium">Record not available</h1>
          <p className="mt-2 text-ink-soft">{detailError ?? "This record doesn't exist or you don't have access to it."}</p>
          <Link to="/records" className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover">
            Back to records
          </Link>
        </div>
      )}
    </div>
  );
}
