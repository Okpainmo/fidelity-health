import { useEffect, useRef, useState } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

// A global confirmation dialog. Mount <ConfirmModalRoot /> once (rtk-base/provider.tsx),
// then ask from anywhere:  if (await requestConfirmation({ title, message })) { ... }

const OPEN_EVENT = 'app:open-confirm-modal';
const RESPONSE_EVENT = 'app:confirm-modal-response';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
}

interface ConfirmRequest extends ConfirmModalOptions {
  requestId: string;
}

let requestCounter = 0;

/** Opens the dialog and resolves with true when the user confirms. */
export function requestConfirmation(options: ConfirmModalOptions): Promise<boolean> {
  const requestId = `confirm-${requestCounter++}`;

  return new Promise((resolve) => {
    function onResponse(event: Event) {
      const { detail } = event as CustomEvent<{ requestId: string; confirmed: boolean }>;
      if (detail.requestId !== requestId) return;
      window.removeEventListener(RESPONSE_EVENT, onResponse);
      resolve(detail.confirmed);
    }

    window.addEventListener(RESPONSE_EVENT, onResponse);
    window.dispatchEvent(new CustomEvent<ConfirmRequest>(OPEN_EVENT, { detail: { ...options, requestId } }));
  });
}

export default function ConfirmModalRoot() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function respond(confirmed: boolean) {
    if (!request) return;
    window.dispatchEvent(new CustomEvent(RESPONSE_EVENT, { detail: { requestId: request.requestId, confirmed } }));
    setRequest(null);
  }

  useEffect(() => {
    const onOpen = (event: Event) => setRequest((event as CustomEvent<ConfirmRequest>).detail);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // While open: lock page scroll, focus Cancel, close on Escape.
  useEffect(() => {
    if (!request) return;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') respond(false);
    }
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  if (!request) return null;

  const isDanger = request.tone === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label="Close dialog" onClick={() => respond(false)} className="absolute inset-0 cursor-pointer bg-black/30" />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          {isDanger ? <HiOutlineExclamationTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" /> : null}
          <h2 id="confirm-modal-title" className="poppins text-lg font-semibold text-foreground">
            {request.title}
          </h2>
        </div>

        <p id="confirm-modal-message" className="mt-2 text-sm leading-6 text-ink-soft">
          {request.message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => respond(false)}
            className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            {request.cancelLabel ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => respond(true)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-white transition ${
              isDanger ? 'bg-danger hover:opacity-90' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {request.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </section>
    </div>
  );
}
