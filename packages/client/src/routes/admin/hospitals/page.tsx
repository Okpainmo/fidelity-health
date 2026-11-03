import { useEffect, useState } from 'react';
import { HiOutlineBuildingOffice2, HiOutlineChevronRight } from 'react-icons/hi2';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchAdminHospitals } from '@/rtk-base/slices/adminSlice';
import { formatDate } from '@/utils/dates';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import { AdminHeader, EmptyList, ErrorBanner, FilterPills, ListSkeleton, SearchInput } from '../components/AdminUi';
import { useUrlFilter } from '../useUrlFilter';

const STATUSES = ['all', 'pending', 'verified', 'rejected'] as const;

// /admin/hospitals - partner institutions and their verification.
export default function AdminHospitalsPage() {
  const dispatch = useAppDispatch();
  const { hospitals, loading, error } = useAppSelector((state) => state.admin);
  const [status, setStatus] = useUrlFilter('status', STATUSES, 'all');
  const [query, setQuery] = useState('');
  const q = useDebouncedValue(query.trim());

  const load = () => dispatch(fetchAdminHospitals({ status: status === 'all' ? undefined : status, q: q || undefined }));
  useEffect(() => {
    dispatch(fetchAdminHospitals({ status: status === 'all' ? undefined : status, q: q || undefined }));
  }, [dispatch, status, q]);

  return (
    <>
      <PageTitle title="Institutions" />
      <AdminHeader title="Institutions" description="Hospitals and medical institutions. Only verified institutions can add records." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, institution ID, licence or city" />
        <FilterPills
          label="Verification status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Declined' },
          ]}
        />
      </div>

      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {loading.hospitals && hospitals.length === 0 ? (
        <ListSkeleton />
      ) : hospitals.length === 0 ? (
        <EmptyList>No institutions match.</EmptyList>
      ) : (
        <ul className="grid gap-2" aria-busy={loading.hospitals || undefined}>
          {hospitals.map((hospital) => (
            <li key={hospital.userId}>
              <Link
                to={`/admin/hospitals/${hospital.userId}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-accent/40"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                  <HiOutlineBuildingOffice2 className="size-5 text-accent" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{hospital.name}</span>
                    {!hospital.isActive ? <StatusBadge status="inactive" /> : null}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-soft">
                    {[hospital.institutionId, hospital.institutionType, [hospital.city, hospital.region].filter(Boolean).join(', '), hospital.email].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="hidden shrink-0 text-right sm:block">
                  <StatusBadge status={hospital.verificationStatus} label={hospital.verificationStatus === 'rejected' ? 'Declined' : hospital.verificationStatus === 'pending' ? 'Pending' : undefined} />
                  <span className="mt-1 block text-xs text-ink-faint">
                    {hospital.recordCount} {hospital.recordCount === 1 ? 'record' : 'records'} · joined {formatDate(hospital.createdAt)}
                  </span>
                </span>
                <HiOutlineChevronRight className="size-5 shrink-0 text-ink-faint group-hover:text-accent" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
