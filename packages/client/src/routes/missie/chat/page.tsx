import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import ChatComposer from '@/routes/missie/components/ChatComposer';
import ChatMessage from '@/routes/missie/components/ChatMessage';
import PageTitle from '@/components/PageTitle';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { fetchConversation, PENDING_REPLY_ID, sendMessage } from '@/rtk-base/slices/chatSlice';

// Handles both /missie/chat (new conversation) and /missie/chat/:conversationId.
export default function ChatPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const messages = useAppSelector((state) => (conversationId ? state.chat.messages[conversationId] : undefined));
  const title = useAppSelector((state) => state.chat.conversations.find((c) => c.id === conversationId)?.title);
  const { isSending, sendError, isLoadingConversation } = useAppSelector((state) => state.chat);
  const firstName = useAppSelector((state) => state.auth.user?.name?.trim().split(/\s+/)[0]);
  const endRef = useRef<HTMLDivElement>(null);

  // Opening a saved chat (e.g. from the sidebar or after a refresh): load its messages.
  // Unknown or deleted chats go back to a new chat.
  const isLoaded = Boolean(messages);
  useEffect(() => {
    if (!conversationId || isLoaded) return;
    dispatch(fetchConversation(conversationId))
      .unwrap()
      .catch(() => navigate('/missie/chat', { replace: true }));
  }, [conversationId, isLoaded, dispatch, navigate]);

  // Keep the latest message in view, including while a reply streams in.
  const lastContent = messages?.at(-1)?.content;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length, lastContent]);

  function send(content: string) {
    // A new chat moves to its own URL as soon as the server creates it.
    dispatch(sendMessage(content, conversationId, (id) => !conversationId && navigate(`/missie/chat/${id}`)));
  }

  const errorNote = sendError ? <p className="mb-2 text-center text-sm text-danger">{sendError}</p> : null;

  // New chat: greeting and composer, centred on the page.
  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-[12vh]">
        <PageTitle title="New chat" />
        <h1 className="poppins mb-8 text-center text-[28px] font-medium tracking-tight text-foreground">
          {firstName ? `What's on your mind, ${firstName}?` : 'What can I help with?'}
        </h1>
        <div className="w-full max-w-3xl">
          {errorNote}
          <ChatComposer onSend={send} disabled={isSending} autoFocus />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageTitle title={title ?? 'Chat'} />
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 pt-4 pb-10">
          {!messages && isLoadingConversation ? <p className="text-center text-sm text-ink-faint">Loading chat…</p> : null}
          {messages?.map((message) => (
            <ChatMessage key={message.id} message={message} streaming={message.id === PENDING_REPLY_ID} />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-3">
        {errorNote}
        <ChatComposer key={conversationId} onSend={send} disabled={isSending || !messages} autoFocus />
        <p className="mt-2 text-center text-xs text-ink-faint">Missie can make mistakes and doesn't give medical advice.</p>
      </div>
    </div>
  );
}
