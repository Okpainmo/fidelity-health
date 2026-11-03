import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { HiOutlineArrowUpTray, HiOutlineFolderOpen } from 'react-icons/hi2';
import { Link } from 'react-router';
import VerificationNotice from '@/components/VerificationNotice';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { selectAccountType } from '@/rtk-base/slices/authSlice';
import { fetchRecords } from '@/rtk-base/slices/recordsSlice';
import { useHospitalVerification } from '@/utils/useHospitalVerification';
import RecordsBrowser from './components/RecordsBrowser';

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent-soft">
        <HiOutlineFolderOpen className="size-6 text-accent" aria-hidden="true" />
      </span>
      <p className="poppins mt-4 text-lg font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink-soft">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

// /records: patients see their own history ("My records"); hospitals see the
// records they've submitted for their patients ("Patient records").
export default function RecordsPage() {
  const dispatch = useAppDispatch();
  const accountType = useAppSelector(selectAccountType);
  const { list, isLoadingList, listError } = useAppSelector((state) => state.records);
  const verification = useHospitalVerification();
  const verificationNote = useAppSelector((state) => state.profile.data?.verificationNote);

  useEffect(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  const retry = () => dispatch(fetchRecords());
  const pending = list.filter((record) => record.status === 'pending').length;

  if (accountType === 'hospital') {
    const canUpload = verification === 'verified';
    const uploadButton = (
      <Link
        to="/records/upload"
        aria-disabled={!canUpload}
        onClick={(e) => {
          if (!canUpload) e.preventDefault();
        }}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
          canUpload ? 'bg-accent text-accent-foreground hover:bg-accent-hover' : 'cursor-not-allowed bg-muted text-ink-faint'
        }`}
      >
        <HiOutlineArrowUpTray className="size-4" aria-hidden="true" />
        Upload record
      </Link>
    );

    return (
      <>
        {verification && verification !== 'verified' ? (
          <div className="mx-auto w-full max-w-4xl px-5 pt-8">
            <VerificationNotice status={verification} note={typeof verificationNote === 'string' ? verificationNote : null} />
          </div>
        ) : null}
        <RecordsBrowser
          title="Patient records"
          description="Records your institution has submitted for registered patients."
          records={list}
          loading={isLoadingList}
          error={listError}
          onRetry={retry}
          forHospital
          stats={[
            { label: 'Records', value: list.length },
            { label: 'Patients', value: new Set(list.map((record) => record.patient.fhId)).size },
            { label: 'Pending review', value: pending },
          ]}
          searchPlaceholder="Search by patient, Fidelity Health ID, title or reference"
          action={uploadButton}
          emptyState={
            <EmptyState
              title="No records yet"
              body="Records you upload for your patients appear here, with their review status."
              action={canUpload ? uploadButton : undefined}
            />
          }
        />
      </>
    );
  }

  return (
    <RecordsBrowser
      title="My records"
      description="Your medical history from every partner hospital."
      records={list}
      loading={isLoadingList}
      error={listError}
      onRetry={retry}
      forHospital={false}
      stats={[
        { label: 'Records', value: list.length },
        { label: 'Hospitals', value: new Set(list.map((record) => record.hospital.institutionId)).size },
        { label: 'Pending review', value: pending },
      ]}
      searchPlaceholder="Search by title, hospital, clinician or reference"
      emptyState={
        <EmptyState
          title="No records yet"
          body="When a partner hospital adds a record for you, it appears here. Give your Fidelity Health ID at the hospital so staff can find you."
          action={
            <Link to="/profile" className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              See my Fidelity Health ID
            </Link>
          }
        />
      }
    />
  );
}
