import { useEffect, useState } from 'react';
import { HiOutlineChevronRight } from 'react-icons/hi2';
import { Link } from 'react-router';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchAdminUsers } from '@/rtk-base/slices/adminSlice';
import { formatDate } from '@/utils/dates';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import { AdminHeader, EmptyList, ErrorBanner, FilterPills, ListSkeleton, SearchInput } from '../components/AdminUi';
import { useUrlFilter } from '../useUrlFilter';

const TYPES = ['all', 'patient', 'hospital', 'admin'] as const;
const STATUSES = ['all', 'active', 'inactive'] as const;

const TYPE_LABEL = { patient: 'Patient', hospital: 'Institution' } as const;

// /admin/users - every account.
export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.admin);
  const [type, setType] = useUrlFilter('type', TYPES, 'all');
  const [status, setStatus] = useUrlFilter('status', STATUSES, 'all');
  const [query, setQuery] = useState('');
  const q = useDebouncedValue(query.trim());

  const filters = { type: type === 'all' ? undefined : type, status: status === 'all' ? undefined : status, q: q || undefined };
  useEffect(() => {
    dispatch(fetchAdminUsers({ type: type === 'all' ? undefined : type, status: status === 'all' ? undefined : status, q: q || undefined }));
  }, [dispatch, type, status, q]);

  return (
    <>
      <PageTitle title="Users" />
      <AdminHeader title="Users" description="Patients, institutions and admins." />

      <div className="mb-5 grid gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, Fidelity Health ID or institution ID" />
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <FilterPills
            label="Account type"
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: 'All accounts' },
              { value: 'patient', label: 'Patients' },
              { value: 'hospital', label: 'Institutions' },
              { value: 'admin', label: 'Admins' },
            ]}
          />
          <FilterPills
            label="Account status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Any status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Deactivated' },
            ]}
          />
        </div>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchAdminUsers(filters))} /> : null}

      {loading.users && users.length === 0 ? (
        <ListSkeleton />
      ) : users.length === 0 ? (
        <EmptyList>No accounts match.</EmptyList>
      ) : (
        <ul className="grid gap-2" aria-busy={loading.users || undefined}>
          {users.map((user) => (
            <li key={user.id}>
              <Link
                to={user.accountType === 'hospital' ? `/admin/hospitals/${user.id}` : `/admin/users/${user.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-accent/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink">
                  {user.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{user.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-ink-soft">{TYPE_LABEL[user.accountType]}</span>
                    {user.isAdmin ? <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-ink">Admin</span> : null}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-soft">{[user.email, user.publicId].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="hidden shrink-0 text-right sm:block">
                  <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                  <span className="mt-1 block text-xs text-ink-faint">
                    {user.recordCount} {user.recordCount === 1 ? 'record' : 'records'} · joined {formatDate(user.createdAt)}
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
