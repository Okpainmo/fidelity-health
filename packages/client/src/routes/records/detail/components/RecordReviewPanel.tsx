import { useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { requestConfirmation } from '@/components/ConfirmModalRoot';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { reviewRecord } from '@/rtk-base/slices/recordsSlice';
import type { RecordDetail } from '@/rtk-base/slices/recordsSlice';
import { formatDate } from '@/utils/dates';

// The submitting hospital's records-team step: verify or reject a pending
// record. Once reviewed, shows the outcome instead.
export default function RecordReviewPanel({ record }: { record: RecordDetail }) {
  const dispatch = useAppDispatch();
  const { reviewingId, reviewError } = useAppSelector((state) => state.records);
  const [note, setNote] = useState('');
  const busy = reviewingId === record.id;

  async function review(status: 'verified' | 'rejected') {
    if (status === 'rejected') {
      const confirmed = await requestConfirmation({
        title: 'Reject this record?',
        message: "It won't be added to the patient's history, and the patient won't see it.",
        confirmLabel: 'Reject record',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    dispatch(reviewRecord({ id: record.id, status, note: note.trim() || undefined }));
  }

  if (record.status !== 'pending') {
    const verified = record.status === 'verified';
    return (
      <section aria-label="Review" className={`rounded-3xl p-5 sm:p-6 ${verified ? 'bg-accent-soft/70' : 'bg-red-50'}`}>
        <p className={`flex items-center gap-2 font-semibold ${verified ? 'text-accent-ink' : 'text-danger'}`}>
          {verified ? <HiOutlineCheckCircle className="size-5" aria-hidden="true" /> : <HiOutlineXCircle className="size-5" aria-hidden="true" />}
          {verified ? 'Verified' : 'Rejected'}
          {record.reviewedAt ? <span className="font-normal text-ink-soft">· {formatDate(record.reviewedAt)}</span> : null}
        </p>
        {record.reviewNote ? <p className="mt-2 text-sm leading-6 text-ink-soft">{record.reviewNote}</p> : null}
      </section>
    );
  }

  return (
    <section aria-labelledby="review-title" className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
      <h2 id="review-title" className="poppins text-lg font-medium text-foreground">
        Review this record
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink-soft">
        Check the details and attachments, then verify the record to add it to the patient&apos;s history, or reject it.
      </p>
      <label htmlFor="review-note" className="mt-4 block text-sm font-medium text-foreground">
        Note <span className="font-normal text-ink-faint">(optional)</span>
      </label>
      <textarea
        id="review-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="e.g. Checked against the lab system"
        className="mt-1.5 w-full resize-y rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] placeholder:text-ink-faint"
      />
      {reviewError ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {reviewError}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => review('verified')}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
        >
          <HiOutlineCheckCircle className="size-4" aria-hidden="true" />
          {busy ? 'Saving…' : 'Verify record'}
        </button>
        <button
          type="button"
          onClick={() => review('rejected')}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-danger transition hover:border-danger/40 disabled:opacity-60"
        >
          <HiOutlineXCircle className="size-4" aria-hidden="true" />
          Reject
        </button>
      </div>
    </section>
  );
}
