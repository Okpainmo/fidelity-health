// Fields returned to the client for conversations and messages.
export const conversationFields = { id: true, title: true, updatedAt: true } as const;
export const messageFields = { id: true, role: true, content: true, createdAt: true } as const;
