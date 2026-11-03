import { missieClient, missieRequest, type MissieTurn } from '../../../utils/missie/missie.client.js';

/** Yields Missie's reply as text chunks. Abort with `signal` to stop. */
export async function* streamMissieReply(history: MissieTurn[], signal?: AbortSignal) {
  const stream = await missieClient.responses.create({ ...missieRequest(history), stream: true }, { signal });

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') yield event.delta;
  }
}
