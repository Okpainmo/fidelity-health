import { useState } from 'react';
import { HiOutlineCheck, HiOutlineDocumentDuplicate } from 'react-icons/hi2';

type CopyButtonProps = {
  text: string;
  label?: string;
  // Show "Copy"/"Copied" next to the icon (used on code blocks).
  showText?: boolean;
  className?: string;
};

// Copies `text` to the clipboard and briefly confirms.
export default function CopyButton({ text, label = 'Copy message', showText = false, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked - nothing useful to show.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : 'Copy'}
      className={`flex items-center justify-center gap-1.5 rounded-lg text-ink-faint transition hover:bg-muted hover:text-foreground ${
        showText ? 'px-2 py-1 text-xs font-medium' : 'size-8'
      } ${className}`}
    >
      {copied ? <HiOutlineCheck className="size-4" aria-hidden="true" /> : <HiOutlineDocumentDuplicate className="size-4" aria-hidden="true" />}
      {showText ? (copied ? 'Copied' : 'Copy') : null}
    </button>
  );
}
