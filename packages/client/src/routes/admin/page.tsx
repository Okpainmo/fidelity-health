import { useEffect } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { HiOutlineBuildingOffice2, HiOutlineChevronRight, HiOutlineDocumentText, HiOutlineUsers } from 'react-icons/hi2';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';
import RecordRow from '@/components/RecordRow';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchAdminOverview } from '@/rtk-base/slices/adminSlice';
import { formatDate } from '@/utils/dates';
import { AdminHeader, EmptyList, ErrorBanner, ListSkeleton, Panel } from './components/AdminUi';

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  to,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  detail: string;
  to: string;
}) {
  return (
    <Link to={to} className="group rounded-3xl border border-line bg-white p-5 transition hover:border-accent/40 hover:shadow-[0_6px_24px_rgba(27,127,121,0.07)]">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft">
          <Icon className="size-5 text-accent" aria-hidden="true" />
        </span>
        <HiOutlineChevronRight className="size-4 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm text-ink-soft">{label}</p>
      <p className="poppins mt-0.5 text-[30px] leading-tight font-medium text-foreground">{value}</p>
      <p className="mt-1 text-xs text-ink-faint">{detail}</p>
    </Link>
  );
}

// /admin - platform overview.
export default function AdminOverviewPage() {
  const dispatch = useAppDispatch();
  const { overview, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminOverview());
  }, [dispatch]);

  return (
    <>
      <PageTitle title="Admin overview" />
      <AdminHeader title="Overview" description="Accounts, institutions and records across Fidelity Health." />

      {error && !overview ? <ErrorBanner message={error} onRetry={() => dispatch(fetchAdminOverview())} /> : null}

      {!overview ? (
        loading.overview ? (
          <div className="grid animate-pulse gap-4 sm:grid-cols-3" aria-busy="true" aria-label="Loading overview">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-40 rounded-3xl bg-muted" />
            ))}
          </div>
        ) : null
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={HiOutlineUsers}
              label="Accounts"
              value={overview.users.total}
              detail={`${overview.users.patients} patients · ${overview.users.hospitals} institutions · ${overview.users.signupsLast30Days} new in 30 days`}
              to="/admin/users"
            />
            <StatCard
              icon={HiOutlineBuildingOffice2}
              label="Institutions awaiting verification"
              value={overview.hospitals.pending}
              detail={`${overview.hospitals.verified} verified · ${overview.hospitals.rejected} declined`}
              to="/admin/hospitals"
            />
            <StatCard
              icon={HiOutlineDocumentText}
              label="Medical records"
              value={overview.records.total}
              detail={`${overview.records.pending} pending review · ${overview.records.lastThirtyDays} added in 30 days`}
              to="/admin/records"
            />
          </div>

          {overview.users.inactive > 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              {overview.users.inactive} deactivated {overview.users.inactive === 1 ? 'account' : 'accounts'}.{' '}
              <Link to="/admin/users?status=inactive" className="font-medium text-accent hover:underline">
                Review
              </Link>
            </p>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <Panel
              title="Awaiting verification"
              action={
                <Link to="/admin/hospitals?status=pending" className="text-sm font-medium text-accent hover:underline">
                  See all
                </Link>
              }
            >
              {overview.pendingHospitals.length === 0 ? (
                <EmptyList>No institutions are waiting for verification.</EmptyList>
              ) : (
                <ul className="divide-y divide-line">
                  {overview.pendingHospitals.map((hospital) => (
                    <li key={hospital.userId}>
                      <Link to={`/admin/hospitals/${hospital.userId}`} className="group flex items-center gap-3 py-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                          <HiOutlineBuildingOffice2 className="size-5 text-amber-700" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">{hospital.name}</span>
                          <span className="block truncate text-sm text-ink-soft">
                            {[hospital.institutionId, hospital.city, `joined ${formatDate(hospital.createdAt)}`].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        <HiOutlineChevronRight className="size-4 text-ink-faint group-hover:text-accent" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Latest records"
              action={
                <Link to="/admin/records" className="text-sm font-medium text-accent hover:underline">
                  See all
                </Link>
              }
            >
              {overview.recentRecords.length === 0 ? (
                <EmptyList>No records have been uploaded yet.</EmptyList>
              ) : (
                <ul className="grid gap-2">
                  {overview.recentRecords.map((record) => (
                    <RecordRow key={record.id} record={record} showPatient />
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}

      {loading.overview && overview ? <span className="sr-only">Refreshing</span> : null}
      {!overview && !loading.overview && !error ? <ListSkeleton /> : null}
    </>
  );
}
