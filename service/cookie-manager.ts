/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Cookie from 'js-cookie';
import config from 'config';

export const setCookie = (key: string, value: string, options = {}): void => {
  const defaultExpiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  Cookie.set(key, value, {
    expires: defaultExpiryTime,
    path: '/',
    domain: config.COOKIE_DOMAIN || 'localhost',
    ...options,
  });
};

export const removeCookie = (key: string, options: any, res?: any): any => {
  if (process.browser) {
    Cookie.remove(key, {
      expires: 1,
      ...options,
    });
  } else if (res) {
    res.clearCookie(key, options);
  }
};

const getCookieFromBrowser = (key: string): any => Cookie.get(key);

const getCookieFromServer = (key: string, req: any): any => {
  if (req) {
    if (!req.headers.cookie) {
      return undefined;
    }
    const rawCookie = req.headers.cookie
      .split(';')
      .find((c) => c.trim().startsWith(`${key}=`));
    if (!rawCookie) {
      return undefined;
    }
    return rawCookie.split('=')[1];
  }
  return undefined;
};

export const getCookie = (key: string, req?: any): any => (
  process.browser ? getCookieFromBrowser(key) : getCookieFromServer(key, req)
);
