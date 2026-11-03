import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

// Labelled input for the auth forms. Password fields get a show/hide button.
export default function TextField({ label, hint, id, name, type, className = '', disabled, ...inputProps }: TextFieldProps) {
  const inputId = id ?? name;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="px-1 text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={isPassword && visible ? 'text' : type}
          disabled={disabled}
          className={`h-[52px] w-full rounded-full border border-line bg-white px-5 text-[15px] text-foreground transition placeholder:text-ink-faint disabled:opacity-60 ${
            isPassword ? 'pr-14' : ''
          } ${className}`}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            disabled={disabled}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            aria-controls={inputId}
            title={visible ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition hover:bg-accent-soft hover:text-accent-ink disabled:opacity-60"
          >
            {visible ? <HiOutlineEyeSlash className="size-5" aria-hidden="true" /> : <HiOutlineEye className="size-5" aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      {hint ? <p className="px-1 text-xs leading-relaxed text-ink-faint">{hint}</p> : null}
    </div>
  );
}
