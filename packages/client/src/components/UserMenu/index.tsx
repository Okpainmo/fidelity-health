import { useEffect, useRef, useState } from 'react';
import { HiOutlineArrowRightStartOnRectangle, HiOutlineCog6Tooth, HiOutlineHome, HiOutlineInformationCircle, HiOutlineShieldCheck, HiOutlineUserCircle } from 'react-icons/hi2';
import { Link } from 'react-router';
import { useAppSelector } from '@/rtk-base/hooks';
import { useLogout } from '@/utils/useLogout';

function initialsOf(name?: string | null, email?: string) {
  const source = name?.trim() || email || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}

type UserMenuProps = {
  // "sidebar": full-width button at the bottom of the chat sidebar, menu opens up.
  // "header": avatar-only button in the top navigation, menu opens down.
  variant?: 'sidebar' | 'header';
  onNavigate?: () => void;
};

// Account button and its menu (settings, about, log out).
export default function UserMenu({ variant = 'sidebar', onNavigate }: UserMenuProps) {
  const logOut = useLogout();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isHeader = variant === 'header';

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  const itemClass = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-muted';
  const avatar = (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
      {initialsOf(user?.name, user?.email)}
    </span>
  );

  return (
    <div ref={rootRef} className="relative">
      {open ? (
        <div
          role="menu"
          className={`absolute z-30 rounded-2xl border border-line bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
            isHeader ? 'top-full right-0 mt-2 w-60' : 'inset-x-0 bottom-full mb-2'
          }`}
        >
          <div className="px-3 pt-1.5 pb-2">
            {isHeader && user?.name ? <p className="truncate text-sm font-medium text-foreground">{user.name}</p> : null}
            <p className="truncate text-xs text-ink-faint">{user?.email}</p>
          </div>
          {!isHeader ? (
            <Link role="menuitem" to="/" onClick={close} className={itemClass}>
              <HiOutlineHome className="size-4 text-ink-soft" />
              Home
            </Link>
          ) : null}
          {user?.isAdmin ? (
            <Link role="menuitem" to="/admin" onClick={close} className={itemClass}>
              <HiOutlineShieldCheck className="size-4 text-ink-soft" />
              Admin dashboard
            </Link>
          ) : null}
          <Link role="menuitem" to="/profile" onClick={close} className={itemClass}>
            <HiOutlineUserCircle className="size-4 text-ink-soft" />
            {user?.accountType === 'hospital' ? 'Institution profile' : 'My profile'}
          </Link>
          <Link role="menuitem" to="/settings" onClick={close} className={itemClass}>
            <HiOutlineCog6Tooth className="size-4 text-ink-soft" />
            Settings
          </Link>
          <Link role="menuitem" to="/about" onClick={close} className={itemClass}>
            <HiOutlineInformationCircle className="size-4 text-ink-soft" />
            About
          </Link>
          <div className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              close();
              logOut();
            }}
            className={itemClass}
          >
            <HiOutlineArrowRightStartOnRectangle className="size-4 text-ink-soft" />
            Log out
          </button>
        </div>
      ) : null}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isHeader ? 'Account menu' : undefined}
        onClick={() => setOpen((value) => !value)}
        className={
          isHeader
            ? 'flex rounded-full transition hover:opacity-85'
            : 'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-hover'
        }
      >
        {avatar}
        {!isHeader ? <span className="truncate text-sm font-medium text-foreground">{user?.name || user?.email}</span> : null}
      </button>
    </div>
  );
}
