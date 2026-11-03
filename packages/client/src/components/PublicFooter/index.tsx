import { Link } from 'react-router';
import Brand from '@/components/Brand';
import { legalDocuments } from '@/routes/legal/documents';

const linkClass = 'text-ink-soft transition hover:text-foreground';
const YEAR = new Date().getFullYear();

// Footer for public pages: brand, links and the demo notice.
export default function PublicFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-soft">
            Your medical history from partner hospitals, complete and protected in one place, with Missie, our AI assistant, to help.
          </p>
        </div>

        <nav aria-label="Product">
          <h2 className="text-sm font-semibold text-foreground">Fidelity Health</h2>
          <ul className="mt-3 grid gap-2.5 text-sm">
            <li>
              <Link to="/about" className={linkClass}>
                About
              </Link>
            </li>
            <li>
              <Link to="/missie/chat" className={linkClass}>
                Ask Missie
              </Link>
            </li>
            <li>
              <Link to="/signup" className={linkClass}>
                Create an account
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="text-sm font-semibold text-foreground">Legal</h2>
          <ul className="mt-3 grid gap-2.5 text-sm">
            {legalDocuments.map((doc) => (
              <li key={doc.slug}>
                <Link to={`/legal/${doc.slug}`} className={linkClass}>
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-6 text-xs leading-5 text-ink-faint sm:flex-row sm:justify-between">
          <p>© {YEAR} Fidelity Health. A demo project.</p>
          <p>Fidelity Health is fictional and doesn't give medical advice; in an emergency, call your local emergency number.</p>
        </div>
      </div>
    </footer>
  );
}
