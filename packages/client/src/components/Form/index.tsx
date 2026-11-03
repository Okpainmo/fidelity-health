import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

// Building blocks for long data-entry forms (record upload, profile pages).
// Put `className="group/form"` on the <form> and set `data-submitted` after the
// first submit attempt: invalid fields then get a red border.

const controlBase =
  'w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-foreground transition placeholder:text-ink-faint disabled:bg-muted disabled:text-ink-faint group-data-[submitted]/form:invalid:border-danger';

export function FormSection({ id, step, title, description, children }: { id: string; step?: number; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-3xl border border-line bg-white p-5 sm:p-7">
      <header className="flex gap-4">
        {step !== undefined ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">{step}</span>
        ) : null}
        <div>
          <h2 id={`${id}-title`} className="poppins text-lg font-medium text-foreground">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm leading-6 text-ink-soft">{description}</p> : null}
        </div>
      </header>
      <div className="mt-6 grid gap-5">{children}</div>
    </section>
  );
}

// Responsive grid for fields: 1 column on phones, up to `cols` on wider screens.
export function FieldRow({ cols = 2, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const colClass = cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return <div className={`grid gap-5 ${colClass}`}>{children}</div>;
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="border-t border-line pt-5 text-sm font-semibold text-foreground">{children}</h3>;
}

type FieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, required, hint, className = '', children }: FieldProps) {
  return (
    <div className={`grid content-start gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-11 ${controlBase} ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={`resize-y py-2.5 leading-6 ${controlBase} ${className}`} {...props} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
};

export function Select({ options, placeholder = 'Select…', className = '', defaultValue, value, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`h-11 appearance-none pr-10 ${controlBase} ${className}`}
        {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? '' })}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) =>
          typeof option === 'string' ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
      <HiOutlineChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
    </div>
  );
}

// Single choice shown as pills (radio buttons underneath).
export function ChoicePills({
  name,
  options,
  value,
  defaultValue,
  required,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value?: string;
  defaultValue?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((option, index) => (
        <label
          key={option}
          className="cursor-pointer rounded-full border border-line px-3.5 py-2 text-sm text-foreground transition select-none hover:bg-muted has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-accent-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/30"
        >
          <input
            type="radio"
            name={name}
            value={option}
            className="sr-only"
            required={required && index === 0}
            {...(value !== undefined ? { checked: value === option, onChange: () => onChange?.(option) } : { defaultChecked: defaultValue === option })}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

// Several choices shown as toggle chips (checkboxes underneath).
export function CheckboxChips({ name, options, defaultValues = [] }: { name: string; options: readonly string[]; defaultValues?: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option}
          className="cursor-pointer rounded-full border border-line px-3.5 py-2 text-sm text-foreground transition select-none hover:bg-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:font-medium has-[:checked]:text-accent-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/30"
        >
          <input type="checkbox" name={name} value={option} defaultChecked={defaultValues.includes(option)} className="sr-only" />
          {option}
        </label>
      ))}
    </div>
  );
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode };

export function Checkbox({ label, description, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded accent-[#1b7f79] group-data-[submitted]/form:invalid:outline group-data-[submitted]/form:invalid:outline-2 group-data-[submitted]/form:invalid:outline-danger"
        {...props}
      />
      <span className="text-sm leading-6">
        <span className="text-foreground">{label}</span>
        {description ? <span className="block text-ink-soft">{description}</span> : null}
      </span>
    </label>
  );
}
