import { useState } from 'react';
import type { FormEvent } from 'react';
import { HiOutlineCheckCircle, HiOutlineChevronRight, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Link, Navigate } from 'react-router';
import PageTitle from '@/components/PageTitle';
import SectionNav from '@/components/SectionNav';
import VerificationNotice from '@/components/VerificationNotice';
import { recordTypeLabel } from '@/data/records';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { selectAccountType } from '@/rtk-base/slices/authSlice';
import { createRecord } from '@/rtk-base/slices/recordsSlice';
import type { PatientMatch, RecordDetail } from '@/rtk-base/slices/recordsSlice';
import { useActiveSection } from '@/utils/useActiveSection';
import { useHospitalVerification } from '@/utils/useHospitalVerification';
import { buildRecordPayload } from './buildRecordPayload';
import { UPLOAD_SECTIONS } from './constants';
import { AttachmentsSection, ConsentSection } from './sections/AttachmentsConsentSections';
import type { Attachment } from './sections/AttachmentsConsentSections';
import { PatientPickerSection } from './sections/PatientPickerSection';
import { EncounterSection, VitalsSection } from './sections/RecordSections';
import { SubmissionSection } from './sections/SubmissionSection';

const SECTION_IDS = UPLOAD_SECTIONS.map((section) => section.id);

function SuccessView({ record, onReset }: { record: RecordDetail; onReset: () => void }) {
  const rows = [
    { label: 'Reference', value: record.reference },
    { label: 'Patient', value: record.patient.name },
    { label: 'Fidelity Health ID', value: record.patient.fhId },
    { label: 'Record type', value: recordTypeLabel(record.recordType) },
    { label: 'Hospital', value: record.hospital.name },
    { label: 'Attachments', value: `${record.attachments.length} ${record.attachments.length === 1 ? 'file' : 'files'}` },
  ];

  return (
    <div className="mx-auto w-full max-w-xl px-5 pt-16 pb-24 text-center">
      <PageTitle title="Record submitted" />
      <HiOutlineCheckCircle className="mx-auto size-14 text-accent" aria-hidden="true" />
      <h1 className="poppins mt-5 text-[30px] leading-tight font-medium tracking-tight">Record submitted</h1>
      <p className="mt-3 text-[16px] leading-7 text-ink-soft">
        It&apos;s waiting for your records team to verify it. Once verified, it appears in the patient&apos;s history.
      </p>

      <dl className="mt-8 divide-y divide-line rounded-2xl border border-line text-left">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
            <dt className="text-ink-soft">{row.label}</dt>
            <dd className="text-right font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/records/${record.id}`} className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover">
          Review the record
        </Link>
        <button type="button" onClick={onReset} className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
          Upload another
        </button>
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-faint">
      <Link to="/" className="hover:text-foreground">
        Home
      </Link>
      <HiOutlineChevronRight className="size-3.5" aria-hidden="true" />
      <Link to="/records" className="hover:text-foreground">
        Patient records
      </Link>
      <HiOutlineChevronRight className="size-3.5" aria-hidden="true" />
      <span className="text-foreground" aria-current="page">
        Upload record
      </span>
    </nav>
  );
}

