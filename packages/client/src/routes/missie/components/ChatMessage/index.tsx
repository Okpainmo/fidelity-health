import { lazy, Suspense } from 'react';
import type { ChatMessage as ChatMessageType } from '@/rtk-base/slices/chatSlice';
import CopyButton from '../CopyButton';

// The markdown renderer (with syntax highlighting) is large, so it's loaded
// on first use; until then the reply shows as plain text.
const MarkdownContent = lazy(() => import('../MarkdownContent'));

function PlainText({ text }: { text: string }) {
  return <p className="text-base leading-7 whitespace-pre-wrap break-words text-foreground">{text}</p>;
}

// User messages sit in a soft bubble on the right, as typed (plain text).
// Missie's replies are rendered markdown across the column, with actions underneath.
export default function ChatMessage({ message, streaming = false }: { message: ChatMessageType; streaming?: boolean }) {
  if (message.role === 'user') {
    return (
      <div className="group flex flex-col items-end">
        <p className="max-w-[80%] rounded-3xl bg-missie-soft px-5 py-2.5 text-base leading-7 whitespace-pre-wrap break-words text-foreground">
          {message.content}
        </p>
        <div className="mt-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <CopyButton text={message.content} />
        </div>
      </div>
    );
  }

  // Missie's reply before its first words arrive.
  if (!message.content) {
    return (
      <div className="flex h-7 items-center gap-1" aria-label="Missie is replying">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="size-2 animate-bounce rounded-full bg-missie/60" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start" aria-busy={streaming || undefined}>
      <div className="w-full">
        <Suspense fallback={<PlainText text={message.content} />}>
          <MarkdownContent>{message.content}</MarkdownContent>
        </Suspense>
      </div>
      {/* Copy once the reply is complete. */}
      {!streaming ? (
        <div className="mt-1 -ml-1.5">
          <CopyButton text={message.content} />
        </div>
      ) : null}
    </div>
  );
}
