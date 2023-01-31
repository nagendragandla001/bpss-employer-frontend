import debounce from 'lodash/debounce';

const has = (object, path:string):boolean => {
  const dotIndex = path.indexOf('.');
  if (dotIndex === -1 && object[path]) {
    return true;
  }
  const subPath = path.slice(0, dotIndex);
  if (dotIndex !== -1 && object[subPath]) {
    return has(object[subPath], path.slice(dotIndex + 1, path.length));
  }
  return false;
};

const CurrencyFormatter = (value: number, decimals = 0): string => {
  const format = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: decimals,
  });
  return format.format(value);
};

const NumberFormatter = (value: number, decimals = 0): string => {
  const format = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
  });
  return format.format(value);
};

const Debounce = (callback): any => (debounce(callback, 300));

const getManagerType = (managers, userId): string => {
  const loggedInUser = managers?.find((manager) => manager?.user?.id === userId);
  return loggedInUser?.type;
};

/** Function to check if api has returned success response based on response code
 * @param {number} status - status code of api response
 * @returns {boolean} - according to success or failure
 */
const isApiSuccessful = (status: number): boolean => ([200, 201, 202]?.includes(status));

export {
  has, CurrencyFormatter, NumberFormatter, Debounce, getManagerType, isApiSuccessful,
};
