import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import PageTitle from '@/components/PageTitle';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchAdminUser } from '@/rtk-base/slices/adminSlice';
import { ageFrom, formatDate } from '@/utils/dates';
import AccountStatusPanel from '../../components/AccountStatusPanel';
import { AdminHeader, ErrorBanner, Facts, ListSkeleton, Panel, text } from '../../components/AdminUi';

// /admin/users/:userId - one patient (or admin) account. Institutions open in /admin/hospitals.
export default function AdminUserDetailPage() {
  const userId = Number(useParams().userId);
  const dispatch = useAppDispatch();
  const detail = useAppSelector((state) => state.admin.userDetails[userId]);
  const { loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (userId) dispatch(fetchAdminUser(userId));
  }, [dispatch, userId]);

  if (!detail) {
    return (
      <>
        <AdminHeader title="User" back={{ to: '/admin/users', label: 'Users' }} />
        {error && !loading.detail ? <ErrorBanner message={error} onRetry={() => dispatch(fetchAdminUser(userId))} /> : <ListSkeleton rows={3} />}
      </>
    );
  }

  const { user, profile, recordCount } = detail;
  if (user.accountType === 'hospital') return <Navigate to={`/admin/hospitals/${user.id}`} replace />;

  const dob = text(profile, 'dateOfBirth');
  const age = dob ? ageFrom(dob) : null;
  const photoUrl = text(profile, 'photoUrl');
  const allergies = Array.isArray(profile?.allergies)
    ? (profile.allergies as { allergen?: string }[]).map((item) => item.allergen).filter(Boolean).join(', ')
    : null;

  return (
    <>
      <PageTitle title={user.name} />
      <AdminHeader title={user.name} description={`${user.email} · joined ${formatDate(user.createdAt)}`} back={{ to: '/admin/users', label: 'Users' }} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid min-w-0 content-start gap-6">
          <Panel title="Patient">
            <div className="mb-5 flex items-center gap-4">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="size-14 rounded-full object-cover" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
                  {user.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-accent-ink tabular-nums">{text(profile, 'fhId') ?? 'No Fidelity Health ID yet'}</p>
              </div>
            </div>
            <Facts
              items={[
                { label: 'Date of birth', value: dob ? `${formatDate(dob)}${age !== null ? ` (${age})` : ''}` : null },
                { label: 'Sex at birth', value: text(profile, 'sexAtBirth') },
                { label: 'Phone', value: text(profile, 'phone') },
                { label: 'Location', value: [text(profile, 'city'), text(profile, 'region'), text(profile, 'country')].filter(Boolean).join(', ') },
                { label: 'Blood group', value: text(profile, 'bloodGroup') },
                { label: 'Genotype', value: text(profile, 'genotype') },
                { label: 'Allergies', value: allergies || (profile?.noKnownAllergies ? 'No known allergies' : null) },
                { label: 'Next of kin', value: [text(profile, 'kinName'), text(profile, 'kinRelationship'), text(profile, 'kinPhone')].filter(Boolean).join(' · ') },
              ]}
            />
          </Panel>
          <Panel title="Records">
            <p className="text-sm text-ink-soft">
              {recordCount} {recordCount === 1 ? 'record' : 'records'} on file.{' '}
              {recordCount > 0 && text(profile, 'fhId') ? (
                <Link to={`/admin/records?q=${encodeURIComponent(text(profile, 'fhId') as string)}`} className="font-medium text-accent hover:underline">
                  View records
                </Link>
              ) : null}
            </p>
          </Panel>
        </div>
        <aside className="grid content-start gap-6">
          <AccountStatusPanel user={user} />
        </aside>
      </div>
    </>
  );
}
