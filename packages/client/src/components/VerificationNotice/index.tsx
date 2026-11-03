import { HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi2';
import { Link } from 'react-router';
import type { HospitalVerification } from '@/utils/useHospitalVerification';

// Shown to hospitals that can't add records yet (home, records, upload).
export default function VerificationNotice({ status, note }: { status: Exclude<HospitalVerification, 'verified'>; note?: string | null }) {
  const declined = status === 'rejected';
  const Icon = declined ? HiOutlineXCircle : HiOutlineClock;

  return (
    <div className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm leading-6 ${declined ? 'bg-red-50 text-danger' : 'bg-amber-50 text-amber-800'}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{declined ? 'Verification declined' : 'Verification pending'}</p>
        <p className="mt-0.5">
          {declined
            ? 'Fidelity Health could not verify your institution, so it can’t add records. Update your institution profile and contact support to try again.'
            : 'Fidelity Health is reviewing your institution. You’ll be able to search patients and upload records once it’s verified.'}{' '}
          <Link to="/profile" className="font-medium underline underline-offset-2">
            Review your institution profile
          </Link>
        </p>
        {note ? <p className="mt-1.5">Note from Fidelity Health: {note}</p> : null}
      </div>
    </div>
  );
}
