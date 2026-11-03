import { missieClient, missieRequest, type MissieTurn } from '../../../utils/missie/missie.client.js';

/** Returns Missie's full reply. */
export async function generateMissieReply(history: MissieTurn[]) {
  const response = await missieClient.responses.create(missieRequest(history));
  return response.output_text;
}
