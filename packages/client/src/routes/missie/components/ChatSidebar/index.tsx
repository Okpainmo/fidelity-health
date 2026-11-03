import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { HiOutlineHome, HiOutlinePencil, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineViewColumns } from 'react-icons/hi2';
import { Link, NavLink, useNavigate, useParams } from 'react-router';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { deleteConversation, renameConversation } from '@/rtk-base/slices/chatSlice';
import type { ConversationSummary } from '@/rtk-base/slices/chatSlice';

type ChatSidebarProps = {
  onClose: () => void;
  // Called after picking a link, so the mobile drawer can close itself.
  onNavigate?: () => void;
};

const iconButton = 'flex size-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-hover hover:text-foreground';
const rowAction =
  'flex size-7 items-center justify-center rounded-lg text-ink-faint opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white/70';

const TITLE_MAX_LENGTH = 120;

type ConversationItemProps = {
  conversation: ConversationSummary;
  onNavigate?: () => void;
  onDelete: (id: string) => void;
};

// One chat in the list. Rename with the pencil (or a double-click): Enter or
// clicking away saves, Escape cancels.
function ConversationItem({ conversation, onNavigate, onDelete }: ConversationItemProps) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Set on Escape, so the blur that follows doesn't save the cancelled draft.
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function startEditing() {
    cancelledRef.current = false;
    setDraft(conversation.title);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    cancelledRef.current = true;
    setEditing(false);
    setError(null);
  }

  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (saving || cancelledRef.current) return;
    const title = draft.trim();
    if (!title || title === conversation.title) return cancel();

    setSaving(true);
    const result = await dispatch(renameConversation({ id: conversation.id, title }));
    setSaving(false);
    if (renameConversation.fulfilled.match(result)) setEditing(false);
    else setError(result.payload ?? 'Could not rename this chat');
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  }

  if (editing) {
    return (
      <li>
        <form onSubmit={save}>
          <label htmlFor={`rename-${conversation.id}`} className="sr-only">
            Chat title
          </label>
          <input
            id={`rename-${conversation.id}`}
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => save()}
            maxLength={TITLE_MAX_LENGTH}
            disabled={saving}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `rename-error-${conversation.id}` : undefined}
            className={`w-full rounded-xl border bg-white px-3 py-[7px] text-sm text-foreground disabled:opacity-60 ${error ? 'border-danger' : 'border-accent/50'}`}
          />
          {error ? (
            <p id={`rename-error-${conversation.id}`} role="alert" className="px-3 pt-1 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </form>
      </li>
    );
  }

  return (
    <li className="group relative">
      <NavLink
        to={`/missie/chat/${conversation.id}`}
        onClick={onNavigate}
        onDoubleClick={(e) => {
          e.preventDefault();
          startEditing();
        }}
        title={conversation.title}
        className={({ isActive }) =>
          `block truncate rounded-xl py-2 pr-16 pl-3 text-sm transition ${isActive ? 'bg-hover text-foreground' : 'text-foreground hover:bg-hover'}`
        }
      >
        {conversation.title}
      </NavLink>
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
        <button type="button" onClick={startEditing} aria-label={`Rename "${conversation.title}"`} title="Rename" className={`${rowAction} hover:text-accent-ink`}>
          <HiOutlinePencil className="size-3.5" />
        </button>
        <button type="button" onClick={() => onDelete(conversation.id)} aria-label={`Delete "${conversation.title}"`} title="Delete" className={`${rowAction} hover:text-danger`}>
          <HiOutlineTrash className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

export default function ChatSidebar({ onClose, onNavigate }: ChatSidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const conversations = useAppSelector((state) => state.chat.conversations);

  async function remove(id: string) {
    const result = await dispatch(deleteConversation(id));
    if (deleteConversation.fulfilled.match(result) && id === conversationId) navigate('/missie/chat');
  }

  return (
    <div className="flex h-full w-[260px] flex-col bg-sidebar">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <Link to="/missie/chat" onClick={onNavigate} className="flex h-9 items-center gap-2 rounded-lg px-1.5 text-foreground hover:bg-hover" aria-label="Missie, new chat">
          <Logo size={24} className="text-missie" />
          <span className="poppins text-[17px] font-semibold tracking-tight">Missie</span>
        </Link>
        <button type="button" onClick={onClose} className={iconButton} aria-label="Close sidebar" title="Close sidebar">
          <HiOutlineViewColumns className="size-[18px]" />
        </button>
      </div>

      <div className="grid gap-px px-2">
        <Link to="/missie/chat" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-hover">
          <HiOutlinePencilSquare className="size-4" />
          New chat
        </Link>
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-hover">
          <HiOutlineHome className="size-4" />
          Home
        </Link>
      </div>

      <nav className="scrollbar-thin mt-4 flex-1 overflow-y-auto px-2" aria-label="Chats">
        {conversations.length > 0 ? (
          <>
            <h2 className="px-3 pb-1 text-xs font-medium text-ink-faint">Chats</h2>
            <ul className="grid gap-px">
              {conversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} onNavigate={onNavigate} onDelete={remove} />
              ))}
            </ul>
          </>
        ) : (
          <p className="px-3 text-xs text-ink-faint">Your chats will show up here.</p>
        )}
      </nav>

      <div className="border-t border-line/70 p-2">
        <UserMenu onNavigate={onNavigate} />
      </div>
    </div>
  );
}
