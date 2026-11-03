import { LegalDocument, LegalSection } from '@/routes/legal/components/LegalDocument';

export default function MedicalDisclaimerPage() {
  return (
    <LegalDocument
      slug="medical-disclaimer"
      intro={
        <p className="rounded-2xl border border-line px-5 py-4 text-[16px] leading-7 text-foreground">
          <strong className="font-semibold">In an emergency, don't use Fidelity Health or Missie.</strong> If you think you or someone else is having a medical emergency, call
          your local emergency number or go to the nearest emergency department now.
        </p>
      }
    >
      <LegalSection heading="Fidelity Health stores records; it doesn't provide care">
        <p>
          Fidelity Health keeps medical records from partner hospitals in one protected place. It isn't a healthcare provider, and nothing in the app is
          medical advice, diagnosis or treatment.
        </p>
      </LegalSection>

      <LegalSection heading="Missie is a platform assistant, not a clinician">
        <p>
          Missie helps you use the Fidelity Health platform: finding entries in your record history, understanding who has access, and learning how your data
          is protected. It is not a doctor, nurse, pharmacist or other healthcare professional.
        </p>
      </LegalSection>

      <LegalSection heading="Missie doesn't interpret your records">
        <p>
          Missie can't explain what a diagnosis, test result, scan or prescription means for your health, and it doesn't give medical advice, diagnosis or
          treatment recommendations. For that, speak to your doctor or the hospital that created the record.
        </p>
      </LegalSection>

      <LegalSection heading="Record accuracy">
        <p>
          Medical records on Fidelity Health come from partner hospitals. Missie can't confirm whether a record is clinically correct and can't change it. If
          something in your records looks wrong, contact the hospital that recorded it.
        </p>
      </LegalSection>

      <LegalSection heading="No care relationship">
        <p>Using Fidelity Health or Missie doesn't create a doctor–patient or any other care relationship with Fidelity Health, its partner hospitals, or anyone else.</p>
      </LegalSection>

      <LegalSection heading="AI can be wrong">
        <p>
          Even when Missie answers from Fidelity Health's own material, it can misread a source, leave out something important, or state something incorrect
          with confidence.
        </p>
      </LegalSection>

      <LegalSection heading="Fictional platform">
        <p>
          Fidelity Health and its partner hospitals are fictional. Details Missie gives about them are made up for this demo and don't describe any real
          organisation.
        </p>
      </LegalSection>

      <LegalSection heading="What to do instead">
        <ul>
          <li>Talk to a qualified healthcare professional about any health concern or anything in your records.</li>
          <li>Never ignore professional advice or delay getting care because of something Missie said.</li>
          <li>Don't start, stop or change any treatment or medication based on Missie's answers.</li>
        </ul>
      </LegalSection>
    </LegalDocument>
  );
}
