import { Link } from 'react-router';
import { LegalDocument, LegalSection } from '@/routes/legal/components/LegalDocument';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      slug="privacy-policy"
      intro={
        <p>
          Fidelity Health works with partner hospitals to track, store and protect patients' medical records, and Missie is its AI assistant. This policy
          explains what information the Fidelity Health app (including Missie) collects when you use it, how that information is used, and the choices you
          have. It describes how the app works today and will be updated as features are added.
        </p>
      }
    >
      <LegalSection heading="Please don't share real health information">
        <p>
          Fidelity Health is a demo. Don't enter real medical records, diagnoses, medications, record numbers or other personal health information about yourself or
          anyone else. Use made-up examples instead.
        </p>
      </LegalSection>

      <LegalSection heading="Missie and your medical records">
        <p>
          Missie does <strong>not</strong> currently read, change or store your Fidelity Health medical records. It answers from Fidelity Health's general
          guides and policies. Any future access to your own records will only happen with your explicit permission, and this policy will be updated before it
          is switched on.
        </p>
      </LegalSection>

      <LegalSection heading="Medical records">
        <ul>
          <li>
            <strong>Who adds them:</strong> only partner hospitals that Fidelity Health has verified, and only for registered patients who have consented.
          </li>
          <li>
            <strong>Review:</strong> each record starts as pending until the hospital&apos;s records team verifies or rejects it. Patients see their verified and
            pending records; rejected records are never shown to them.
          </li>
          <li>
            <strong>Who can see a record:</strong> the patient, the hospital that submitted it, and Fidelity Health administrators.
          </li>
          <li>
            <strong>Files:</strong> attachments and profile photos are stored in private cloud storage (Amazon S3). They are never public; each download uses a
            link that expires after a few minutes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Information we collect">
        <ul>
          <li>
            <strong>Account details:</strong> your name (or your institution's name), email address, password and account type (patient or institution) when you sign up. Your password is stored as a one-way hash, not as
            readable text.
          </li>
          <li>
            <strong>Profile details:</strong> what you add to your profile. For patients: personal details, contact and address, next of kin, insurance,
            health profile, allergies and medications. For institutions: institution and licence details, location and contact, services, and the names and
            contact details of your records and data protection contacts. Patients can also add a passport photo.
          </li>
          <li>
            <strong>Session information:</strong> sign-in tokens linked to your account, so we can keep you signed in and protect your session. See the{' '}
            <Link to="/legal/cookie-policy" className="text-foreground underline underline-offset-4">
              Cookie &amp; Storage Policy
            </Link>
            .
          </li>
          <li>
            <strong>Activity records:</strong> technical logs of events such as sign-ups and sign-ins, which can include your user ID and email address.
          </li>
          <li>
            <strong>Chat messages:</strong> your conversations with Missie (your messages and Missie's replies) are stored on our server with your account, so
            you can come back to them. They're kept until you delete them from the chat sidebar or your account is deleted.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How Missie's replies are written">
        <p>
          To write a reply, our server sends your message and the recent messages in that conversation to an AI model (OpenAI's open-weight gpt-oss model,
          run on Amazon Bedrock). Missie doesn't search Fidelity Health's knowledge base yet; when it does, the matching passages will be sent too. Don't
          enter real medical or personal health information.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <ul>
          <li>To create and manage your account.</li>
          <li>To keep you signed in and protect your account.</li>
          <li>To run, secure, fix and improve Fidelity Health and Missie.</li>
        </ul>
        <p>We don't sell your information, and we don't use it for advertising.</p>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          Only with services needed to run Fidelity Health, such as hosting and database providers, and in future an AI model provider as described above. We may also
          share information if the law requires it.
        </p>
        <p>
          When a verified partner hospital looks a patient up to add a record, it sees the details needed to identify them safely: name, Fidelity Health ID,
          date of birth, sex, phone, city, blood group, genotype, allergies and photo.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>Account details are kept while your account exists. As a demo project, data may be reset or deleted at any time without notice.</p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <ul>
          <li>You can see and change your profile details on your profile page at any time.</li>
          <li>You can log out at any time, which clears your session from this browser.</li>
          <li>
            Self-service account deletion isn't available yet. In a real deployment, this section would explain how to request access to, correction of, or
            deletion of your information.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          We use hashed passwords, an http-only sign-in cookie, sign-in tokens that expire, private file storage with short-lived download links, and access
          checks on every record. No system is perfectly secure, which is one more reason not to enter real health information.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>Fidelity Health accounts aren't intended for anyone under 18.</p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>
          We'll update this page when the way Fidelity Health handles information changes, and change the date at the top. Because this is a demo, there is no real
          privacy contact; a real deployment would list one here.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
