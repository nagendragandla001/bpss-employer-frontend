/* eslint-disable max-len */
import config from 'config';
import { ApiConstants, AppConstants } from 'constants/index';
import { get } from 'service/api-method';
import * as CookieManager from 'service/cookie-manager';
import { getDomainName } from 'utils/browser-utils';

const setAuthToken = (
  token: string,
  isRefreshToken = false,
  options?: any,
): void => {
  const { AUTH_JWT_COOKIE_NAME, AUTH_REFRESH_TOKEN } = AppConstants;
  const key = isRefreshToken ? AUTH_REFRESH_TOKEN : AUTH_JWT_COOKIE_NAME;

  CookieManager.setCookie(key, token, {
    domain: getDomainName(),
    ...options,
  });
};

const getAuthToken = (req?: any): string | undefined => CookieManager.getCookie(AppConstants.AUTH_ACCESS_COOKIE_NAME, req);

const getJwtToken = (req?: any): string | undefined => CookieManager.getCookie(AppConstants.AUTH_JWT_COOKIE_NAME, req);

const checkForAuth = (): boolean => {
  const { AUTH_ACCESS_COOKIE_NAME } = AppConstants;
  const authCookie = CookieManager.getCookie(AUTH_ACCESS_COOKIE_NAME);
  return !!authCookie; // && !!refreshToken;
};

const deleteUserCookies = (): void => {
  CookieManager.removeCookie(AppConstants.AUTH_ACCESS_COOKIE_NAME, {
    domain: config.COOKIE_DOMAIN || 'localhost',
    path: '/',
  });
  CookieManager.removeCookie('jwt', {
    domain: config.COOKIE_DOMAIN || 'localhost',
    path: '/',
  });
};

const isUserLoggedIn = async (): Promise<any> => {
  const authToken = getAuthToken();
  if (authToken) {
    const apiCall = await get(ApiConstants.USER_PROFILE, { withAuth: true, isForm: false, errorMessage: '' });
    if (apiCall) {
      const response = await apiCall.data;
      return response;
    }
    return undefined;
  }
  return undefined;
};

export {
  deleteUserCookies,
  checkForAuth,
  getAuthToken,
  getJwtToken,
  setAuthToken,
  isUserLoggedIn,
};
