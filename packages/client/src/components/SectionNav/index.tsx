type SectionNavProps = {
  sections: readonly { id: string; title: string }[];
  active: string;
  label: string;
  numbered?: boolean;
};

// Sticky list of links to the sections of a long form (desktop only).
export default function SectionNav({ sections, active, label, numbered = false }: SectionNavProps) {
  return (
    <nav aria-label={label} className="hidden lg:block">
      <ol className="sticky top-24 grid gap-0.5">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'location' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active === section.id ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-soft hover:text-foreground'
              }`}
            >
              {numbered ? <span className="w-4 text-xs text-ink-faint tabular-nums">{index + 1}</span> : null}
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
