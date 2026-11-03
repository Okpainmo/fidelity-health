import { useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { HiOutlineArrowUp } from 'react-icons/hi2';
import AttachMenu from '../AttachMenu';

type ChatComposerProps = {
  onSend: (content: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

const MAX_HEIGHT = 200;

// Rounded message box: "+" to add a file, the message, and a round send button.
// Grows with its content up to MAX_HEIGHT; Enter sends, Shift+Enter adds a new line.
export default function ChatComposer({ onSend, disabled = false, autoFocus = false }: ChatComposerProps) {
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [draft]);

  function send() {
    if (!canSend) return;
    onSend(draft.trim());
    setDraft('');
    textareaRef.current?.focus();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-end gap-1.5 rounded-[28px] border border-line bg-white py-2.5 pr-2.5 pl-2.5 shadow-[0_4px_24px_rgba(27,127,121,0.08)]"
    >
      <AttachMenu disabled={disabled} />
      <label htmlFor="chat-composer" className="sr-only">
        Message
      </label>
      <textarea
        id="chat-composer"
        ref={textareaRef}
        rows={1}
        value={draft}
        autoFocus={autoFocus}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask anything"
        className="scrollbar-thin max-h-[200px] flex-1 resize-none self-center bg-transparent py-1.5 text-base leading-6 text-foreground placeholder:text-ink-faint"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-missie text-missie-foreground transition hover:bg-missie-hover disabled:cursor-not-allowed disabled:bg-hover disabled:text-ink-faint"
      >
        <HiOutlineArrowUp className="size-[18px]" strokeWidth={2.5} />
      </button>
    </form>
  );
}
