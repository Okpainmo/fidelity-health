import OpenAI from 'openai';
import { aiConfig } from '../../config/index.js';
import { MISSIE_SYSTEM_PROMPT } from './missie.prompt.js';

export const MISSIE_MODEL = aiConfig.model;

export type MissieTurn = { role: 'user' | 'missie'; content: string };

export const missieClient = new OpenAI({ apiKey: aiConfig.apiKey, baseURL: aiConfig.baseUrl });

// The request shared by the full and streamed replies.
export const missieRequest = (history: MissieTurn[]) => ({
  model: MISSIE_MODEL,
  instructions: MISSIE_SYSTEM_PROMPT,
  // The model API only knows the role 'assistant', so Missie's messages are sent as that.

  // E.g.
  // [
  //   { role: 'user',      content: 'How do I share my records?' },
  //   { role: 'assistant', content: 'You can share them from…' },
  //   { role: 'user',      content: 'Can I undo that?' },
  // ]
  input: history.map(({ role, content }) => ({ role: role === 'missie' ? ('assistant' as const) : role, content })),
  max_output_tokens: 1000
});
