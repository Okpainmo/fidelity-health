import { HiOutlineLockClosed, HiOutlineLockOpen } from 'react-icons/hi2';
import { requestConfirmation } from '@/components/ConfirmModalRoot';
import StatusBadge from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { setUserActive } from '@/rtk-base/slices/adminSlice';
import type { AdminAccountDetail } from '@/rtk-base/slices/adminSlice';
import { Panel } from './AdminUi';

// Activate / deactivate an account (admin user and institution pages).
export default function AccountStatusPanel({ user }: { user: AdminAccountDetail['user'] }) {
  const dispatch = useAppDispatch();
  const { actionPending, actionError } = useAppSelector((state) => state.admin);
  const isSelf = useAppSelector((state) => state.auth.user?.id === user.id);

  async function toggle() {
    if (user.isActive) {
      const confirmed = await requestConfirmation({
        title: `Deactivate ${user.name}?`,
        message: "They'll be signed out straight away and won't be able to log in until the account is reactivated.",
        confirmLabel: 'Deactivate',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    dispatch(setUserActive({ userId: user.id, isActive: !user.isActive }));
  }

  return (
    <Panel title="Account">
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
        {user.isAdmin ? <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-ink-soft">Admin</span> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        {user.isActive ? 'This account can sign in and use Fidelity Health.' : 'This account is deactivated and cannot sign in.'}
      </p>
      {actionError ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {actionError}
        </p>
      ) : null}
      <button
        type="button"
        onClick={toggle}
        disabled={actionPending || (isSelf && user.isActive)}
        title={isSelf && user.isActive ? "You can't deactivate your own account" : undefined}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
          user.isActive ? 'border border-line text-danger hover:border-danger/40' : 'bg-accent text-accent-foreground hover:bg-accent-hover'
        }`}
      >
        {user.isActive ? <HiOutlineLockClosed className="size-4" aria-hidden="true" /> : <HiOutlineLockOpen className="size-4" aria-hidden="true" />}
        {user.isActive ? 'Deactivate account' : 'Reactivate account'}
      </button>
    </Panel>
  );
}
