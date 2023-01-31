/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import {
  get, patch, put,
} from 'service/api-method';
import queryString from 'query-string';
import has from 'lodash/has';

export const getOrgSlotTemplates = async (orgId:string): Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}${orgId}/slot_templates/`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getSlotsDetails = async (slotIds:Array<string>): Promise<any> => {
  const fliter = { filter: JSON.stringify({ and: { id: { inq: slotIds } } }), limit: 200 };
  const url = `${ApiConstants.JOB_SLOT_API}?${queryString.stringify(fliter)}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type suggestTemplatePatchObj ={
  id: string;
  template_id: number;
}
// recommending a template to candidate
export const suggestTemplateToCandidate = async (
  patchObj:suggestTemplatePatchObj,
): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${patchObj.id}/suggest_slots/`;
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: 'Interview invite for selected time slot already sent' });
  return apiCall;
};

type suggestTemplatePutObj ={
  // app_ids of all the candidates to whom this template needs to be suggested
  // not required if assign_to_all_shortlisted is true
  id: any;
  // specified only if this templates is suggested to all shortlisted candidates
  // not required if it is not recommended to all
  assign_to_all_shortlisted?: boolean;
  template_id: number;
}

export const suggestTemplatesToCandidates = async (putObj:suggestTemplatePutObj): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}suggest_slots/`;
  const apiCall = await put(url, putObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

// Already confirmed

type scheduleInterviewPatchObj={
  date: string;
  start: string
  end: string;
  id: string; // application-id
  interview_type: string;
  interviewers: Array<string>;
  invite_employer?: boolean;
  location_id: number;
  poc_data: {
    name: string;
    contact: string;
    email?: string;
  }
  share_poc_contact: boolean;
}
// {
// date: "2020-07-07"
// end: "17:00:00"
// start: "10:00:00"
// id: "da45bf95-4d33-4904-88b4-703e38ba3e03"
// interview_type: "FACE"
// interviewers: ["abcdfe@gmail.com", "full@manager.com"]
// invite_employer: true
// location_id: 3931
// poc_data:
// {name: "Avanee Kapoor", contact: "9623075657"}
// share_poc_contact: true
// }

export const scheduleInterview = async (patchObj:scheduleInterviewPatchObj): Promise<any> => {
  const url = `${ApiConstants.APPLICATION_API}${patchObj.id}/employer/schedule_interview/`;
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

// To be confirmed with candidate

type createJobSlotPutObj={
  date: string;
  job_id: string;
  interview_type: string;
  interviewers: Array<string>;
  invite_employer?: boolean;
  location_id?: number;
  org_slot: {
    start: string;
    end: string;
    days: Array<number>
  }
  poc_data: {
    name: string;
    contact: string;
  }
  share_poc_contact: boolean;
  template: string;
}

export const createJobSlot = async (putObject:Array<createJobSlotPutObj>, applicationId:string):
Promise<any> => {
  let templateId;
  const apiCall = await put(`${ApiConstants.JOB_SLOT_API}`, putObject, { withAuth: true, isForm: true, errorMessage: '' });
  if (apiCall) {
    const apiResponse = await apiCall.data;

    if (apiResponse) {
      const firstSlot = apiResponse[0];
      // eslint-disable-next-line no-underscore-dangle
      templateId = (has(firstSlot, '_source.template.id') && firstSlot._source.template.id) || '';
      const obj = {
        id: applicationId,
        template_id: templateId,
      };

      const apiTemplateResponse = suggestTemplateToCandidate(obj);
      return apiTemplateResponse;
    }
  }
  // return apiCall;
};
