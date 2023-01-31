import { IJobPost } from 'common/jobpost.interface';
import config from 'config';
import { ApiConstants } from 'constants/index';
import { get, patch, post } from 'service/api-method';
import { checkSpecialCharacters, getFlatJobData } from 'utils/job-posting-utils';
import { getOrgJobsStats } from './jobs-tab-service';

export const functionalAreaDescriptionAPI = async (value): Promise<any> => {
  const url = `${ApiConstants.JOB_FA_DESCRIOTION}?filter=${JSON.stringify(value)}`;
  const apiResponse = await get(url);
  const data = await apiResponse.data;
  return data;
};

export const getOpenJobs = async (orgId:string): Promise<number> => {
  const allJobsResponse = await getOrgJobsStats(orgId);
  if ([200, 201, 202].includes(allJobsResponse?.status)) {
    return allJobsResponse?.data?.aggregations?.open?.doc_count
    + allJobsResponse?.data?.aggregations?.unapproved?.doc_count
    + allJobsResponse?.data?.aggregations?.draft?.doc_count;
  }
  return 0;
};

export const newJobAPI = (data): Promise<any> => {
  const url = `${ApiConstants.NEW_JOB_API}`;
  const response = post(url, data, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const patchJobAPI = (data: any, id: string): Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${id}/`;
  const response = patch(url, data, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const titleSuggAPI = async (text: string): Promise<any> => {
  const url = `${ApiConstants.JOB_TITLE_SUGGESTION}?q=${text}`;
  const response = await get(url);
  const data = await response.data;
  return data;
};

export const skillSuggAPI = async (text: string): Promise<any> => {
  const url = `${ApiConstants.SKILL_SUGGESTION}?q=${text}`;
  const response = get(url);
  return response;
};

export const getJobDetailsAPI = async (id:string): Promise<any> => {
  const url = `${config.API_ENDPOINT}api/v4/job/${id}?application_stats=true`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const patchJobChanges = async (id, patchObj):Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${id}/`;
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getJobDetailsData = async (id:string): Promise<IJobPost> => {
  const apiCall = await getJobDetailsAPI(id);
  const JobData = await apiCall.data;
  return getFlatJobData(JobData);
};

export const patchJobChangesData = async (id: string, patchObj: any):Promise<any> => {
  const response = await patchJobChanges(id, patchObj);

  return getJobDetailsData(response?.data?.id || id);
};

export const fetchAllJobs = async (): Promise<any> => {
  const url = ApiConstants.ALL_JOB_API;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getDocumentsAndAssetsSuggestions = async (id): Promise<any> => {
  const url = `${ApiConstants.DOCUMENTS_ASSETS}?functional_area_id=${id}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getAllDocumentsAndAssets = async (): Promise<any> => {
  const url = ApiConstants.DOCUMENTS_ASSETS;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getSkillSuggestions = async (id): Promise<any> => {
  const url = `${ApiConstants.SKILLS}?functional_area_id=${id}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const validateDescriptionAPI = (description: string): Promise<any> => {
  const des = { description: '' };
  des.description = description;
  const url = `${ApiConstants.VALIDATE_JOB_DESCRIPTION}`;
  const response = post(url, des);
  return response;
};

export const onValidateDescription = async (_rule: unknown, value: string):
Promise<string | void> => {
  if (!value) {
    return Promise.resolve('required');
  }
  const formattedValue = value.replace(/(<([^>]+)>)/gi, '');
  if (!formattedValue || formattedValue === '') {
    return Promise.resolve('required');
  }
  if (checkSpecialCharacters(formattedValue)) {
    return Promise.resolve('special_characters');
  }
  const res = await validateDescriptionAPI(value);
  const check = await res?.data;
  if (check.restricted_words) {
    return Promise.resolve('profane_words');
  }
  if (formattedValue.length < 30) {
    return Promise.resolve('minLength');
  }
  if (formattedValue.length > 500) {
    return Promise.resolve('maxLength');
  }

  return Promise.resolve();
};

export const assessmentInfo = async (faId, orgId): Promise<any> => {
  const url = `${ApiConstants.GET_ASSESSMENT}?fa_id=${faId}&org_id=${orgId}`;
  const apiRes = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiRes;
};
