import { useId, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineExclamationCircle, HiOutlinePhoto, HiOutlineXMark } from 'react-icons/hi2';
import { Link } from 'react-router';
import { ATTACHMENT_CATEGORIES, CONSENT_METHODS } from '@/data/records';
import { Checkbox, Field, FieldRow, FormSection, Input, Select } from '@/components/Form';
import { TODAY } from '@/utils/dates';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../constants';

export type Attachment = { id: string; file: File; category: string };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPTED_EXTENSIONS = ACCEPTED_FILE_TYPES.split(',');

type AttachmentsSectionProps = {
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
  // Shown after a submit attempt with no files.
  missing: boolean;
};

export function AttachmentsSection({ attachments, onChange, missing }: AttachmentsSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added: Attachment[] = [];
    const problems: string[] = [];

    for (const file of Array.from(list)) {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!ACCEPTED_EXTENSIONS.includes(ext)) problems.push(`${file.name}: file type not supported`);
      else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) problems.push(`${file.name}: larger than ${MAX_FILE_SIZE_MB} MB`);
      else added.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, category: '' });
    }

    // Skip files that are already in the list.
    const fresh = added.filter((item) => !attachments.some((existing) => existing.id === item.id));
    onChange([...attachments, ...fresh]);
    setRejected(problems);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <FormSection id="attachments" step={5} title="Attachments" description="Scanned documents, reports and images that make up this record.">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? 'border-accent bg-accent-soft/50' : missing ? 'border-danger/60' : 'border-line'
        }`}
      >
        <HiOutlineCloudArrowUp className="size-9 text-accent" aria-hidden="true" />
        <p className="mt-3 text-[15px] font-medium text-foreground">Drag and drop files here</p>
        <p className="mt-1 text-sm text-ink-soft">
          PDF, JPG, PNG, DICOM or Word · up to {MAX_FILE_SIZE_MB} MB each
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover"
        >
          Browse files
        </button>
        <label htmlFor={inputId} className="sr-only">
          Choose files to attach
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {missing && attachments.length === 0 ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-danger">
          <HiOutlineExclamationCircle className="size-4" aria-hidden="true" />
          Attach at least one file.
        </p>
      ) : null}

      {rejected.length > 0 ? (
        <ul role="alert" className="grid gap-1 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger">
          {rejected.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="grid gap-3">
          {attachments.map((item) => {
            const isImage = item.file.type.startsWith('image/');
            const Icon = isImage ? HiOutlinePhoto : HiOutlineDocumentText;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-3 sm:flex-nowrap">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="size-5 text-ink-soft" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{item.file.name}</span>
                  <span className="block text-xs text-ink-faint">{formatSize(item.file.size)}</span>
                </span>
                <div className="w-full sm:w-52">
                  <Select
                    aria-label={`Document type for ${item.file.name}`}
                    options={ATTACHMENT_CATEGORIES}
                    placeholder="Document type"
                    value={item.category}
                    onChange={(e) => onChange(attachments.map((a) => (a.id === item.id ? { ...a, category: e.target.value } : a)))}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onChange(attachments.filter((a) => a.id !== item.id))}
                  aria-label={`Remove ${item.file.name}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-faint transition hover:bg-muted hover:text-danger"
                >
                  <HiOutlineXMark className="size-5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </FormSection>
  );
}

export function ConsentSection() {
  return (
    <FormSection id="consent" step={6} title="Consent and declaration" description="Required before a record can be added to the patient's history.">
      <div className="grid gap-4 rounded-2xl bg-muted px-5 py-4">
        <Checkbox
          name="patientConsent"
          required
          label="The patient (or their legal guardian) has consented to this record being added to their Fidelity Health account."
          description="Consent covers storing the record and making it available to the patient and the hospitals they authorise."
        />
        <Checkbox
          name="shareWithPatient"
          defaultChecked
          label="Make this record visible in the patient's Fidelity Health account"
          description="Untick only if a clinician has asked for the record to be held back for now."
        />
      </div>

      <Field label="How was consent given?" htmlFor="consentMethod" required className="sm:max-w-sm">
        <Select id="consentMethod" name="consentMethod" options={CONSENT_METHODS} required />
      </Field>

      <Checkbox
        name="declaration"
        required
        label="I confirm the information in this form is accurate and complete to the best of my knowledge, and that I'm authorised to submit records for this hospital."
      />

      <FieldRow>
        <Field label="Signature (type your full name)" htmlFor="signature" required>
          <Input id="signature" name="signature" autoComplete="off" required className="font-[cursive] text-lg" />
        </Field>
        <Field label="Date" htmlFor="signedOn" required>
          <Input id="signedOn" name="signedOn" type="date" defaultValue={TODAY} max={TODAY} required />
        </Field>
      </FieldRow>

      <p className="text-xs leading-5 text-ink-faint">
        Records are handled under the{' '}
        <Link to="/legal/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        . Submissions are logged with the officer's name and staff ID.
      </p>
    </FormSection>
  );
}
