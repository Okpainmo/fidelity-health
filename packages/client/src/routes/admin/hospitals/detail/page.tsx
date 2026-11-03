import { useEffect, useState } from 'react';
import { HiOutlineArrowUturnLeft, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { useParams } from 'react-router';
import { requestConfirmation } from '@/components/ConfirmModalRoot';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchAdminHospital, setHospitalVerification } from '@/rtk-base/slices/adminSlice';
import type { VerificationStatus } from '@/rtk-base/slices/adminSlice';
import { formatDate } from '@/utils/dates';
import AccountStatusPanel from '../../components/AccountStatusPanel';
import { AdminHeader, ErrorBanner, Facts, ListSkeleton, Panel, text } from '../../components/AdminUi';

const VERIFICATION_LABEL: Record<VerificationStatus, string> = { pending: 'Pending', verified: 'Verified', rejected: 'Declined' };

// /admin/hospitals/:userId - one institution: verify it, and review its profile.
export default function AdminHospitalDetailPage() {
  const userId = Number(useParams().userId);
  const dispatch = useAppDispatch();
  const detail = useAppSelector((state) => state.admin.hospitalDetails[userId]);
  const { loading, error, actionPending, actionError } = useAppSelector((state) => state.admin);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (userId) dispatch(fetchAdminHospital(userId));
  }, [dispatch, userId]);

  if (!detail) {
    return (
      <>
        <AdminHeader title="Institution" back={{ to: '/admin/hospitals', label: 'Institutions' }} />
        {error && !loading.detail ? <ErrorBanner message={error} onRetry={() => dispatch(fetchAdminHospital(userId))} /> : <ListSkeleton rows={3} />}
      </>
    );
  }

  const { user, profile, recordCount } = detail;
  const status = (text(profile, 'verificationStatus') ?? 'pending') as VerificationStatus;
  const departments = Array.isArray(profile?.departments) ? (profile.departments as string[]).join(', ') : null;
  const verifiedAt = text(profile, 'verifiedAt');

  async function setStatus(next: VerificationStatus) {
    if (next === 'rejected') {
      const confirmed = await requestConfirmation({
        title: `Decline ${user.name}?`,
        message: "The institution won't be able to search patients or add records.",
        confirmLabel: 'Decline',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    const outcome = await dispatch(setHospitalVerification({ userId, status: next, note: note.trim() || undefined }));
    if (setHospitalVerification.fulfilled.match(outcome)) setNote('');
  }

  return (
    <>
      <PageTitle title={user.name} />
      <AdminHeader
        title={user.name}
        description={`${text(profile, 'institutionId') ?? ''} · ${user.email} · joined ${formatDate(user.createdAt)}`}
        back={{ to: '/admin/hospitals', label: 'Institutions' }}
        actions={<StatusBadge status={status} label={VERIFICATION_LABEL[status]} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid min-w-0 content-start gap-6">
          <Panel title="Institution details">
            <Facts
              items={[
                { label: 'Type', value: text(profile, 'institutionType') },
                { label: 'Ownership', value: text(profile, 'ownership') },
                { label: 'Registration / licence number', value: text(profile, 'licenceNumber') },
                { label: 'Licence expiry', value: text(profile, 'licenceExpiry') ? formatDate(text(profile, 'licenceExpiry') as string) : null },
                { label: 'Year established', value: text(profile, 'yearEstablished') },
                { label: 'Beds', value: text(profile, 'beds') },
                { label: 'Accreditation', value: text(profile, 'accreditation') },
                { label: 'Records submitted', value: String(recordCount) },
              ]}
            />
          </Panel>

          <Panel title="Location and contact">
            <Facts
              items={[
                { label: 'Address', value: [text(profile, 'address1'), text(profile, 'address2')].filter(Boolean).join(', ') },
                { label: 'City / region', value: [text(profile, 'city'), text(profile, 'region'), text(profile, 'country')].filter(Boolean).join(', ') },
                { label: 'Main phone', value: text(profile, 'phone') },
                { label: 'Emergency line', value: text(profile, 'emergencyPhone') },
                { label: 'Contact email', value: text(profile, 'contactEmail') },
                { label: 'Website', value: text(profile, 'website') },
              ]}
            />
          </Panel>

          <Panel title="Services">
            <Facts
              items={[
                { label: 'Departments', value: departments },
                { label: 'Other services', value: text(profile, 'otherServices') },
                { label: 'Records system', value: text(profile, 'emrSystem') },
              ]}
            />
          </Panel>

          <Panel title="Contacts">
            <Facts
              items={[
                { label: 'Records administrator', value: [text(profile, 'recordsAdminName'), text(profile, 'recordsAdminRole')].filter(Boolean).join(', ') },
                { label: 'Administrator contact', value: [text(profile, 'recordsAdminEmail'), text(profile, 'recordsAdminPhone')].filter(Boolean).join(' · ') },
                { label: 'Data protection officer', value: text(profile, 'dpoName') },
                { label: 'DPO contact', value: [text(profile, 'dpoEmail'), text(profile, 'dpoPhone')].filter(Boolean).join(' · ') },
              ]}
            />
          </Panel>
        </div>

        <aside className="grid content-start gap-6">
          <Panel title="Verification">
            <p className="text-sm leading-6 text-ink-soft">
              {status === 'verified'
                ? `Verified${verifiedAt ? ` on ${formatDate(verifiedAt)}` : ''}. The institution can search patients and add records.`
                : status === 'rejected'
                  ? 'Declined. The institution cannot add records.'
                  : 'Check the licence and contact details before verifying. Verified institutions can search patients and add records.'}
            </p>
            {text(profile, 'verificationNote') ? <p className="mt-3 rounded-xl bg-muted px-3.5 py-2.5 text-sm text-ink-soft">Note: {text(profile, 'verificationNote')}</p> : null}

            <label htmlFor="verification-note" className="mt-4 block text-sm font-medium text-foreground">
              Note to the institution <span className="font-normal text-ink-faint">(optional)</span>
            </label>
            <textarea
              id="verification-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1.5 w-full resize-y rounded-xl border border-line px-3.5 py-2.5 text-[15px]"
            />
            {actionError ? (
              <p role="alert" className="mt-2 text-sm text-danger">
                {actionError}
              </p>
            ) : null}

            <div className="mt-4 grid gap-2">
              {status !== 'verified' ? (
                <button
                  type="button"
                  onClick={() => setStatus('verified')}
                  disabled={actionPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
                >
                  <HiOutlineCheckCircle className="size-4" aria-hidden="true" />
                  Verify institution
                </button>
              ) : null}
              {status !== 'rejected' ? (
                <button
                  type="button"
                  onClick={() => setStatus('rejected')}
                  disabled={actionPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-danger hover:border-danger/40 disabled:opacity-60"
                >
                  <HiOutlineXCircle className="size-4" aria-hidden="true" />
                  {status === 'verified' ? 'Revoke verification' : 'Decline'}
                </button>
              ) : null}
              {status !== 'pending' ? (
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  disabled={actionPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-muted disabled:opacity-60"
                >
                  <HiOutlineArrowUturnLeft className="size-4" aria-hidden="true" />
                  Move back to pending
                </button>
              ) : null}
            </div>
          </Panel>

          <AccountStatusPanel user={user} />
        </aside>
      </div>
    </>
  );
}
