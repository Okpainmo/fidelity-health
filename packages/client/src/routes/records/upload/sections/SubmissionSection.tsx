import { useAppSelector } from '@/rtk-base/hooks';
import { Field, FieldRow, FormSection, Input, Select } from '@/components/Form';
import { DEPARTMENTS, RECORD_TYPES } from '@/data/records';
import { TODAY } from '@/utils/dates';

export function SubmissionSection() {
  // The signed-in hospital account submits records for its own facility.
  const facility = useAppSelector((state) => state.auth.user?.name) ?? '';

  return (
    <FormSection id="submission" step={1} title="Submission details" description="Where this record comes from and who is submitting it.">
      <FieldRow>
        <Field label="Hospital / facility" htmlFor="facility" hint="Records are submitted under your institution's account.">
          <Input id="facility" name="facility" value={facility} readOnly className="bg-muted text-ink-soft" />
        </Field>
        <Field label="Department" htmlFor="department" required>
          <Select id="department" name="department" options={DEPARTMENTS} placeholder="Select department" required />
        </Field>
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Submitting officer" htmlFor="officerName" required>
          <Input id="officerName" name="officerName" autoComplete="name" placeholder="Full name" required />
        </Field>
        <Field label="Staff ID" htmlFor="officerStaffId" required>
          <Input id="officerStaffId" name="officerStaffId" placeholder="e.g. CSH-0421" required />
        </Field>
        <Field label="Date of submission" htmlFor="submittedOn" required>
          <Input id="submittedOn" name="submittedOn" type="date" defaultValue={TODAY} max={TODAY} required />
        </Field>
      </FieldRow>
      <Field label="Record type" htmlFor="recordType" required className="sm:max-w-xs">
        <Select id="recordType" name="recordType" options={RECORD_TYPES} placeholder="Select record type" required />
      </Field>
    </FormSection>
  );
}
