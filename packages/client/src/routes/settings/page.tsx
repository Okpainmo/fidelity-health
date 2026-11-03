import PageTitle from '@/components/PageTitle';
import { useAppSelector } from '@/rtk-base/hooks';
import { useLogout } from '@/utils/useLogout';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { dateStyle: 'long' });
}

export default function SettingsPage() {
  const logOut = useLogout();
  const user = useAppSelector((state) => state.auth.user);

  const details = [
    { label: 'Name', value: user?.name || '—' },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Member since', value: formatDate(user?.createdAt) },
  ];

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-5 pt-10 pb-20 sm:pt-14">
        <PageTitle title="Settings" />
        <h1 className="poppins text-[32px] leading-tight font-medium tracking-tight sm:text-[38px]">Settings</h1>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Account</h2>
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {details.map((item) => (
              <div key={item.label} className="flex flex-wrap items-center justify-between gap-2 py-4 text-[15px]">
                <dt className="text-foreground">{item.label}</dt>
                <dd className="break-all text-ink-soft">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-ink-faint">Session</h2>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
            <div>
              <p className="text-[15px] text-foreground">Log out on this device</p>
              <p className="text-sm text-ink-faint">You'll need to log in again to keep chatting.</p>
            </div>
            {/* Asks for confirmation, then logs out and goes to /login. */}
            <button
              type="button"
              onClick={logOut}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
