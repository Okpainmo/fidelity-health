import { LegalDocument, LegalSection } from '@/routes/legal/components/LegalDocument';

export default function AiUsePolicyPage() {
  return (
    <LegalDocument
      slug="ai-use-policy"
      intro={<p>How Missie uses AI to answer questions about the Fidelity Health platform, what it can and can't do, and what we ask of you when using it.</p>}
    >
      <LegalSection heading="How Missie answers">
        <p>Missie is designed to use retrieval-augmented generation (RAG):</p>
        <ul>
          <li>your question is used to search Fidelity Health's knowledge base of guides and policies;</li>
          <li>the most relevant passages are given to an AI model along with your question;</li>
          <li>the model writes an answer from those passages and points to the sources it used.</li>
        </ul>
        <p>When the knowledge base doesn't cover a question, Missie should say so rather than guess. The knowledge-base search isn't built yet, so for now Missie answers from its general instructions only.</p>
      </LegalSection>

      <LegalSection heading="Limits">
        <ul>
          <li>Answers can be wrong, incomplete or out of date, even when sources are shown.</li>
          <li>Missie only knows what's in Fidelity Health's knowledge base, which is fictional.</li>
          <li>Missie doesn't interpret medical records and can't give medical advice.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Access to your records">
        <p>Missie can't see your medical records today. If that's added later, it will follow these rules:</p>
        <ul>
          <li>Missie only accesses your records after you've given permission, and you can withdraw it.</li>
          <li>It only reads what's needed to answer your question.</li>
          <li>It never reveals one person's records to another.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Actions on your behalf">
        <p>
          Missie may later be able to take simple actions, such as requesting a copy of your records or reviewing who has accessed them. Missie is designed to
          explain what it's about to do and ask you to confirm before doing anything. Changes to who can access your records will always need your
          confirmation.
        </p>
      </LegalSection>

      <LegalSection heading="Your data and the AI model">
        <p>
          Your messages, and the recent messages in the same conversation, are sent to an AI model provider to generate answers. The Privacy Policy names the
          provider and explains how conversations are stored.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>Please don't use Missie to:</p>
        <ul>
          <li>make medical decisions without a qualified professional;</li>
          <li>try to override its instructions, extract hidden prompts, or get it to reveal other people's records or information;</li>
          <li>create harmful, misleading or illegal content;</li>
          <li>process real medical records or personal health information.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Feedback">
        <p>If Missie gives a wrong or unsafe answer, don't act on it. A way to report answers will be added as the project develops.</p>
      </LegalSection>
    </LegalDocument>
  );
}
