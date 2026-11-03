import { useState } from 'react';
import { Checkbox, ChoicePills, Field, FieldRow, FormSection, Input, Select, SubHeading } from '@/components/Form';
import { ID_TYPES, MARITAL_STATUSES, PAYMENT_TYPES, RELATIONSHIPS, SEXES, TITLES } from '@/data/records';
import { ageFrom, TODAY } from '@/utils/dates';
import ProfilePhotoField from '../components/ProfilePhotoField';
import { bool, str } from '../values';
import type { ProfileValues } from '../values';

// Field `name`s match the server's PatientProfile fields (see ../buildPayload.ts).

export function IdentitySection({ values }: { values: ProfileValues }) {
  const [dob, setDob] = useState(str(values, 'dateOfBirth'));
  const age = ageFrom(dob);

  return (
    <FormSection id="identity" title="Personal details" description="As shown on your ID document. Hospitals use these details to find and confirm you.">
      <ProfilePhotoField />

      <FieldRow cols={4}>
        <Field label="Title" htmlFor="title">
          <Select id="title" name="title" options={TITLES} placeholder="Select" defaultValue={str(values, 'title')} />
        </Field>
        <Field label="First name" htmlFor="firstName" required>
          <Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={str(values, 'firstName')} required />
        </Field>
        <Field label="Middle name" htmlFor="middleName">
          <Input id="middleName" name="middleName" autoComplete="additional-name" defaultValue={str(values, 'middleName')} />
        </Field>
        <Field label="Last name" htmlFor="lastName" required>
          <Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={str(values, 'lastName')} required />
        </Field>
      </FieldRow>
      <FieldRow cols={3}>
        <Field label="Date of birth" htmlFor="dateOfBirth" required hint={age !== null ? `Age: ${age}` : undefined}>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" max={TODAY} value={dob} onChange={(e) => setDob(e.target.value)} required />
        </Field>
        <Field label="Marital status" htmlFor="maritalStatus">
          <Select id="maritalStatus" name="maritalStatus" options={MARITAL_STATUSES} defaultValue={str(values, 'maritalStatus')} />
        </Field>
        <Field label="Preferred name" htmlFor="preferredName">
          <Input id="preferredName" name="preferredName" placeholder="Optional" defaultValue={str(values, 'preferredName')} />
        </Field>
      </FieldRow>
      <Field label="Sex at birth" required>
        <ChoicePills name="sexAtBirth" options={SEXES} defaultValue={str(values, 'sexAtBirth')} required />
      </Field>
      <FieldRow cols={3}>
        <Field label="Nationality" htmlFor="nationality" required>
          <Input id="nationality" name="nationality" placeholder="e.g. Nigerian" defaultValue={str(values, 'nationality')} required />
        </Field>
        <Field label="Preferred language" htmlFor="preferredLanguage">
          <Input id="preferredLanguage" name="preferredLanguage" placeholder="e.g. English" defaultValue={str(values, 'preferredLanguage')} />
        </Field>
        <Field label="Occupation" htmlFor="occupation">
          <Input id="occupation" name="occupation" defaultValue={str(values, 'occupation')} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="ID type" htmlFor="idType" required>
          <Select id="idType" name="idType" options={ID_TYPES} defaultValue={str(values, 'idType')} required />
        </Field>
        <Field label="ID number" htmlFor="idNumber" required>
          <Input id="idNumber" name="idNumber" defaultValue={str(values, 'idNumber')} required />
        </Field>
      </FieldRow>
    </FormSection>
  );
}

export function ContactSection({ values }: { values: ProfileValues }) {
  return (
    <FormSection id="contact" title="Contact and address" description="How hospitals and Fidelity Health can reach you.">
      <FieldRow cols={3}>
        <Field label="Phone number" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 801 234 5678" defaultValue={str(values, 'phone')} required />
        </Field>
        <Field label="Alternative phone" htmlFor="altPhone">
          <Input id="altPhone" name="altPhone" type="tel" inputMode="tel" defaultValue={str(values, 'altPhone')} />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail">
          <Input id="contactEmail" name="contactEmail" type="email" autoComplete="email" placeholder="name@example.com" defaultValue={str(values, 'contactEmail')} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Address line 1" htmlFor="address1" required>
          <Input id="address1" name="address1" autoComplete="address-line1" placeholder="House number and street" defaultValue={str(values, 'address1')} required />
        </Field>
        <Field label="Address line 2" htmlFor="address2">
          <Input id="address2" name="address2" autoComplete="address-line2" placeholder="Apartment, estate, landmark" defaultValue={str(values, 'address2')} />
        </Field>
      </FieldRow>
      <FieldRow cols={4}>
        <Field label="City / town" htmlFor="city" required>
          <Input id="city" name="city" autoComplete="address-level2" defaultValue={str(values, 'city')} required />
        </Field>
        <Field label="State / region" htmlFor="region" required>
          <Input id="region" name="region" autoComplete="address-level1" defaultValue={str(values, 'region')} required />
        </Field>
        <Field label="Postal code" htmlFor="postalCode">
          <Input id="postalCode" name="postalCode" autoComplete="postal-code" defaultValue={str(values, 'postalCode')} />
        </Field>
        <Field label="Country" htmlFor="country" required>
          <Input id="country" name="country" autoComplete="country-name" defaultValue={str(values, 'country') || 'Nigeria'} required />
        </Field>
      </FieldRow>
    </FormSection>
  );
}

