import { useRef, useState } from 'react';
import { HiOutlineCamera, HiOutlineTrash, HiOutlineUserCircle } from 'react-icons/hi2';
import { requestConfirmation } from '@/components/ConfirmModalRoot';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { removeProfilePhoto, uploadProfilePhoto } from '@/rtk-base/slices/profileSlice';

const MAX_MB = 5;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// The patient's passport photo. Saved straight away (separately from the
// "Save changes" button), and shown to hospitals when they look the patient up.
export default function ProfilePhotoField() {
  const dispatch = useAppDispatch();
  const photoUrl = useAppSelector((state) => {
    const value = state.profile.data?.photoUrl;
    return typeof value === 'string' ? value : null;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!TYPES.includes(file.type)) return setError('Use a JPG, PNG or WebP image.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Photos must be ${MAX_MB} MB or smaller.`);

    setBusy(true);
    const outcome = await dispatch(uploadProfilePhoto(file));
    setBusy(false);
    if (uploadProfilePhoto.rejected.match(outcome)) setError(outcome.payload ?? 'Could not upload your photo.');
  }

  async function remove() {
    const confirmed = await requestConfirmation({ title: 'Remove your photo?', message: 'Hospitals will no longer see it when they look you up.', confirmLabel: 'Remove' });
    if (!confirmed) return;
    setError(null);
    setBusy(true);
    const outcome = await dispatch(removeProfilePhoto());
    setBusy(false);
    if (removeProfilePhoto.rejected.match(outcome)) setError(outcome.payload ?? 'Could not remove your photo.');
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted" aria-busy={busy || undefined}>
        {photoUrl ? <img src={photoUrl} alt="Your current headshot" className={`size-full object-cover ${busy ? 'opacity-50' : ''}`} /> : <HiOutlineUserCircle className="size-12 text-ink-faint" aria-hidden="true" />}
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            <HiOutlineCamera className="size-4" aria-hidden="true" />
            {busy ? 'Saving…' : photoUrl ? 'Change photo' : 'Add passport photo'}
          </button>
          {photoUrl ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-muted hover:text-danger disabled:opacity-60"
            >
              <HiOutlineTrash className="size-4" aria-hidden="true" />
              Remove
            </button>
          ) : null}
        </div>
        <label className="sr-only" htmlFor="profile-photo-input">
          Passport photo
        </label>
        <input
          id="profile-photo-input"
          ref={inputRef}
          type="file"
          accept={TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) upload(file);
          }}
        />
        <p className="mt-2 text-xs text-ink-faint">JPG, PNG or WebP up to {MAX_MB} MB. Plain background, face clearly visible. Saved straight away.</p>
        {error ? (
          <p role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
