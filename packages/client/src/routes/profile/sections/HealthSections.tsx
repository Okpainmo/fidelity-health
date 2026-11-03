import { useState } from 'react';
import { HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2';
import { Checkbox, CheckboxChips, ChoicePills, Field, FieldRow, FormSection, Input, Select, SubHeading, Textarea } from '@/components/Form';
import { ALCOHOL_USE, ALLERGY_SEVERITIES, BLOOD_GROUPS, CHRONIC_CONDITIONS, GENOTYPES, SMOKING_STATUSES } from '@/data/records';
import { bool, list, rows, str } from '../values';
import type { ProfileValues } from '../values';

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'healthy range';
  if (bmi < 30) return 'overweight';
  return 'obese range';
}

export function ClinicalProfileSection({ values }: { values: ProfileValues }) {
  const [height, setHeight] = useState(str(values, 'heightCm'));
  const [weight, setWeight] = useState(str(values, 'weightKg'));
  const h = Number(height) / 100;
  const w = Number(weight);
  const bmi = h > 0 && w > 0 ? w / (h * h) : null;

  return (
    <FormSection id="clinical" title="Health profile" description="Baseline health information that hospitals see when they treat you.">
      <FieldRow cols={4}>
        <Field label="Blood group" htmlFor="bloodGroup" required>
          <Select id="bloodGroup" name="bloodGroup" options={BLOOD_GROUPS} defaultValue={str(values, 'bloodGroup')} required />
        </Field>
        <Field label="Genotype" htmlFor="genotype">
          <Select id="genotype" name="genotype" options={GENOTYPES} defaultValue={str(values, 'genotype')} />
        </Field>
        <Field label="Height (cm)" htmlFor="heightCm">
          <Input id="heightCm" name="heightCm" type="number" inputMode="decimal" min={30} max={250} step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)" htmlFor="weightKg" hint={bmi && bmi > 5 && bmi < 100 ? `BMI ${bmi.toFixed(1)} (${bmiLabel(bmi)})` : undefined}>
          <Input id="weightKg" name="weightKg" type="number" inputMode="decimal" min={0.5} max={400} step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </FieldRow>

      <Field label="Known chronic conditions" hint="Select all that apply.">
        <CheckboxChips name="chronicConditions" options={CHRONIC_CONDITIONS} defaultValues={list(values, 'chronicConditions')} />
      </Field>
      <Field label="Other conditions" htmlFor="otherConditions">
        <Input id="otherConditions" name="otherConditions" placeholder="Anything not listed above" defaultValue={str(values, 'otherConditions')} />
      </Field>

      <FieldRow>
        <Field label="Past surgeries or hospital admissions" htmlFor="pastSurgeries">
          <Textarea id="pastSurgeries" name="pastSurgeries" rows={3} placeholder="Procedure, year and hospital" defaultValue={str(values, 'pastSurgeries')} />
        </Field>
        <Field label="Family medical history" htmlFor="familyHistory">
          <Textarea id="familyHistory" name="familyHistory" rows={3} placeholder="e.g. Father: hypertension" defaultValue={str(values, 'familyHistory')} />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Smoking">
          <ChoicePills name="smoking" options={SMOKING_STATUSES} defaultValue={str(values, 'smoking')} />
        </Field>
        <Field label="Alcohol">
          <ChoicePills name="alcohol" options={ALCOHOL_USE} defaultValue={str(values, 'alcohol')} />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Disability or special needs" htmlFor="disability">
          <Input id="disability" name="disability" placeholder="e.g. wheelchair user, hearing impaired" defaultValue={str(values, 'disability')} />
        </Field>
        <Field label="Pregnancy status" htmlFor="pregnancy" hint="If applicable.">
          <Select id="pregnancy" name="pregnancy" options={['Not pregnant', 'Pregnant', 'Possibly pregnant', 'Not applicable']} defaultValue={str(values, 'pregnancy')} />
        </Field>
      </FieldRow>
    </FormSection>
  );
}

type Row<T> = { id: number; initial: Partial<T> };

// Repeating rows (allergies, medications) with add/remove, seeded from saved
// values (or one empty row).
function useRows<T>(saved: T[]) {
  const [items, setItems] = useState<Row<T>[]>(() =>
    saved.length > 0 ? saved.map((initial, id) => ({ id, initial })) : [{ id: 0, initial: {} }],
  );
  const [nextId, setNextId] = useState(Math.max(saved.length, 1));
  return {
    items,
    add: () => {
      setItems((r) => [...r, { id: nextId, initial: {} }]);
      setNextId((n) => n + 1);
    },
    remove: (id: number) => setItems((r) => r.filter((row) => row.id !== id)),
  };
}

function RemoveRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-faint transition hover:bg-muted hover:text-danger sm:mt-[26px]"
    >
      <HiOutlineXMark className="size-5" aria-hidden="true" />
    </button>
  );
}

function AddRowButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-accent/40 px-4 py-2 text-sm font-medium text-accent-ink transition hover:bg-accent-soft"
    >
      <HiOutlinePlus className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}

type Allergy = { allergen: string; reaction: string | null; severity: string | null };
type Medication = { name: string; dose: string | null; frequency: string | null };

export function AllergiesMedicationsSection({ values }: { values: ProfileValues }) {
  const [noKnownAllergies, setNoKnownAllergies] = useState(bool(values, 'noKnownAllergies', false));
  const allergies = useRows<Allergy>(rows<Allergy>(values, 'allergies'));
  const medications = useRows<Medication>(rows<Medication>(values, 'medications'));

  return (
    <FormSection id="allergies" title="Allergies and medications" description="Shown prominently to hospitals for your safety.">
      <Checkbox
        name="noKnownAllergies"
        checked={noKnownAllergies}
        onChange={(e) => setNoKnownAllergies(e.target.checked)}
        label="No known allergies (NKA)"
        description="Only tick this if you're sure."
      />

      {!noKnownAllergies ? (
        <div className="grid gap-4">
          {allergies.items.map((row, index) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-4 sm:flex-row sm:items-start sm:bg-transparent sm:p-0">
              <div className="grid flex-1 gap-3 sm:grid-cols-[1.2fr_1.2fr_1fr]">
                <Field label={`Allergen ${index + 1}`} htmlFor={`allergen-${row.id}`}>
                  <Input id={`allergen-${row.id}`} name="allergen" placeholder="e.g. Penicillin, peanuts, latex" defaultValue={row.initial.allergen ?? ''} />
                </Field>
                <Field label="Reaction" htmlFor={`reaction-${row.id}`}>
                  <Input id={`reaction-${row.id}`} name="allergyReaction" placeholder="e.g. Rash, swelling" defaultValue={row.initial.reaction ?? ''} />
                </Field>
                <Field label="Severity" htmlFor={`severity-${row.id}`}>
                  <Select id={`severity-${row.id}`} name="allergySeverity" options={ALLERGY_SEVERITIES} defaultValue={row.initial.severity ?? ''} />
                </Field>
              </div>
              {allergies.items.length > 1 ? <RemoveRowButton label={`Remove allergen ${index + 1}`} onClick={() => allergies.remove(row.id)} /> : null}
            </div>
          ))}
          <AddRowButton onClick={allergies.add}>Add allergy</AddRowButton>
        </div>
      ) : null}

      <SubHeading>Current medications</SubHeading>
      <div className="grid gap-4">
        {medications.items.map((row, index) => (
          <div key={row.id} className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-4 sm:flex-row sm:items-start sm:bg-transparent sm:p-0">
            <div className="grid flex-1 gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
              <Field label={`Medication ${index + 1}`} htmlFor={`medication-${row.id}`}>
                <Input id={`medication-${row.id}`} name="medication" placeholder="Name and strength, e.g. Amlodipine 5 mg" defaultValue={row.initial.name ?? ''} />
              </Field>
              <Field label="Dose" htmlFor={`dose-${row.id}`}>
                <Input id={`dose-${row.id}`} name="medicationDose" placeholder="e.g. 1 tablet" defaultValue={row.initial.dose ?? ''} />
              </Field>
              <Field label="Frequency" htmlFor={`frequency-${row.id}`}>
                <Input id={`frequency-${row.id}`} name="medicationFrequency" placeholder="e.g. Once daily" defaultValue={row.initial.frequency ?? ''} />
              </Field>
            </div>
            {medications.items.length > 1 ? <RemoveRowButton label={`Remove medication ${index + 1}`} onClick={() => medications.remove(row.id)} /> : null}
          </div>
        ))}
        <AddRowButton onClick={medications.add}>Add medication</AddRowButton>
      </div>
    </FormSection>
  );
}
