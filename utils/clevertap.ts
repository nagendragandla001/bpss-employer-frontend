import RouterObject from 'routes';
import NavHistory from 'utils/NavHistory';
import { getCookie } from 'service/cookie-manager';
import { mLog } from 'utils/logger';
import { isMobile } from 'utils/constants';

declare global {
  interface Window {
    clevertap: {};
  }
}

declare let clevertap: any;

function ClevertapException(this, message): void {
  this.message = message;
  this.name = 'ClevertapException';
}

const checkUrlLength = (url: string): string => {
  let urlLength = '';
  if (url.length >= 1024) {
    urlLength = url.substring(0, 1023);
  } else {
    urlLength = url;
  }
  return urlLength;
};

export const insertSpaces = (text: string): string => {
  let inputText = text;
  inputText = inputText.replace(/([a-z])([A-Z])/g, '$1 $2');
  inputText = inputText.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return inputText;
};

export const getDefaultProps = () => {
  const history = NavHistory.get();
  const referrer = history.length > 1 ? history[history.length - 2] : '';
  const match = RouterObject.match(window.location.href);
  const utmCookies: any = [
    'utm_source',
    'utm_page',
    'utm_medium',
    'utm_campaign',
    // 'http_referer',
  ];
  const utmValues = utmCookies.map((name) => getCookie(name));
  const utmObject = utmCookies.reduce((obj, name, index) => {
    // eslint-disable-next-line
    obj[name] = utmValues[index] || 'NA';
    return obj;
  }, {});
  utmObject.http_referrer = referrer?.url || 'NA';
  let referrerPage = referrer;
  if (referrer) {
    referrerPage = checkUrlLength(referrer.url) || 'NA';
  } else if (document.referrer) {
    referrerPage = checkUrlLength(document.referrer) || 'NA';
  }
  const currentPage = match.route
    ? (insertSpaces(match.route.name))
    : null;
  const returnObject = {
    State: document.cookie.indexOf('access_token') > 0 ? 'Logged In' : 'Logged Out',
    Current_Page: currentPage || 'Unknown',
    URL: window.location.href,
    Referrer_Page: referrer ? insertSpaces(referrer.route) || '' : 'NA',
    Referrer_URL: referrerPage || 'NA',
    ...utmObject,
  };
  return returnObject;
};

export const pushClevertapEvent = (event: string, eventProps = {}): void => {
  if (typeof window !== 'undefined' && window.clevertap) {
    const mergedProps = { ...getDefaultProps(), ...eventProps };
    mLog('CleverTap Event: ', event, mergedProps);
    try {
      clevertap.event.push(event, mergedProps);
    } catch (e) {
      mLog('Clevertap Exception: ', e);
      throw new ClevertapException(e);
    }
  }
};

export const pushClevertapOnUserLogin = (userProps:
{ Name; Identity; Email; Phone }): void => {
  if (typeof window !== 'undefined' && window.clevertap) {
    const siteObj = {
      Name: userProps.Name,
      Identity: userProps.Identity,
      Email: userProps.Email,
      Phone: userProps.Phone,
    };
    if (!isMobile(userProps.Phone)) {
      delete (siteObj.Phone);
    }
    mLog('CleverTap Profile: ', siteObj);
    try {
      clevertap.onUserLogin.push({
        Site: siteObj,
      });
    } catch (e) {
      mLog('Clevertap Exception: ', e);
      throw new ClevertapException(e);
    }
  }
};

export const pushClevertapProfile = (userProps): void => {
  if (typeof window !== 'undefined' && window.clevertap) {
    mLog('Push CleverTap Profile', userProps);
    try {
      clevertap.profile.push({
        Site: {
          ...userProps,
        },
      });
    } catch (e) {
      mLog('Clevertap Exception: ', e);
      throw new ClevertapException(e);
    }
  }
};

export const pushClevertapUserProperties = (props): void => {
  if (typeof window !== 'undefined' && window.clevertap) {
    mLog('Push CleverTap User Properties', props);
    try {
      clevertap.profile.push({
        Site: {
          ...props,
        },
      });
    } catch (e) {
      mLog('Clevertap Exception: ', e);
      throw new ClevertapException(e);
    }
  }
};
