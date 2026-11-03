import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../config/index.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import type { MissieStreamAuth } from '../schema/missie.schema.js';

type JwtPayloadSpecs = { userId: string; userEmail: string };

export type MissieStreamUser = { id: number; name: string; email: string; accountType: 'patient' | 'hospital' };

type AuthResult = { ok: true; user: MissieStreamUser } | { ok: false; reason: 'unauthorized' | 'session_expired'; message: string };

/**
 * Same checks as the sessions + access middlewares, for a WebSocket client:
 * the user's session (refresh token) must be live and the access token must be
 * theirs. An expired access token is accepted while the session is live, as on
 * HTTP. Tokens aren't renewed here; the client's next HTTP request renews them.
 */
export async function authenticateMissieStream({ email, accessToken }: MissieStreamAuth): Promise<AuthResult> {
  const user = await findUser({ email });
  if (!user || !user.isActive) return { ok: false, reason: 'unauthorized', message: 'user not found or inactive' };
  if (!user.refreshToken) return { ok: false, reason: 'unauthorized', message: 'session not found, please re-authenticate' };

  try {
    jwt.verify(user.refreshToken, jwtConfig.secret);
  } catch {
    return { ok: false, reason: 'session_expired', message: 'user session is expired, please re-authenticate' };
  }

  try {
    const payload = jwt.verify(accessToken, jwtConfig.secret, { ignoreExpiration: true }) as JwtPayloadSpecs;
    if (payload.userEmail !== user.email) return { ok: false, reason: 'unauthorized', message: 'user credentials do not match' };
  } catch {
    return { ok: false, reason: 'unauthorized', message: 'invalid access token' };
  }

  return { ok: true, user: { id: user.id, name: user.name, email: user.email, accountType: user.accountType } };
}
