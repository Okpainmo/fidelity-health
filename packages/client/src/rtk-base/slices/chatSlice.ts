import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance, { extractErrorMessage } from '@/utils/axiosBase';
import type { ApiEnvelope } from '@/utils/axiosBase';
import { streamMissieChat } from '@/utils/missieStream';
import type { StreamStart } from '@/utils/missieStream';
import type { AppDispatch, RootState } from '../store';
import { forceLoggedOut, logout } from './authSlice';
import { fetchProfile, saveProfile } from './profileSlice';

// ----------------------------------------------------------------
// Missie chat. Conversations are stored on the server (/missie/conversations).
// Replies come back in one of two ways, set by the profile's `chatMode`:
//   'stream-response' - streamed in over a WebSocket (utils/missieStream.ts)
//   'direct'          - the whole reply at once from POST /missie/chat
// ----------------------------------------------------------------
export interface ChatMessage {
  id: string;
  role: 'user' | 'missie';
  content: string;
  createdAt: string;
}

export type ChatMode = 'direct' | 'stream-response';

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatState {
  // How replies arrive. Loaded from, and saved to, the user's profile.
  chatMode: ChatMode;
  // Newest first, as shown in the sidebar.
  conversations: ConversationSummary[];
  // Messages of each opened conversation, by conversation id.
  messages: Record<string, ChatMessage[]>;
  isLoadingConversation: boolean;
  isSending: boolean;
  sendError: string | null;
}

const initialState: ChatState = {
  chatMode: 'stream-response',
  conversations: [],
  messages: {},
  isLoadingConversation: false,
  isSending: false,
  sendError: null,
};

// Stand-ins shown until the server answers: the user's message, and Missie's reply.
const PENDING_USER_ID = 'pending-user';
export const PENDING_REPLY_ID = 'pending-reply';

// ── API calls ────────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk<ConversationSummary[], void, { rejectValue: string }>(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiEnvelope<{ conversations: ConversationSummary[] }>>('/missie/conversations');
      return data.response?.conversations ?? [];
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not load your chats'));
    }
  },
);

type FullConversation = ConversationSummary & { messages: ChatMessage[] };

export const fetchConversation = createAsyncThunk<FullConversation, string, { rejectValue: string }>(
  'chat/fetchConversation',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiEnvelope<{ conversation: FullConversation }>>(`/missie/conversations/${id}`);
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not open this chat');
      return data.response.conversation;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not open this chat'));
    }
  },
);

export const deleteConversation = createAsyncThunk<string, string, { rejectValue: string }>(
  'chat/deleteConversation',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/missie/conversations/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not delete this chat'));
    }
  },
);

export const renameConversation = createAsyncThunk<ConversationSummary, { id: string; title: string }, { rejectValue: string }>(
  'chat/renameConversation',
  async ({ id, title }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch<ApiEnvelope<{ conversation: ConversationSummary }>>(`/missie/conversations/${id}`, { title });
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not rename this chat');
      return data.response.conversation;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not rename this chat'));
    }
  },
);

interface DirectChatResponse extends StreamStart {
  reply: ChatMessage;
}

// Sends a message and puts Missie's reply into the store, streamed or direct.
// `onStart` gets the conversation id (new or existing) as soon as the server has it.
export const sendMessage =
  (message: string, conversationId?: string, onStart?: (conversationId: string) => void) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    let id = conversationId ?? '';
    dispatch(sendStarted({ conversationId, content: message }));

    if (getState().chat.chatMode === 'direct') {
      axiosInstance
        .post<ApiEnvelope<DirectChatResponse>>('/missie/chat', { message, conversationId })
        .then(({ data }) => {
          const { conversation, userMessage, reply } = data.response!;
          dispatch(replyStarted({ conversation, userMessage }));
          onStart?.(conversation.id);
          dispatch(replyFinished({ conversationId: conversation.id, reply }));
        })
        .catch((err) => dispatch(replyFailed({ conversationId: id, error: extractErrorMessage(err, 'Missie could not reply') })));
      return;
    }

    streamMissieChat(
      { message, conversationId },
      {
        onStart: (start) => {
          id = start.conversation.id;
          dispatch(replyStarted(start));
          onStart?.(id);
        },
        onDelta: (delta) => dispatch(replyDelta({ conversationId: id, delta })),
        onDone: (reply) => dispatch(replyFinished({ conversationId: id, reply })),
        onError: (error) => dispatch(replyFailed({ conversationId: id, error })),
      },
    );
  };

