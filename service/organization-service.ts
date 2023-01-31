/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import config from 'config';
import {
  get, post, uploadput, deleteMethod, patch,
} from 'service/api-method';
import queryString from 'query-string';

export const getOrgDetails = async (): Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getUnifiedOrgDetails = async (): Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}`;
  const apiCall = await get(url, { withAuth: true, isForm: true, errorMessage: '' });
  return apiCall;
};

export const getCallHRDetails = async (id) : Promise<any> => {
  const url = `${ApiConstants.CALL_HR_DISABLED_API}${id}/`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const patchCallHR = async (data, id) : Promise<any> => {
  const url = `${ApiConstants.CALL_HR_DISABLED_API}${id}/`;
  const apiCall = await patch(url, data, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const patchOrgDetails = async (data, id): Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}${id}/`;
  const apiCall = await patch(url, data, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};
export const getOrgPricingStats = async (orgId: string, history = false):Promise<any> => {
  let url = `${ApiConstants.ORGANIZATION_DETAILS}${orgId}/pricing_stats/`;
  if (history) {
    url = `${url}?include_history=True`;
  }
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

// export const getOrgPricingStats = async (orgId: string):Promise<any> => {
//   const url = `${ApiConstants.ORGANIZATION_DETAILS}${orgId}/pricing_stats/`;
//   const apiCall = await get(url, true);
//   return apiCall;
// };

export const uploadPhotoAPI = async (id, data):Promise<any> => {
  const fd = new FormData();
  fd.append('id', id);
  fd.append('file', data);
  const url = `${ApiConstants.ORGANIZATION_DETAILS}${id}/upload_photo/`;
  const apiCall = await uploadput(url, fd);
  if (apiCall) {
    const apiResponse = await apiCall.data;
    return apiResponse;
  }
  return null;
};
export const photoUploadAPI = async (data):Promise<any> => {
  const fd = new FormData();
  // fd.append('id', id);
  fd.append('file', data);
  const url = `${config.API_ENDPOINT}api/v4/photo_upload/`;
  const apiCall = await uploadput(url, fd);
  if (apiCall) {
    const apiResponse = await apiCall.data;
    return apiResponse;
  }

  return null;
};

export const deletePhotoApi = async (id):Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}photo/${id}/`;
  const apiCall = await deleteMethod(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const industryApi = async ():Promise<any> => {
  const apiResponse = await get(`${config.API_ENDPOINT}api/v4/industry/?limit=1000&order_by=name`);
  const data = await apiResponse.data;
  return data;
};

export const cityApi = async (filter):Promise<any> => {
  const apiResponse = await get(`${ApiConstants.SUGGEST_CITY}?${queryString.stringify(filter)}`);
  const data = await apiResponse.data;
  return data;
};

export const postEmployerTicket = async (postObj: any, withAuth): Promise<any> => {
  const url = `${ApiConstants.EMPLOYER_TICKET}`;
  const apiCall = await post(url, postObj, withAuth);
  return apiCall;
};

export const getPOCManagers = async (orgId): Promise<any> => {
  const postObj = {
    organization_id: orgId,
    mobile_verified: true,
    is_deleted: false,
  };
  const url = `${ApiConstants.ORG_MANAGERS}`;
  const apiCall = await post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export type CreateInvoicePostDataType={
  address_id: number| null;
  // job_id: string;
  quantity: number;
  product_id: number;
  client_gst_reg_num?: string;
}

export const createInvoice = async (postObject:CreateInvoicePostDataType): Promise<any> => {
  const apiCall = await post(ApiConstants.CREATE_INVOICE, postObject, {
    withAuth: true,
    isForm: true,
    errorMessage: '',
  });
  return apiCall;
};

export const getInvoice = async (id: string|number): Promise<any> => {
  const url = `${ApiConstants.GET_INVOICE}${id}/`;
  const apiResponse = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  const data = await apiResponse.data;
  return data;
};

export const payOnline = async (postObj: any): Promise<any> => {
  const url = `${ApiConstants.PAY_ONLINE}`;
  const apiCall = await post(url, postObj, {
    withAuth: true,
    isForm: false,
    errorMessage: '',
  });
  const data = await apiCall.data;
  return data;
};
