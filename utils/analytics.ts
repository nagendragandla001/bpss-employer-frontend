import config from 'config';
import ReactGA from 'react-ga';
import { getCookie } from 'service/cookie-manager';
import { mLog } from 'utils/logger';

declare global {
  interface Window {
    dataLayer: any;
  }
}

export const initGA = (): void => {
  mLog('GA init');
  ReactGA.initialize(config.GOOGLE_ANALYTICS_ID);
};

export const logGtagEvent = (action, ...options): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const props = {
      event: action,
      cookie_utm_source: getCookie('utm_source'),
      ...options,
    };
    mLog('Google Tag Manager Event - ', action, props);
    window.dataLayer.push(props);
  }
};

export const logPageView = (): void => {
  mLog(`GA Page Load Event: ${window.location.pathname}`);
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};

export const logEvent = (trackObj): void => {
  mLog('GA Event: ', trackObj);
  const {
    category = '', action = '', label = '', nonInteraction = false, value = 0,
  } = trackObj;
  if (category && action) {
    ReactGA.event({
      category, action, label, value, nonInteraction,
    });
  }
};

export const logException = (description = '', fatal = false): void => {
  if (description) {
    ReactGA.exception({ description, fatal });
  }
};
