import type { Request, Response } from 'express';

/**
 * Sends the API's success envelope: `{ responseMessage, response }`, with any
 * renewed tokens from the auth middleware added to `response`.
 */
export function respondOk(req: Request, res: Response, responseMessage: string, data: Record<string, unknown> = {}, status = 200) {
  res.status(status).json({
    responseMessage,
    response: { ...data, accessToken: req.userData?.newUserAccessToken, refreshToken: req.userData?.newUserRefreshToken }
  });
}
