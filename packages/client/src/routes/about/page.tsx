import { HiOutlineArrowUpTray, HiOutlineBuildingOffice2, HiOutlineChevronDown, HiOutlineFolderOpen, HiOutlineKey, HiOutlineShieldCheck } from 'react-icons/hi2';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';
import { useAppSelector } from '@/rtk-base/hooks';

const features = [
  {
    icon: HiOutlineBuildingOffice2,
    title: 'Connected to your hospitals',
    body: 'Partner hospitals add records as you receive care, so your history stays complete without you chasing paperwork.',
  },
  {
    icon: HiOutlineFolderOpen,
    title: 'One complete history',
    body: 'Visits, lab results, imaging, prescriptions and procedures from every partner hospital, in one place.',
  },
  {
    icon: HiOutlineKey,
    title: 'You control access',
    body: 'Records are only shared with the people and hospitals you allow, and every access is logged.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Protected by design',
    body: 'Records are verified by hospital records teams before they appear, and kept secure once they do.',
  },
];

const missieSteps = [
  { title: 'You ask', body: 'Ask a question in plain language, the way you would at a help desk.' },
  { title: 'Missie looks it up', body: "Missie searches Fidelity Health's own guides and policies for the passages that answer it." },
  {
    title: 'Missie answers from the source',
    body: "The reply is written from those passages and shows where it came from. If they don't cover your question, Missie says so instead of guessing.",
  },
];

const faqs = [
  {
    q: 'Who adds records to Fidelity Health?',
    a: "Records officers at partner hospitals upload them. Each record is checked by the hospital's records team before it appears in your history.",
  },
  {
    q: 'Who can see my records?',
    a: 'You, and the people and hospitals you authorise. You can review and change access at any time.',
  },
  {
    q: 'Can Missie read my medical records?',
    a: "Not today. Missie currently answers from Fidelity Health's general guides and policies. Any future access to your own records will only happen with your permission.",
  },
  {
    q: 'Can Missie explain what my results mean?',
    a: "No. Missie helps you find your way around your records and the platform, but it can't interpret results or give medical advice. Ask your doctor or the hospital that recorded them.",
  },
  {
    q: 'Is this a real service?',
    a: "No. Fidelity Health and its partner hospitals are fictional, built for a learning project. Please don't enter real medical or personal information.",
  },
];

export default function AboutPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const ctaHref = isAuthenticated ? '/' : '/signup';

  return (
    <>
      <PageTitle title="About" />

      {/* Hero */}
      <section className="mx-auto w-full max-w-3xl px-5 pt-20 pb-16 text-center sm:pt-28">
        <p className="text-sm font-medium text-accent">About Fidelity Health</p>
        <h1 className="poppins mt-4 text-[40px] leading-[1.1] font-medium tracking-tight sm:text-[56px]">Your medical history, complete and protected.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-soft">
          Fidelity Health works with partner hospitals to track and safely store patients' medical records, so your full history is in one place and only
          shared with people you trust.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to={ctaHref} className="rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-accent-foreground transition hover:bg-accent-hover">
            {isAuthenticated ? 'Go to app' : 'Get started'}
          </Link>
          <a href="#missie" className="rounded-full border border-missie/30 px-6 py-3 text-[15px] font-medium text-missie-ink transition hover:bg-missie-soft">
            Meet Missie
          </a>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features" className="mx-auto w-full max-w-5xl px-5 py-16">
        <h2 id="features" className="poppins text-center text-[28px] font-medium tracking-tight">
          How Fidelity Health works
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-3xl bg-accent-soft/60 p-6">
              <Icon className="size-6 text-accent" aria-hidden="true" />
              <h3 className="mt-4 text-[17px] font-semibold">{title}</h3>
              <p className="mt-1.5 leading-7 text-ink-soft">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* For hospitals */}
      <section aria-labelledby="hospitals" className="mx-auto w-full max-w-3xl px-5 py-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-line p-7 sm:flex-row sm:items-center sm:p-9">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft">
            <HiOutlineArrowUpTray className="size-6 text-accent" aria-hidden="true" />
          </span>
          <div>
            <h2 id="hospitals" className="poppins text-xl font-medium">
              For partner hospitals
            </h2>
            <p className="mt-2 leading-7 text-ink-soft">
              Records officers register patients and upload records through a structured form covering identity, contacts, insurance, clinical profile,
              the visit itself, attachments and consent.
            </p>
          </div>
        </div>
      </section>

      {/* Missie */}
      <section id="missie" aria-labelledby="missie-title" className="mx-auto w-full max-w-3xl scroll-mt-24 px-5 py-16">
        <p className="text-sm font-medium text-missie">Your AI assistant</p>
        <h2 id="missie-title" className="poppins mt-2 text-[28px] font-medium tracking-tight">
          Meet Missie
        </h2>
        <p className="mt-4 text-[17px] leading-8 text-ink-soft">
          Missie answers questions about your records and the platform: where an entry came from, who can see it, how partner hospitals connect, and how your
          data is protected.
        </p>
        <ol className="mt-8 grid gap-8">
          {missieSteps.map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-missie-soft text-sm font-semibold text-missie-ink">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{step.title}</h3>
                <p className="mt-1 leading-7 text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 leading-7 text-ink-soft">
          This approach is called retrieval-augmented generation (RAG). It keeps Missie's answers tied to what Fidelity Health actually says.
        </p>

        <ul className="mt-8 grid gap-3 leading-7 text-ink-soft">
          <li className="rounded-2xl border border-line px-5 py-4">
            <strong className="font-semibold text-foreground">Not a doctor.</strong> Missie can't interpret your records, diagnose, or recommend treatment.
          </li>
          <li className="rounded-2xl border border-line px-5 py-4">
            <strong className="font-semibold text-foreground">Not for emergencies.</strong> If you think you're having a medical emergency, call your local
            emergency number now.
          </li>
          <li className="rounded-2xl border border-line px-5 py-4">
            <strong className="font-semibold text-foreground">Not always right.</strong> AI can make mistakes. Check anything important with Fidelity
            Health support or your hospital.
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl px-5 py-16">
        <h2 id="faq" className="poppins text-[28px] font-medium tracking-tight">
          Questions
        </h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {faqs.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {item.q}
                <HiOutlineChevronDown className="size-5 shrink-0 text-ink-faint transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 leading-7 text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Demo notice */}
      <section className="mx-auto w-full max-w-3xl px-5 pt-8 pb-24">
        <div className="rounded-3xl bg-muted px-6 py-8 text-center sm:px-10">
          <h2 className="poppins text-[22px] font-medium tracking-tight">A demo project</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-ink-soft">
            Fidelity Health and its partner hospitals are fictional, and any resemblance to a real organisation is coincidental. This is a learning build from
            the AI Course for Developers, built with React and Express. Please don't share real medical or personal information.
          </p>
          <p className="mt-5 text-sm text-ink-faint">
            Read the{' '}
            <Link to="/legal/privacy-policy" className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/legal/medical-disclaimer" className="text-foreground underline underline-offset-4">
              Medical Disclaimer
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
