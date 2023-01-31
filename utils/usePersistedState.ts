import React from 'react';
import dayjs from 'moment';
import { AppConstants } from 'constants/index';
import { mError } from 'utils/logger';

const ONE_DAY_EXPIRY = dayjs().add(1, 'd');

const usePersistedState = (key: string,
  defaultValue: string | any,
  expiryDate = ONE_DAY_EXPIRY): Array<any> => {
  const [state, setState] = React.useState(() => {
    const persistedState = localStorage.getItem(key);
    if (persistedState) {
      const localStorageItem = JSON.parse(persistedState);
      if (localStorageItem && !localStorageItem.expiry) {
        window.localStorage.setItem(key, JSON.stringify({
          value: localStorageItem.value ? localStorageItem.value : defaultValue,
          expiry: expiryDate,
        }));
      } else if (localStorageItem && localStorageItem.expiry) {
        return dayjs() > dayjs(localStorageItem.expiry) ? defaultValue : localStorageItem.value;
      }
      return localStorageItem.value ? localStorageItem.value : defaultValue;
    }
    return defaultValue;
  });
  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify({ value: state, expiry: expiryDate }));
  }, [state, key]);
  React.useEffect(() => {
    if (!AppConstants.LOCAL_STORAGE_ITEM_KEYS.includes(key)) {
      mError('Please add the key to the Local storage item keys in constants');
    }
  }, [key]);
  return [state, setState];
};

export default usePersistedState;
