import { useEffect, useState } from 'react';
import { HiOutlineBars3, HiOutlineViewColumns, HiOutlinePencilSquare } from 'react-icons/hi2';
import { Link, Outlet } from 'react-router';
import ChatModeToggle from '@/routes/missie/components/ChatModeToggle';
import ChatSidebar from '@/routes/missie/components/ChatSidebar';
import { useAppDispatch } from '@/rtk-base/hooks';
import { fetchConversations } from '@/rtk-base/slices/chatSlice';

const SIDEBAR_STORAGE_KEY = 'sidebarOpen';

function readSidebarPreference() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

const iconButton = 'flex size-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-muted hover:text-foreground';

// Layout for Missie (/missie/*): conversation sidebar plus the chat area.
// Sign-in is checked by <RequireAuth> in the router.
export default function MissieLayout() {
  const dispatch = useAppDispatch();
  // Desktop: sidebar shown/hidden (remembered). Mobile: slide-in drawer.
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarPreference);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load the user's chats for the sidebar.
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
    } catch {
      // Storage unavailable - the preference just won't be remembered.
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      {sidebarOpen ? (
        <aside className="hidden h-full shrink-0 md:block">
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </aside>
      ) : null}

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/25" />
          <aside className="relative h-full w-[260px] shadow-xl">
            <ChatSidebar onClose={() => setDrawerOpen(false)} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 px-2">
          {/* Mobile */}
          <button type="button" onClick={() => setDrawerOpen(true)} className={`${iconButton} md:hidden`} aria-label="Open menu">
            <HiOutlineBars3 className="size-5" />
          </button>

          {/* Desktop, sidebar hidden */}
          {!sidebarOpen ? (
            <>
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className={`${iconButton} hidden md:flex`}
                aria-label="Open sidebar"
                title="Open sidebar"
              >
                <HiOutlineViewColumns className="size-[18px]" />
              </button>
              <Link to="/missie/chat" className={`${iconButton} hidden md:flex`} aria-label="New chat" title="New chat">
                <HiOutlinePencilSquare className="size-[18px]" />
              </Link>
            </>
          ) : null}

          <div className="ml-auto pr-1">
            <ChatModeToggle />
          </div>

          <Link to="/missie/chat" className={`${iconButton} md:hidden`} aria-label="New chat">
            <HiOutlinePencilSquare className="size-[18px]" />
          </Link>
        </header>

        <main id="main" className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
