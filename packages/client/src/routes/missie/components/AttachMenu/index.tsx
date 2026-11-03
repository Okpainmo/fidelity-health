import { useEffect, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { HiOutlineDocument, HiOutlineDocumentText, HiOutlinePhoto, HiOutlinePlus, HiOutlineViewfinderCircle } from 'react-icons/hi2';

type FileOption = {
  id: string;
  label: string;
  hint: string;
  accept: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const FILE_OPTIONS: FileOption[] = [
  { id: 'image', label: 'Image', hint: 'JPG, PNG, HEIC', accept: 'image/*', icon: HiOutlinePhoto },
  { id: 'pdf', label: 'PDF', hint: 'Reports, letters, results', accept: 'application/pdf,.pdf', icon: HiOutlineDocumentText },
  { id: 'document', label: 'Document', hint: 'Word or text', accept: '.doc,.docx,.txt,.rtf', icon: HiOutlineDocument },
  { id: 'scan', label: 'Medical scan', hint: 'DICOM (.dcm)', accept: '.dcm,application/dicom', icon: HiOutlineViewfinderCircle },
];

// "+" button in the chat box: pick a file type, then choose files of that type.
// File selection only for now - the chosen files aren't used yet.
export default function AttachMenu({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [accept, setAccept] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Close on outside click or Escape; focus the first option when opened.
  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Open the file picker once `accept` has been applied to the input.
  useEffect(() => {
    if (accept) inputRef.current?.click();
  }, [accept]);

  function choose(option: FileOption) {
    setOpen(false);
    // Re-setting the same type still needs to reopen the picker.
    if (option.accept === accept) inputRef.current?.click();
    else setAccept(option.accept);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      {open ? (
        <div role="menu" aria-label="Add a file" className="absolute bottom-full left-0 z-30 mb-3 w-64 rounded-2xl border border-line bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <p className="px-3 pt-1.5 pb-1 text-xs font-medium text-ink-faint">Add a file</p>
          {FILE_OPTIONS.map((option, index) => (
            <button
              key={option.id}
              ref={index === 0 ? firstItemRef : undefined}
              type="button"
              role="menuitem"
              aria-label={`${option.label}: ${option.hint}`}
              onClick={() => choose(option)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-muted focus-visible:bg-muted"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-missie-soft">
                <option.icon className="size-4 text-missie-ink" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block truncate text-xs text-ink-faint">{option.hint}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        aria-label="Add a file"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Add a file"
        className={`flex size-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 ${open ? 'bg-muted text-foreground' : ''}`}
      >
        <HiOutlinePlus className={`size-5 transition ${open ? 'rotate-45' : ''}`} aria-hidden="true" />
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          // Selection only for now: clear it so the same file can be picked again.
          e.target.value = '';
        }}
      />
    </div>
  );
}
