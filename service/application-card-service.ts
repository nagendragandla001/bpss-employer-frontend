/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import {
  get, post, patch, put,
} from 'service/api-method';
import {
  applicationFilter, allJobFilter, selectJobFilter,
  openJobFilter, closeJobFilter, pauseJobFilter,
  dashboaardAggsFilter, dashboardFilter, applicationStagesFilter, combineFilters,
} from 'service/application-card-filter';
import queryString from 'query-string';
import moment from 'moment';
import { getGraphqlFiltes } from 'screens/authenticated/ApplicationsTab/Common/DatabaseTabUtils';
import { flatTheApplication } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

interface UnlockCaandidates {
  candidate_id: string;
}

export const applicationAPI = async (limit: number,
  offset: number, sortBy: string): Promise<any> => {
  const filtervalue = applicationFilter(limit, offset, sortBy);
  const url = `${ApiConstants.APPLICATION_API}?${queryString.stringify(filtervalue)}`;

  const response = await get(url, { withAuth: true, isForm: false, errorMessage: '' });

  return response;
};
export const allJobAPI = async (): Promise<any> => {
  const filtervalue = allJobFilter();
  const url = `${ApiConstants.ALL_JOB_API}?${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const searchAPI = async (
  limit:number, offset:number, searchTerm:string, value, jobId:string, sortBy,
):
Promise<any> => {
  let filtervalue;
  if ((value && value.length === 0) && !jobId) {
    filtervalue = applicationFilter(limit, offset, sortBy);
  } else if ((value && value.length === 0) && jobId) {
    filtervalue = selectJobFilter(jobId, sortBy);
  } else {
    filtervalue = combineFilters(offset, limit, value, jobId, sortBy);
  }

  const url = `${ApiConstants.APPLICATION_API}?any_query=${searchTerm}&${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};
export const searchMobileAPI = async (
  limit:number, offset:number, searchTerm:string, sortBy: string,
):
Promise<any> => {
  const filtervalue = applicationFilter(limit, offset, sortBy);
  const url = `${ApiConstants.APPLICATION_API}?any_query=${searchTerm}&${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};
export const unlockContactAPI = async (id:string, postobj?): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${id}/unlock_contact/`;
  let data;
  if (postobj) {
    data = postobj;
  } else { data = { id }; }
  const response = post(url, data, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};
export const transformResponse = (response):void => {
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applications-${moment().format('DD-MM-YYYY')}.csv`;
  a.click();
};

export const downloadExcelForAll = async (offset:number, sortBy: string): Promise<any> => {
  const filtervalue = applicationFilter(10, offset, sortBy);
  const url = `${ApiConstants.APPLICATION_API}in_csv/?${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const downloadExcelForFilters = async (
  offset:number,
  limit:number,
  value,
  jobId:string,
  sortBy: string,
  downloadOption: string,
  downloadType: string,
  candidateIds: Array<string> = [],
): Promise<any> => {
  let filtervalue;
  if (value === undefined) {
    filtervalue = selectJobFilter(jobId, sortBy);
  } else {
    filtervalue = combineFilters(offset, limit, value, jobId, sortBy);
  }
  if (candidateIds?.length && downloadOption === 'DISCRETE') {
    filtervalue = combineFilters(offset, limit, value, jobId, sortBy, candidateIds);
  }
  const url = `${ApiConstants.DOWNLOAD_CSV}?${queryString.stringify(filtervalue)}&option=${downloadOption}&type=${downloadType}&filter_list=${value}`;

  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const downloadExcelDB = async (
  offset:number,
  limit:number,
  value,
  jobId:string,
  downloadOption: string,
  downloadType: string,
  candidateIds: Array<string> = [],
  orgId,
): Promise<any> => {
  const filterValue = getGraphqlFiltes(value, orgId);
  const params = {
    filter: JSON.stringify(filterValue),
    first: limit,
    after: offset,
  };
  let url;
  if (downloadOption === 'DISCRETE') {
    url = `${ApiConstants.DOWNLOAD_CSV}?${queryString.stringify(params)}&option=${downloadOption}&type=${downloadType}&job_id=${jobId}&filter_list=${value}&candidate_ids=${candidateIds}`;
  } else {
    url = `${ApiConstants.DOWNLOAD_CSV}?${queryString.stringify(params)}&option=${downloadOption}&type=${downloadType}&job_id=${jobId}&filter_list=${value}`;
  }
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const openJobAPI = async (): Promise<any> => {
  const filtervalue = openJobFilter();
  const url = `${ApiConstants.APPLICATION_API}?${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};
export const closeJobAPI = async (): Promise<any> => {
  const filtervalue = closeJobFilter();
  const url = `${ApiConstants.APPLICATION_API}?${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};
export const pauseJobAPI = async (): Promise<any> => {
  const filtervalue = pauseJobFilter();
  const url = `${ApiConstants.APPLICATION_API}?${queryString.stringify(filtervalue)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const forwardResumeAPI = async (postObj:Record<string, any>):Promise<any> => {
  const url = `${ApiConstants.FORWARD_RESUME_API}`;
  const response = post(url, postObj, { withAuth: true, isForm: false, errorMessage: 'Please enter subject and mail body' });
  return response;
};

export const bulkUnlockContactAPI = async (caandidates:Array<UnlockCaandidates>) :Promise<any> => {
  const url = `${ApiConstants.BULK_UNLOCK_CONTACT}`;
  const response = post(url, caandidates, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const applicationBulkUnlock = async (postObj): Promise<any> => {
  const url = `${ApiConstants.APP_BULK_UNLOCK_CONTACT}`;
  const response = post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const getUnlockCandidatesInfo = async (caandidates: Array<UnlockCaandidates>):
Promise<any> => {
  const url = `${ApiConstants.DECRYPT_CONTACT}`;
  const response = post(url, caandidates, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const dashboardServiceAPI = async ():Promise<any> => {
  const aggsfilter = dashboaardAggsFilter();
  const filter = dashboardFilter();
  const url = `${ApiConstants.ALL_JOB_API}?${queryString.stringify(aggsfilter)}&${queryString.stringify(filter)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const applicationStatusServiceAPI = async (jobID?:string):Promise<any> => {
  let aggsfilter;
  if (jobID !== '') { aggsfilter = applicationStagesFilter(jobID); } else { aggsfilter = applicationStagesFilter(); }
  const url = `${ApiConstants.ORGANIZATION_DETAILS}olx_jobs_application_aggs/?${queryString.stringify(aggsfilter)}`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const getDownloadList = async (orgId: string, offset: number): Promise<any> => {
  const url = `${ApiConstants.DOWNLOAD_LIST}?organization_id=${orgId}&offset=${offset}&order_by=-created`;
  const response = get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

export const combineService = async (
  offset:number, limit:number, value, jobId:string, sortBy: string,
):Promise<any> => {
  let filtervalue;
  if (value === undefined) {
    filtervalue = selectJobFilter(jobId, sortBy);
  } else {
    filtervalue = combineFilters(offset, limit, value, jobId, sortBy);
  }
  const url = `${ApiConstants.APPLICATION_API}?${queryString.stringify(filtervalue)}`;
  const response = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return response;
};

// Actions on the Application Card
export const shortlistApplication = async (applicationId: string): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${applicationId}/to_be_scheduled_for_interview/`;
  const apiCall = await patch(url, { id: applicationId }, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};
export const shortlistCandidate = async (candidateId: string, jobId:string): Promise<any> => {
  const url = `${ApiConstants.CANDIDATE_API}${candidateId}/shortlist/`;
  const apiCall = await post(url, { job_id: jobId }, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};
export const dismissCandidate = async (candidateId: string, postObj): Promise<any> => {
  const url = `${ApiConstants.CANDIDATE_API}${candidateId}/is_dismissed_by_employer/`;
  const apiCall = await post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const markAsOnHold = async (applicationId: string): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${applicationId}/application_on_hold/`;
  const apiCall = await patch(url, { on_hold: 'True' }, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type selectPutObjectType={
  date_of_joining?: string;
  salary_offered?: string;
  id: string;
}

export const selectCandidate = async (putObject:selectPutObjectType): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${putObject.id}/select/`;
  const apiCall = await put(url, putObject, { withAuth: true, isForm: true, errorMessage: '' });
  return apiCall;
};

export const getRejectionReasons = async (preStage: string, postStage: string): Promise<any> => {
  const params = {
    filter: JSON.stringify({
      and:
      { pre_stage: { inq: [preStage] }, post_stage: { inq: [postStage] } },
    }),
  };
  const apiCall = await get(`${ApiConstants.APPLICATION_REJECT_REASONS_API}?${queryString.stringify(params)}`,
    { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type rejectPostObjectType={
  reason_ids?:Array<number>;
  id: string;
}

export const rejectCandidate = async (postObject:rejectPostObjectType): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${postObject.id}/reject/`;
  const apiCall = await patch(url, postObject, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type joinedPatchObjectType={
  date_of_joining?: string;
  salary_offered?: string;
  id: string;
}

export const markJoined = async (patchObject:joinedPatchObjectType): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${patchObject.id}/joined/`;
  const apiCall = await patch(url, patchObject, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const markAbsent = async (applicationId: string, raiseConflict:boolean): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${applicationId}/mark_absent/`;
  const patchObject = { id: applicationId, raise_conflict: raiseConflict };
  const apiCall = await patch(url, patchObject, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const candidateLeftJob = async (applicationId: string, dateOfLeaving: string)
: Promise<any> => {
  const patchObject = {
    date_of_leaving: dateOfLeaving,
    id: applicationId,
  };
  const url = `${ApiConstants.APPLICATION_API}${applicationId}/left_job/`;
  const apiCall = await patch(url, patchObject, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const candidateInfo = async (id: string): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${id}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  if ([200, 201, 202].includes(apiCall?.status)) {
    return flatTheApplication(apiCall?.data);
  }
  return {};
};