// ── Slice ────────────────────────────────────────────────────────────

const withoutPending = (messages: ChatMessage[] = []) => messages.filter((m) => m.id !== PENDING_USER_ID && m.id !== PENDING_REPLY_ID);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Shows the message straight away in an open chat, with Missie's reply pending.
    sendStarted: (state, action: PayloadAction<{ conversationId?: string; content: string }>) => {
      const { conversationId, content } = action.payload;
      state.isSending = true;
      state.sendError = null;
      if (!conversationId) return;

      const now = new Date().toISOString();
      state.messages[conversationId] = [
        ...(state.messages[conversationId] ?? []),
        { id: PENDING_USER_ID, role: 'user', content, createdAt: now },
        { id: PENDING_REPLY_ID, role: 'missie', content: '', createdAt: now },
      ];
    },
    // The server saved the user's message: show it, plus an empty reply to fill in.
    replyStarted: (state, action: PayloadAction<StreamStart>) => {
      const { conversation, userMessage } = action.payload;
      const pendingReply: ChatMessage = { id: PENDING_REPLY_ID, role: 'missie', content: '', createdAt: userMessage.createdAt };

      state.conversations = state.conversations.filter((c) => c.id !== conversation.id);
      state.conversations.unshift({ id: conversation.id, title: conversation.title, updatedAt: userMessage.createdAt });
      state.messages[conversation.id] = [...withoutPending(state.messages[conversation.id]), userMessage, pendingReply];
    },
    replyDelta: (state, action: PayloadAction<{ conversationId: string; delta: string }>) => {
      const reply = state.messages[action.payload.conversationId]?.find((m) => m.id === PENDING_REPLY_ID);
      if (reply) reply.content += action.payload.delta;
    },
    replyFinished: (state, action: PayloadAction<{ conversationId: string; reply: ChatMessage }>) => {
      const { conversationId, reply } = action.payload;
      state.messages[conversationId] = [...withoutPending(state.messages[conversationId]), reply];
      state.isSending = false;
    },
    replyFailed: (state, action: PayloadAction<{ conversationId: string; error: string }>) => {
      const { conversationId, error } = action.payload;
      if (state.messages[conversationId]) state.messages[conversationId] = withoutPending(state.messages[conversationId]);
      state.isSending = false;
      state.sendError = error;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(fetchConversation.pending, (state) => {
        state.isLoadingConversation = true;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.messages[action.payload.id] = action.payload.messages;
        state.isLoadingConversation = false;
      })
      .addCase(fetchConversation.rejected, (state) => {
        state.isLoadingConversation = false;
      })
      .addCase(renameConversation.fulfilled, (state, action) => {
        const conversation = state.conversations.find((c) => c.id === action.payload.id);
        if (conversation) conversation.title = action.payload.title;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter((c) => c.id !== action.payload);
        delete state.messages[action.payload];
      })
      // Conversations belong to the signed-in user.
      .addCase(logout, () => initialState)
      .addCase(forceLoggedOut, () => initialState)
      // The reply mode follows the profile, whenever it's loaded or saved.
      .addMatcher(isAnyOf(fetchProfile.fulfilled, saveProfile.fulfilled), (state, action) => {
        state.chatMode = action.payload.profile.chatMode === 'direct' ? 'direct' : 'stream-response';
      });
  },
});

const { sendStarted, replyStarted, replyDelta, replyFinished, replyFailed } = chatSlice.actions;

export default chatSlice.reducer;
