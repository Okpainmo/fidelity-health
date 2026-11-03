type Status = 'pending' | 'verified' | 'rejected' | 'active' | 'inactive';

const STYLES: Record<Status, { label: string; className: string; dot: string }> = {
  verified: { label: 'Verified', className: 'bg-accent-soft text-accent-ink', dot: 'bg-accent' },
  pending: { label: 'Pending review', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-danger', dot: 'bg-danger' },
  active: { label: 'Active', className: 'bg-accent-soft text-accent-ink', dot: 'bg-accent' },
  inactive: { label: 'Deactivated', className: 'bg-muted text-ink-soft', dot: 'bg-ink-faint' },
};

// Small coloured pill for record, verification and account statuses.
export default function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const style = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.className}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {label ?? style.label}
    </span>
  );
}
