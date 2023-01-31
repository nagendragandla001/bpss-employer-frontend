/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import { get, patch, post } from 'service/api-method';
import config from 'config';
import queryString from 'query-string';

export const recognizeUserAPI = async (userName: string | number, options =
{ withAuth: false, isForm: false, errorMessage: '' }): Promise<any> => {
  const epochTime = Math.floor(Date.now() / 1000);
  const url = `${ApiConstants.RECOGNIZE_USER}?username=${userName}&t=${epochTime}`;
  const response = await get(url, options);
  const data = await response;
  return data;
};
export const getPricingInfoAPI = async (withAuth): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.PRICING_PRODUCT}`, withAuth);
  const data = await apiResponse.data;
  return data;
};

export const initiateResetPasswordAPI = async (postObj): Promise<any> => {
  const url = `${ApiConstants.INITIATE_RESET_PASSWORD}`;
  const response = await post(url, postObj);
  return response;
};

export const loginViaPassword = async (postObj): Promise<any> => {
  const url = `${ApiConstants.PASSWORD_LOGIN}`;
  const response = await post(url, postObj, {
    withAuth: false,
    isForm: true,
    errorMessage: '',
  });
  return response;
};

export const getJobsFromOrg = async (orgID: string): Promise<any> => {
  if (orgID) {
    const url = `${ApiConstants.ALL_JOB_API}?filter={"and":{"state":{"inq":["J_O"]},"organization.id":{"eq":"${orgID}"}}}&limit=1&offset=0&order_by=-created&recent_slots=false&application_stats=false`;
    const response = await get(url);
    const data = await response.data;
    return data;
  }
  return Promise.reject;
};

export const companySuggAPI = async (text: string): Promise<any> => {
  const url = `${ApiConstants.COMPANY_SUGGESTION}?q=${text}`;
  const response = await get(url);
  const data = await response.data;
  return data;
};

export const getLocationAPI = async (url: string): Promise<any> => {
  const response = await get(url);
  return response;
};

export const validatetitleAPI = async (title: string): Promise<any> => {
  const url = `${ApiConstants.VALIDATE_JOB_TITLE}?title_text=${title}`;
  const response = await get(url);
  const data = await response.data;
  return data;
};

export const degreeAPI = async (elasticFilters): Promise<any> => {
  const url = `${config.API_ENDPOINT}api/v4/degree_name/?filter=${JSON.stringify(elasticFilters)}&limit=1000&offset=${0}`;
  const apiResponse = await get(url);
  const data = await apiResponse.data;
  return data;
};

export const skillSuggAPI = async (text): Promise<any> => {
  const url = `${ApiConstants.SKILL_SUGGESTION}?q=${text}`;
  const response = get(url);
  return response;
};

export const resendEmailAPI = (userID, postObj): Promise<any> => {
  const url = `${config.API_ENDPOINT}api/v4/user/${userID}/initiate_unverified_email_change/`;
  const response = post(url, postObj);
  return response;
};

export const registerOrgAPI = (postObj): Promise<any> => {
  const response = post(`${config.API_ENDPOINT}api/v4/organization/`, postObj);
  return response;
};

export const getLocationListAPI = async (filter): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.SUGGEST_CITY}?${queryString.stringify(filter)}`);
  const data = await apiResponse.data;
  return data;
};

export const getjobCategoryListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${config.API_ENDPOINT}api/v4/fa/?limit=1000`);
  const data = await apiResponse.data;
  return data;
};

export const getSpecialDegreeListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.SPECIALIZATION_API}`);
  const data = await apiResponse.data;
  return data;
};

export const getIndustryListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${config.API_ENDPOINT}api/v4/industry/?limit=1000`);
  const data = await apiResponse.data;
  return data;
};

export const getLanguageListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.LANGUAGE_API}`);
  const data = await apiResponse.data;
  return data;
};

export const getDocumentListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.DOCUMENT_API}`);
  const data = await apiResponse.data;
  return data;
};

export const getMobileListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.MOBILE_API}`);
  const data = await apiResponse.data;
  return data;
};

export const getVehicleListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.VEHICLE_API}`);
  const data = await apiResponse.data;
  return data;
};

export const getCompSkillListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.SKILL_LIST_API}`);
  const data = await apiResponse.data;
  return data;
};

export const getskillListAPI = async (): Promise<any> => {
  const apiResponse = await get(`${config.API_ENDPOINT}api/v4/skill_suggestion/?filter=%7B%22and%22:%7B%22functional_area.id%22:%7B%22eq%22:37%7D%7D%7D&q=`);
  const data = await apiResponse.data;
  return data;
};

export const nFormatter = (num, digits): string => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1E3, symbol: 'k' },
    { value: 1E5, symbol: 'L' },
    { value: 1E8, symbol: 'Cr' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i -= 1) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
};

export const getUserInfo = async (withAuth = false): Promise<any> => {
  const apiResponse = await get(`${ApiConstants.USER_INFO}`, { withAuth, isForm: false, errorMessage: '' });
  return apiResponse;
};

export type resetPasswordPatchObjType={
  email:string;
  hash_code: string;
  new_password: string;
  client_id: string;
}

export const resetPassword = async (patchObj:resetPasswordPatchObjType):Promise<any> => {
  const apiResponse = await patch(`${ApiConstants.RESET_PASSWORD}`, patchObj,
    { withAuth: false, isForm: false, errorMessage: '' });
  return apiResponse;
};
