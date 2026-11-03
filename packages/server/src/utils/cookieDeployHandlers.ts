import type { Response } from 'express';
// import log from './logger.js';

export const AUTH_COOKIE_NAME = 'FidelityHealth_Auth';

/** True when a raw `Cookie` header carries the auth cookie. */
export const hasAuthCookie = (cookieHeader?: string) => !!cookieHeader?.includes(`${AUTH_COOKIE_NAME}=`);

export const deployAuthCookie = ({ authCookie }: { authCookie: string }, res: Response) => {
  res.cookie(AUTH_COOKIE_NAME, authCookie, {
    // domain: "localhost",
    // path: ""/,
    httpOnly: true,
    secure: true, // prevents man-in-the-middle attack
    sameSite: 'strict', // prevents CSRF attacks
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  // log.info(`AuthCookie: '${authCookie}' \n \n Auth cookie deployed successfully`);
};
