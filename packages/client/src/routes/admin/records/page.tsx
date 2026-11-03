import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import PageTitle from '@/components/PageTitle';
import RecordRow from '@/components/RecordRow';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchAdminRecords } from '@/rtk-base/slices/adminSlice';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import { AdminHeader, EmptyList, ErrorBanner, FilterPills, ListSkeleton, SearchInput } from '../components/AdminUi';
import { useUrlFilter } from '../useUrlFilter';

const STATUSES = ['all', 'pending', 'verified', 'rejected'] as const;

// /admin/records - every medical record on the platform.
export default function AdminRecordsPage() {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector((state) => state.admin);
  const [status, setStatus] = useUrlFilter('status', STATUSES, 'all');
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const q = useDebouncedValue(query.trim());

  const filters = { status: status === 'all' ? undefined : status, q: q || undefined };
  useEffect(() => {
    dispatch(fetchAdminRecords({ status: status === 'all' ? undefined : status, q: q || undefined }));
  }, [dispatch, status, q]);

  return (
    <>
      <PageTitle title="All records" />
      <AdminHeader title="Records" description="Every medical record submitted by partner institutions." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search title, clinician, patient, Fidelity Health ID or institution" />
        <FilterPills
          label="Record status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchAdminRecords(filters))} /> : null}

      {loading.records && records.length === 0 ? (
        <ListSkeleton />
      ) : records.length === 0 ? (
        <EmptyList>No records match.</EmptyList>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-faint" aria-live="polite">
            {records.length} {records.length === 1 ? 'record' : 'records'}
            {records.length >= 200 ? ' (showing the latest 200; narrow the search to see more)' : ''}
          </p>
          <ul className="grid gap-2" aria-busy={loading.records || undefined}>
            {records.map((record) => (
              <RecordRow key={record.id} record={record} showPatient />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
