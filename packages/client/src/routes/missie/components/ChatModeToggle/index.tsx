import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { clearProfileSaveStatus, fetchProfile, saveProfile } from '@/rtk-base/slices/profileSlice';
import type { ChatMode } from '@/rtk-base/slices/chatSlice';

const MODES: { value: ChatMode; label: string; hint: string }[] = [
  { value: 'stream-response', label: 'Stream', hint: "Show Missie's reply as it's written" },
  { value: 'direct', label: 'Direct', hint: "Show Missie's reply once it's complete" },
];

// Switches how Missie's replies arrive. Saved on the user's profile as `chatMode`;
// the new mode is selected once the server has saved it.
export default function ChatModeToggle() {
  const dispatch = useAppDispatch();
  const chatMode = useAppSelector((state) => state.chat.chatMode);
  const [savingMode, setSavingMode] = useState<ChatMode | null>(null);

  // Load the saved mode once.
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  async function choose(mode: ChatMode) {
    if (mode === chatMode || savingMode) return;

    setSavingMode(mode);
    await dispatch(saveProfile({ chatMode: mode }));
    setSavingMode(null);
    // Don't leave a "Saved" notice behind for the profile page.
    dispatch(clearProfileSaveStatus());
  }

  return (
    <div role="radiogroup" aria-label="Reply mode" aria-busy={Boolean(savingMode)} className="flex rounded-lg bg-muted p-0.5 text-xs">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          role="radio"
          aria-checked={chatMode === mode.value}
          title={mode.hint}
          disabled={Boolean(savingMode)}
          onClick={() => choose(mode.value)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 transition disabled:cursor-wait ${
            chatMode === mode.value ? 'bg-white font-medium text-foreground shadow-sm' : 'text-ink-soft hover:text-foreground'
          }`}
        >
          {savingMode === mode.value ? (
            <span className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" aria-hidden="true" />
          ) : null}
          {mode.label}
        </button>
      ))}
    </div>
  );
}
