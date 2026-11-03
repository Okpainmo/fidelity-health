import { useState } from 'react';
import { Field, FieldRow, FormSection, Input, Textarea } from '@/components/Form';
import { TODAY } from '@/utils/dates';

export function EncounterSection() {
  return (
    <FormSection id="encounter" step={3} title="Record details" description="The visit, test or procedure this record documents.">
      <FieldRow cols={3}>
        <Field label="Date of visit / service" htmlFor="encounterDate" required>
          <Input id="encounterDate" name="encounterDate" type="date" max={TODAY} required />
        </Field>
        <Field label="Attending clinician" htmlFor="clinician" required>
          <Input id="clinician" name="clinician" placeholder="e.g. Dr. Amara Okafor" required />
        </Field>
        <Field label="Clinician licence number" htmlFor="clinicianLicence">
          <Input id="clinicianLicence" name="clinicianLicence" />
        </Field>
      </FieldRow>
      <Field label="Record title" htmlFor="recordTitle" required hint="A short title the patient will see, e.g. “Chest X-ray (PA view)”.">
        <Input id="recordTitle" name="recordTitle" maxLength={120} required />
      </Field>
      <Field label="Reason for visit / presenting complaint" htmlFor="reason" required>
        <Textarea id="reason" name="reason" rows={2} required />
      </Field>
      <FieldRow>
        <Field label="Diagnosis" htmlFor="diagnosis">
          <Input id="diagnosis" name="diagnosis" placeholder="Primary diagnosis" />
        </Field>
        <Field label="ICD-10 code" htmlFor="icd10" hint="Optional, e.g. J20.9">
          <Input id="icd10" name="icd10" pattern="[A-Za-z][0-9]{2}(\.[0-9A-Za-z]{1,4})?" title="Format like J20 or J20.9" />
        </Field>
      </FieldRow>
      <Field label="Clinical notes / summary" htmlFor="notes" required>
        <Textarea id="notes" name="notes" rows={6} placeholder="Findings, investigations, treatment given and plan" required />
      </Field>
      <FieldRow>
        <Field label="Medications prescribed" htmlFor="prescribed" hint="One per line: name, strength, dose and frequency.">
          <Textarea id="prescribed" name="prescribed" rows={3} placeholder={'Amoxicillin 500 mg, 1 capsule, three times daily for 7 days'} />
        </Field>
        <Field label="New allergies identified" htmlFor="newAllergies" hint="These are added to the patient's allergy list after verification.">
          <Textarea id="newAllergies" name="newAllergies" rows={3} placeholder="Allergen and reaction" />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Follow-up date" htmlFor="followUp">
          <Input id="followUp" name="followUp" type="date" min={TODAY} />
        </Field>
        <Field label="Follow-up instructions" htmlFor="followUpNotes">
          <Input id="followUpNotes" name="followUpNotes" />
        </Field>
      </FieldRow>
    </FormSection>
  );
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'healthy range';
  if (bmi < 30) return 'overweight';
  return 'obese range';
}

export function VitalsSection() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const h = Number(height) / 100;
  const w = Number(weight);
  const bmi = h > 0 && w > 0 ? w / (h * h) : null;

  return (
    <FormSection id="vitals" step={4} title="Vitals" description="Measurements taken at this visit. Leave blank if not recorded.">
      <FieldRow cols={4}>
        <Field label="Blood pressure (mmHg)" htmlFor="bpSystolic">
          <div className="flex items-center gap-2">
            <Input id="bpSystolic" name="bpSystolic" type="number" inputMode="numeric" min={50} max={260} placeholder="120" aria-label="Systolic" />
            <span className="text-ink-faint" aria-hidden="true">
              /
            </span>
            <Input name="bpDiastolic" type="number" inputMode="numeric" min={30} max={160} placeholder="80" aria-label="Diastolic" />
          </div>
        </Field>
        <Field label="Pulse (bpm)" htmlFor="pulse">
          <Input id="pulse" name="pulse" type="number" inputMode="numeric" min={20} max={250} />
        </Field>
        <Field label="Temperature (°C)" htmlFor="temperature">
          <Input id="temperature" name="temperature" type="number" inputMode="decimal" min={30} max={45} step="0.1" />
        </Field>
        <Field label="SpO₂ (%)" htmlFor="spo2">
          <Input id="spo2" name="spo2" type="number" inputMode="numeric" min={50} max={100} />
        </Field>
      </FieldRow>
      <FieldRow cols={4}>
        <Field label="Respiratory rate (/min)" htmlFor="respRate">
          <Input id="respRate" name="respRate" type="number" inputMode="numeric" min={4} max={80} />
        </Field>
        <Field label="Height (cm)" htmlFor="heightCm">
          <Input id="heightCm" name="heightCm" type="number" inputMode="decimal" min={30} max={250} step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)" htmlFor="weightKg" hint={bmi && bmi > 5 && bmi < 100 ? `BMI ${bmi.toFixed(1)} (${bmiLabel(bmi)})` : undefined}>
          <Input id="weightKg" name="weightKg" type="number" inputMode="decimal" min={0.5} max={400} step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </FieldRow>
    </FormSection>
  );
}
