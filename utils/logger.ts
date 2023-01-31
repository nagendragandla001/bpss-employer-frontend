import config from 'config';

const myLogger = (type) => (...args: Array<any>): void => {
  if (config.IS_PROD === 'false') {
    (console as any)[type](...args);
  }
};

export const mLog = (...args): void => {
  myLogger('log')(...args);
};

export const mWarn = (...args): void => {
  myLogger('warn')(...args);
};

export const mError = (...args): void => {
  myLogger('error')(...args);
};