export default function UploadRecordPage() {
  const dispatch = useAppDispatch();
  const [formKey, setFormKey] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [problemCount, setProblemCount] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [patient, setPatient] = useState<PatientMatch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<RecordDetail | null>(null);
  const active = useActiveSection(SECTION_IDS, formKey);
  const accountType = useAppSelector(selectAccountType);
  const verification = useHospitalVerification();
  const verificationNote = useAppSelector((state) => state.profile.data?.verificationNote);

  // Only hospital accounts upload records.
  if (accountType !== 'hospital') return <Navigate to="/records" replace />;

  function reset() {
    setResult(null);
    setAttempted(false);
    setProblemCount(0);
    setAttachments([]);
    setPatient(null);
    setSubmitError(null);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    setAttempted(true);
    setSubmitError(null);

    const invalid = Array.from(form.querySelectorAll<HTMLElement>(':invalid')).filter((el) => el.tagName !== 'FIELDSET');
    const missingFiles = attachments.length === 0;
    const missingPatient = patient === null;
    const count = invalid.length + (missingFiles ? 1 : 0) + (missingPatient ? 1 : 0);
    setProblemCount(count);

    if (count > 0 || !patient) {
      // Go to the first problem in page order: the patient section comes before most fields.
      const patientSection = document.getElementById('patient');
      const firstField = invalid[0];
      const first =
        missingPatient && patientSection && (!firstField || patientSection.compareDocumentPosition(firstField) & Node.DOCUMENT_POSITION_FOLLOWING)
          ? patientSection
          : (firstField ?? document.getElementById('attachments'));
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (first instanceof HTMLInputElement || first instanceof HTMLSelectElement || first instanceof HTMLTextAreaElement) {
        first.focus({ preventScroll: true });
      }
      return;
    }

    setSubmitting(true);
    const outcome = await dispatch(
      createRecord({ data: buildRecordPayload(form, patient.fhId, attachments), files: attachments.map((item) => item.file) }),
    );
    setSubmitting(false);

    if (createRecord.fulfilled.match(outcome)) {
      setResult(outcome.payload);
      window.scrollTo({ top: 0 });
    } else {
      setSubmitError(outcome.payload ?? 'Could not submit this record.');
    }
  }

  if (result) return <SuccessView record={result} onReset={reset} />;

  // Unverified institutions can't add records yet.
  if (verification !== 'verified') {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-20 sm:pt-10">
        <PageTitle title="Upload record" />
        <Breadcrumb />
        <h1 className="poppins mt-5 text-[32px] leading-tight font-medium tracking-tight sm:text-[38px]">Upload patient record</h1>
        <div className="mt-6">
          {verification === null ? (
            <div className="h-24 animate-pulse rounded-2xl bg-muted" aria-busy="true" aria-label="Checking your institution" />
          ) : (
            <VerificationNotice status={verification} note={typeof verificationNote === 'string' ? verificationNote : null} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-8 sm:pt-10">
      <PageTitle title="Upload record" />
      <Breadcrumb />

      <header className="mt-5 max-w-2xl">
        <h1 className="poppins text-[32px] leading-tight font-medium tracking-tight sm:text-[38px]">Upload patient record</h1>
        <p className="mt-3 text-[16px] leading-7 text-ink-soft">
          Choose the registered patient, describe the visit and attach the documents. Fields marked <span className="text-danger">*</span> are required.
          Submitted records are verified by your records team before they appear in the patient&apos;s history.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <SectionNav sections={UPLOAD_SECTIONS} active={active} label="Form sections" numbered />

        <form
          key={formKey}
          noValidate
          onSubmit={onSubmit}
          data-submitted={attempted ? '' : undefined}
          className="group/form grid min-w-0 gap-6"
          aria-describedby={problemCount > 0 ? 'form-problems' : undefined}
        >
          {attempted && problemCount > 0 ? (
            <div id="form-problems" role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-red-50 px-5 py-4 text-sm text-danger">
              <HiOutlineExclamationTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>
                <strong className="font-semibold">
                  {problemCount} {problemCount === 1 ? 'field needs' : 'fields need'} attention.
                </strong>{' '}
                Missing or invalid fields are outlined in red.
              </p>
            </div>
          ) : null}

          <SubmissionSection />
          <PatientPickerSection selected={patient} onSelect={setPatient} missing={attempted && patient === null} />
          <EncounterSection />
          <VitalsSection />
          <AttachmentsSection attachments={attachments} onChange={setAttachments} missing={attempted && attachments.length === 0} />
          <ConsentSection />

          {/* Actions */}
          <div className="sticky bottom-0 z-10 -mx-5 mt-2 border-t border-line bg-white/95 px-5 py-4 backdrop-blur sm:mx-0 sm:rounded-t-2xl sm:border-x">
            {submitError ? (
              <p role="alert" className="mb-3 flex items-start gap-2 text-sm text-danger">
                <HiOutlineExclamationTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {submitError}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-faint">
                {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
              </p>
              <div className="flex gap-3">
                <Link to="/records" className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Uploading…' : 'Submit record'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
