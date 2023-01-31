/* eslint-disable camelcase */
import { getCookie } from 'service/cookie-manager';
import NavHistory from 'utils/NavHistory';
import RouterObject from 'routes';

interface UtmObject {
  utm_source?: string;
  utm_page?: string;
  utm_medium?: string;
  utm_campaign?: string;
  http_referer?: string;
}

const getDomainName = (hostname?): string => (process.browser ? window.location.hostname.split('.')
  .slice(-2)
  .join('.') : hostname.split('.').slice(-2).join('.'));

const getAccessToken = (): string|null => {
  const accessToken = getCookie('access_token') || null;
  return accessToken;
};

const getMarketingSource = (): UtmObject => {
  const utmCookies = [
    'utm_source',
    'utm_page',
    'utm_medium',
    'utm_campaign',
    'http_referer',
  ];
  const utmValues = utmCookies.map((name) => getCookie(name));
  const utmObject: UtmObject = utmCookies.reduce((obj, name, index) => {
    const flatObj = { ...obj, [name]: utmValues[index] };
    return flatObj;
  }, {});
  const history = NavHistory.get();
  const referrer = history.length > 1 ? history[history.length - 2] : '';
  const match = RouterObject.match(window.location.href);
  if (referrer) {
    utmObject.http_referer = referrer ? referrer.route || '' : 'NA';
  }
  if (match) {
    utmObject.utm_page = match.route ? match.route.name : 'NA';
  }
  return utmObject;
};

export { getDomainName, getAccessToken, getMarketingSource };
