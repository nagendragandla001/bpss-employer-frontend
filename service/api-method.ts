/* eslint-disable import/no-cycle */
import { getAuthToken, getJwtToken } from 'service/auth-service';
import router from 'routes';
import { isMobile } from 'mobile-device-detect';
import axios from 'axios';
import errorStore from 'stores/ErrorStoreRxjs';

export const getHeaders = (withAuth: boolean): unknown => {
  const accessToken = getAuthToken();
  const authHeader = {
    Authorization: `Bearer ${accessToken}`,
  };
  const commonHeaders = {
    'Content-Type': 'application/json',
    'X-AJClient': isMobile ? 'MobileWeb.Employer' : 'DesktopWeb.Employer',
    'X-AJ-PLATFORM': '0',

  };
  if (withAuth) {
    return Object.assign(commonHeaders, authHeader);
  }
  return commonHeaders;
};

export const getGraphqlHeaders = (auth: boolean): unknown => {
  const jwtToken = getJwtToken();
  const authHeader = {
    Authorization: `Bearer ${jwtToken}`,
  };
  const commonHeaders = {
    'X-AJClient': isMobile ? 'MobileWeb.Employer' : 'DesktopWeb.Employer',
    'X-AJ-PLATFORM': '0',
  };
  if (auth) {
    return Object.assign(commonHeaders, authHeader);
  }
  return commonHeaders;
};

const initAxiosInterceptor = () => {
  axios.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(error),
  );
};

let axiosInterceptor: any = null;

const axiosCall = async (url, requestOptions) => {
  const tempOptions = requestOptions;
  let errorObj = errorStore.intitialState;
  const updateErrorObj = (newErrorObj) => {
    errorObj = {
      ...errorObj,
      errorCode: newErrorObj.errorCode,
      errorMessage: newErrorObj.errorMessage,
    };
  };
  errorStore.subscribe(updateErrorObj);
  errorStore.init();

  if (axiosInterceptor === null) {
    axiosInterceptor = initAxiosInterceptor();
  }

  try {
    const axiosAPICall = await axios.request({
      url,
      method: requestOptions.method,
      headers: requestOptions.headers,
      data: requestOptions.body,
    });
    if (axiosAPICall) {
      return axiosAPICall;
    }
    return null;
  } catch (err: any) {
    if (err?.response === undefined) {
      errorStore.updateError({
        errorCode: 418,
        errorMessage: 'Please try again after some time',
        errorType: 'Internal Server Error',
      });
    } else if (err?.response?.status === 401
      && router?.Router?.asPath?.startsWith('/employer-zone/')) {
      router.Router.pushRoute('logout');
    } else if (!requestOptions?.isForm) {
      let errorMessage = err?.response?.data?.message;
      if (errorMessage?.includes('[') && errorMessage?.indexOf('[') === 0) {
        errorMessage = JSON.parse(errorMessage?.replace(/'/g, '"'));
      }
      errorStore.updateError({
        errorCode: err?.response?.data?.code,
        errorMessage: requestOptions?.errorMessage || errorMessage,
        // errorType: err?.response?.data?.type,
      });
    }
    return err;
  }
};

// Axios helper methods

interface IOptionalParams{
  withAuth?: boolean,
  isForm? : boolean,
  errorMessage?: string
}

export const patch = async (url, patchObj, optionalParams: IOptionalParams = {
  withAuth: false,
  isForm: false,
  errorMessage: '',
}): Promise<any> => {
  const tempOptionalParams = {
    withAuth: optionalParams.withAuth || false,
    isForm: optionalParams.isForm || false,
    errorMessage: optionalParams.errorMessage || '',
  };
  const apiResponse = await axiosCall(url, {
    method: 'PATCH',
    headers: getHeaders(tempOptionalParams.withAuth),
    body: JSON.stringify(patchObj),
    isForm: tempOptionalParams.isForm,
    errorMessage: tempOptionalParams.errorMessage,
  });

  return apiResponse;
};

export const post = async (url, postObj, optionalParams: IOptionalParams = {
  withAuth: false,
  isForm: false,
  errorMessage: '',
}): Promise<any> => {
  const tempOptionalParams = {
    withAuth: optionalParams.withAuth || false,
    isForm: optionalParams.isForm || false,
    errorMessage: optionalParams.errorMessage || '',
  };
  const apiResponse = await axiosCall(url, {
    method: 'POST',
    headers: getHeaders(tempOptionalParams.withAuth),
    body: JSON.stringify(postObj),
    isForm: tempOptionalParams.isForm,
    errorMessage: tempOptionalParams.errorMessage,
  });

  return apiResponse;
};

export const put = async (url, putObj, optionalParams: IOptionalParams = {
  withAuth: false,
  isForm: false,
  errorMessage: '',
}): Promise<any> => {
  const tempOptionalParams = {
    withAuth: optionalParams.withAuth || false,
    isForm: optionalParams.isForm || false,
    errorMessage: optionalParams.errorMessage || '',
  };
  const apiResponse = await axiosCall(url, {
    method: 'PUT',
    headers: getHeaders(tempOptionalParams.withAuth),
    body: JSON.stringify(putObj),
    isForm: tempOptionalParams.isForm,
    errorMessage: tempOptionalParams.errorMessage,
  });
  return apiResponse;
};

export const get = async (url, optionalParams: IOptionalParams = {
  withAuth: false,
  isForm: false,
  errorMessage: '',
}): Promise<any> => {
  const tempOptionalParams = {
    withAuth: optionalParams.withAuth || false,
    isForm: optionalParams.isForm || false,
    errorMessage: optionalParams.errorMessage || '',
  };
  const apiResponse = await axiosCall(url, {
    method: 'GET',
    headers: getHeaders(tempOptionalParams.withAuth),
    isForm: tempOptionalParams.isForm,
    errorMessage: tempOptionalParams.errorMessage,
  });

  return apiResponse;
};

export const deleteMethod = async (url, optionalParams: IOptionalParams = {
  withAuth: false,
  isForm: false,
  errorMessage: '',
}):Promise<any> => {
  const tempOptionalParams = {
    withAuth: optionalParams.withAuth || false,
    isForm: optionalParams.isForm || false,
    errorMessage: optionalParams.errorMessage || '',
  };
  const apiResponse = await axiosCall(url, {
    method: 'DELETE',
    headers: getHeaders(tempOptionalParams.withAuth),
  });
  return apiResponse;
};

export const uploadput = async (url, putObj): Promise<any> => {
  const accessToken = getAuthToken();
  const authHeader = {
    Authorization: `Bearer ${accessToken}`,
  };
  const apiResponse = await axiosCall(url, {
    method: 'PUT',
    body: putObj,
    headers: authHeader,
  });
  return apiResponse;
};
