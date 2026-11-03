import { Children, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { HiOutlineChevronRight, HiOutlineLink } from 'react-icons/hi2';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';
import { LEGAL_LAST_UPDATED, legalDocuments } from '@/routes/legal/documents';
import type { LegalSlug } from '@/routes/legal/documents';
import { slugify } from '@/utils/slugify';

type LegalSectionProps = { heading: string; children: ReactNode };

// Shared frame and typography for every legal page. The "On this page" list
// is built from the headings of the <LegalSection> children.
export function LegalDocument({ slug, intro, children }: { slug: LegalSlug; intro: ReactNode; children: ReactNode }) {
  const doc = legalDocuments.find((item) => item.slug === slug)!;
  const headings = Children.toArray(children)
    .filter((child): child is ReactElement<LegalSectionProps> => isValidElement<LegalSectionProps>(child) && typeof child.props.heading === 'string')
    .map((child) => child.props.heading);
  const others = legalDocuments.filter((item) => item.slug !== slug);

  return (
    <article>
      <PageTitle title={doc.title} />

      <header>
        <h1 className="poppins text-[34px] leading-tight font-medium tracking-tight sm:text-[40px]">{doc.title}</h1>
        <p className="mt-3 text-sm text-ink-faint">Last updated {LEGAL_LAST_UPDATED}</p>
      </header>

      <p className="mt-8 rounded-2xl bg-muted px-5 py-4 text-sm leading-6 text-ink-soft">
        <strong className="font-semibold text-foreground">Demo notice.</strong> Fidelity Health and Missie are part of a learning project. Fidelity Health is
        fictional, and this page is a draft written for that demo. It is not legal advice and has not been reviewed by a lawyer.
      </p>

      <div className="mt-8 text-[17px] leading-8 text-ink-soft">{intro}</div>

      {headings.length > 2 ? (
        <nav aria-label="On this page" className="mt-10 rounded-2xl border border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">On this page</h2>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2 sm:gap-x-6">
            {headings.map((heading) => (
              <li key={heading}>
                <a href={`#${slugify(heading)}`} className="text-ink-soft transition hover:text-accent">
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="mt-2">{children}</div>

      <footer className="mt-16 border-t border-line pt-8">
        <h2 className="text-sm font-semibold text-foreground">Other legal pages</h2>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {others.map((item) => (
            <li key={item.slug}>
              <Link to={`/legal/${item.slug}`} className="group flex items-center justify-between gap-2 rounded-xl py-2 text-sm text-ink-soft hover:text-foreground">
                {item.title}
                <HiOutlineChevronRight className="size-4 text-ink-faint transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  const id = slugify(heading);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-12 scroll-mt-24">
      <h2 id={`${id}-title`} className="group poppins flex items-center gap-2 text-xl font-medium text-foreground">
        {heading}
        <a href={`#${id}`} aria-label={`Link to "${heading}"`} className="text-ink-faint opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100">
          <HiOutlineLink className="size-4" aria-hidden="true" />
        </a>
      </h2>
      <div className="mt-4 grid gap-4 text-[16px] leading-7 text-ink-soft [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pl-5 [&_ul]:marker:text-ink-faint">
        {children}
      </div>
    </section>
  );
}
