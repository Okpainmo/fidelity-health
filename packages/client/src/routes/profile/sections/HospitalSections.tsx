import { CheckboxChips, Field, FieldRow, FormSection, Input, Select, SubHeading } from '@/components/Form';
import { DEPARTMENTS, INSTITUTION_TYPES, OWNERSHIP_TYPES } from '@/data/records';
import { list, str } from '../values';
import type { ProfileValues } from '../values';

// Field `name`s match the server's HospitalProfile fields (see ../buildPayload.ts).

const CURRENT_YEAR = new Date().getFullYear();

export function InstitutionSection({ values, institutionName }: { values: ProfileValues; institutionName: string }) {
  return (
    <FormSection id="institution" title="Institution details" description="As registered with your national health regulator.">
      <FieldRow>
        <Field label="Institution name" htmlFor="institutionName" required>
          <Input id="institutionName" name="institutionName" autoComplete="organization" defaultValue={institutionName} required />
        </Field>
        <Field label="Institution type" htmlFor="institutionType" required>
          <Select id="institutionType" name="institutionType" defaultValue={str(values, 'institutionType')} options={INSTITUTION_TYPES} required />
        </Field>
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Ownership" htmlFor="ownership" required>
          <Select id="ownership" name="ownership" defaultValue={str(values, 'ownership')} options={OWNERSHIP_TYPES} required />
        </Field>
        <Field label="Registration / licence number" htmlFor="licenceNumber" required>
          <Input id="licenceNumber" name="licenceNumber" defaultValue={str(values, 'licenceNumber')} placeholder="e.g. HEF-LAG-2014-0381" required />
        </Field>
        <Field label="Licence expiry" htmlFor="licenceExpiry" required>
          <Input id="licenceExpiry" name="licenceExpiry" defaultValue={str(values, 'licenceExpiry')} type="date" required />
        </Field>
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Year established" htmlFor="yearEstablished">
          <Input id="yearEstablished" name="yearEstablished" defaultValue={str(values, 'yearEstablished')} type="number" inputMode="numeric" min={1800} max={CURRENT_YEAR} />
        </Field>
        <Field label="Bed capacity" htmlFor="beds">
          <Input id="beds" name="beds" defaultValue={str(values, 'beds')} type="number" inputMode="numeric" min={0} />
        </Field>
        <Field label="Accreditation" htmlFor="accreditation" hint="Optional, e.g. a national or international accreditation body.">
          <Input id="accreditation" name="accreditation" defaultValue={str(values, 'accreditation')} />
        </Field>
      </FieldRow>
    </FormSection>
  );
}

export function LocationSection({ values }: { values: ProfileValues }) {
  return (
    <FormSection id="location" title="Location and contact" description="Shown to patients when they view records from your institution.">
      <FieldRow>
        <Field label="Address line 1" htmlFor="address1" required>
          <Input id="address1" name="address1" defaultValue={str(values, 'address1')} required />
        </Field>
        <Field label="Address line 2" htmlFor="address2">
          <Input id="address2" name="address2" defaultValue={str(values, 'address2')} />
        </Field>
      </FieldRow>
      <FieldRow cols={4}>
        <Field label="City / town" htmlFor="city" required>
          <Input id="city" name="city" defaultValue={str(values, 'city')} required />
        </Field>
        <Field label="State / region" htmlFor="region" required>
          <Input id="region" name="region" defaultValue={str(values, 'region')} required />
        </Field>
        <Field label="Postal code" htmlFor="postalCode">
          <Input id="postalCode" name="postalCode" defaultValue={str(values, 'postalCode')} />
        </Field>
        <Field label="Country" htmlFor="country" required>
          <Input id="country" name="country" defaultValue={str(values, 'country') || 'Nigeria'} required />
        </Field>
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Main phone" htmlFor="phone" required>
          <Input id="phone" name="phone" defaultValue={str(values, 'phone')} type="tel" inputMode="tel" required />
        </Field>
        <Field label="Emergency line" htmlFor="emergencyPhone">
          <Input id="emergencyPhone" name="emergencyPhone" defaultValue={str(values, 'emergencyPhone')} type="tel" inputMode="tel" />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail" required hint="Shown to patients. Your sign-in email is set separately.">
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={str(values, 'contactEmail')} required />
        </Field>
      </FieldRow>
      <Field label="Website" htmlFor="website" className="sm:max-w-md">
        <Input id="website" name="website" defaultValue={str(values, 'website')} type="url" placeholder="https://" />
      </Field>
    </FormSection>
  );
}

export function ServicesSection({ values }: { values: ProfileValues }) {
  return (
    <FormSection id="services" title="Services and departments" description="Helps patients and Missie understand where records come from.">
      <Field label="Departments" hint="Select all that apply.">
        <CheckboxChips name="departments" options={DEPARTMENTS.filter((department) => department !== 'Other')} defaultValues={list(values, 'departments')} />
      </Field>
      <Field label="Other services" htmlFor="otherServices">
        <Input id="otherServices" name="otherServices" defaultValue={str(values, 'otherServices')} placeholder="e.g. Dialysis unit, fertility clinic" />
      </Field>
      <Field label="Records system in use" htmlFor="emrSystem" hint="The electronic records software your staff use today, if any.">
        <Input id="emrSystem" name="emrSystem" defaultValue={str(values, 'emrSystem')} className="sm:max-w-md" />
      </Field>
    </FormSection>
  );
}

export function ResponsiblePeopleSection({ values }: { values: ProfileValues }) {
  return (
    <FormSection id="people" title="Records and data protection contacts" description="Who Fidelity Health contacts about records, access requests and data protection.">
      <SubHeading>Records administrator</SubHeading>
      <FieldRow cols={4}>
        <Field label="Full name" htmlFor="recordsAdminName" required>
          <Input id="recordsAdminName" name="recordsAdminName" defaultValue={str(values, 'recordsAdminName')} required />
        </Field>
        <Field label="Job title" htmlFor="recordsAdminRole" required>
          <Input id="recordsAdminRole" name="recordsAdminRole" defaultValue={str(values, 'recordsAdminRole')} placeholder="e.g. Head of Health Records" required />
        </Field>
        <Field label="Email" htmlFor="recordsAdminEmail" required>
          <Input id="recordsAdminEmail" name="recordsAdminEmail" defaultValue={str(values, 'recordsAdminEmail')} type="email" required />
        </Field>
        <Field label="Phone" htmlFor="recordsAdminPhone" required>
          <Input id="recordsAdminPhone" name="recordsAdminPhone" defaultValue={str(values, 'recordsAdminPhone')} type="tel" inputMode="tel" required />
        </Field>
      </FieldRow>
      <SubHeading>Data protection officer</SubHeading>
      <FieldRow cols={3}>
        <Field label="Full name" htmlFor="dpoName">
          <Input id="dpoName" name="dpoName" defaultValue={str(values, 'dpoName')} />
        </Field>
        <Field label="Email" htmlFor="dpoEmail">
          <Input id="dpoEmail" name="dpoEmail" defaultValue={str(values, 'dpoEmail')} type="email" />
        </Field>
        <Field label="Phone" htmlFor="dpoPhone">
          <Input id="dpoPhone" name="dpoPhone" defaultValue={str(values, 'dpoPhone')} type="tel" inputMode="tel" />
        </Field>
      </FieldRow>
    </FormSection>
  );
}
