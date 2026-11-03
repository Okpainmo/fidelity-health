import { HiOutlineChevronRight } from 'react-icons/hi2';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';
import { LEGAL_LAST_UPDATED, legalDocuments } from './documents';

// /legal - overview of every legal page.
export default function LegalOverviewPage() {
  return (
    <div>
      <PageTitle title="Legal" />
      <h1 className="poppins text-[34px] leading-tight font-medium tracking-tight sm:text-[40px]">Legal</h1>
      <p className="mt-4 text-[17px] leading-8 text-ink-soft">
        How Fidelity Health handles your information, the terms for using the app and Missie, its AI assistant, and the limits of what they can do.
      </p>
      <p className="mt-3 text-sm text-ink-faint">
        Last updated {LEGAL_LAST_UPDATED}. Fidelity Health is fictional, and these pages are drafts for a demo project.
      </p>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {legalDocuments.map((doc) => (
          <li key={doc.slug}>
            <Link to={`/legal/${doc.slug}`} className="group flex items-center gap-4 py-5">
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{doc.title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{doc.summary}</p>
              </div>
              <HiOutlineChevronRight className="size-5 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
