import type { ReactNode } from 'react';

type ProfileHeaderProps = {
  initials: string;
  photoUrl?: string | null;
  name: string;
  idLabel: string;
  idValue: string;
  email: string;
  memberSince?: string;
  badge: ReactNode;
};

// Summary card at the top of a profile page.
export default function ProfileHeader({ initials, photoUrl, name, idLabel, idValue, email, memberSince, badge }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-accent-soft via-white to-white p-6 ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
      {photoUrl ? (
        <img src={photoUrl} alt="" className="size-20 shrink-0 rounded-full object-cover ring-4 ring-white" />
      ) : (
        <span className="poppins flex size-20 shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-medium text-accent-foreground">
          {initials}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">{badge}</div>
        <h1 className="poppins mt-2 truncate text-[28px] leading-tight font-medium tracking-tight sm:text-[32px]">{name}</h1>
        <p className="mt-1 truncate text-ink-soft">{email}</p>
      </div>
      <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-1 text-sm sm:block sm:text-right">
        <div>
          <dt className="text-ink-faint">{idLabel}</dt>
          <dd className="font-semibold text-accent-ink tabular-nums">{idValue}</dd>
        </div>
        {memberSince ? (
          <div className="sm:mt-3">
            <dt className="text-ink-faint">Member since</dt>
            <dd className="font-medium text-foreground">{memberSince}</dd>
          </div>
        ) : null}
      </dl>
    </header>
  );
}