export function NextOfKinSection({ values }: { values: ProfileValues }) {
  const [emergencySame, setEmergencySame] = useState(bool(values, 'emergencySameAsKin', true));

  return (
    <FormSection id="next-of-kin" title="Next of kin and emergency contact" description="Who to contact on your behalf.">
      <FieldRow cols={3}>
        <Field label="Full name" htmlFor="kinName" required>
          <Input id="kinName" name="kinName" defaultValue={str(values, 'kinName')} required />
        </Field>
        <Field label="Relationship" htmlFor="kinRelationship" required>
          <Select id="kinRelationship" name="kinRelationship" options={RELATIONSHIPS} defaultValue={str(values, 'kinRelationship')} required />
        </Field>
        <Field label="Phone number" htmlFor="kinPhone" required>
          <Input id="kinPhone" name="kinPhone" type="tel" inputMode="tel" defaultValue={str(values, 'kinPhone')} required />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Email" htmlFor="kinEmail">
          <Input id="kinEmail" name="kinEmail" type="email" defaultValue={str(values, 'kinEmail')} />
        </Field>
        <Field label="Address" htmlFor="kinAddress">
          <Input id="kinAddress" name="kinAddress" defaultValue={str(values, 'kinAddress')} />
        </Field>
      </FieldRow>

      <Checkbox name="emergencySameAsKin" checked={emergencySame} onChange={(e) => setEmergencySame(e.target.checked)} label="Emergency contact is the same as next of kin" />

      {!emergencySame ? (
        <>
          <SubHeading>Emergency contact</SubHeading>
          <FieldRow cols={3}>
            <Field label="Full name" htmlFor="emergencyName" required>
              <Input id="emergencyName" name="emergencyName" defaultValue={str(values, 'emergencyName')} required />
            </Field>
            <Field label="Relationship" htmlFor="emergencyRelationship" required>
              <Select id="emergencyRelationship" name="emergencyRelationship" options={RELATIONSHIPS} defaultValue={str(values, 'emergencyRelationship')} required />
            </Field>
            <Field label="Phone number" htmlFor="emergencyPhone" required>
              <Input id="emergencyPhone" name="emergencyPhone" type="tel" inputMode="tel" defaultValue={str(values, 'emergencyPhone')} required />
            </Field>
          </FieldRow>
        </>
      ) : null}
    </FormSection>
  );
}

export function InsuranceSection({ values }: { values: ProfileValues }) {
  const [paymentType, setPaymentType] = useState<string>(str(values, 'paymentType'));
  const insured = paymentType !== '' && paymentType !== 'Self-pay';

  return (
    <FormSection id="insurance" title="Insurance and payment" description="How your care is paid for.">
      <Field label="Payment type" required>
        <ChoicePills name="paymentType" options={PAYMENT_TYPES} value={paymentType} onChange={setPaymentType} required />
      </Field>

      {insured ? (
        <>
          <FieldRow cols={3}>
            <Field label="Provider / scheme" htmlFor="insuranceProvider" required>
              <Input id="insuranceProvider" name="insuranceProvider" defaultValue={str(values, 'insuranceProvider')} required />
            </Field>
            <Field label="Policy / member number" htmlFor="policyNumber" required>
              <Input id="policyNumber" name="policyNumber" defaultValue={str(values, 'policyNumber')} required />
            </Field>
            <Field label="Group / plan number" htmlFor="groupNumber">
              <Input id="groupNumber" name="groupNumber" defaultValue={str(values, 'groupNumber')} />
            </Field>
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Policy holder" htmlFor="policyHolder" hint="Leave blank if it's you.">
              <Input id="policyHolder" name="policyHolder" defaultValue={str(values, 'policyHolder')} />
            </Field>
            <Field label="Relationship to holder" htmlFor="holderRelationship">
              <Select id="holderRelationship" name="holderRelationship" options={['Self', ...RELATIONSHIPS]} defaultValue={str(values, 'holderRelationship')} />
            </Field>
            <Field label="Cover expires" htmlFor="policyExpiry">
              <Input id="policyExpiry" name="policyExpiry" type="date" defaultValue={str(values, 'policyExpiry')} />
            </Field>
          </FieldRow>
        </>
      ) : null}
    </FormSection>
  );
}
