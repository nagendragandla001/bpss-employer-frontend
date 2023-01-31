/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import {
  get, patch, put, post,
} from 'service/api-method';

export const getJobDetails = async (jobId: string | number): Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${jobId}/`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export type renewJobPatchObjectType={
  modified_by_id: string,
  id: string
};

export type updateJobType = {
  job_ids:string[],
  plan_id: number | undefined
}

export const renewJob = async (jobId:string,
  patchObject:renewJobPatchObjectType):Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${jobId}/refresh_job/`;
  const apiCall = await patch(url, patchObject, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const addSlots = async (putObject: Record<string, any>): Promise<any> => {
  const apiCall = await put(`${ApiConstants.JOB_SLOT_API}`, putObject, { withAuth: true, isForm: true, errorMessage: '' });
  return apiCall;
};

export const upgradeJob = async (postObject: updateJobType):Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}jp_bulk_tagging/`;
  const apiCall = await post(url, postObject, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const fetchJobRole = async (text: string): Promise<any> => {
  const url = `${ApiConstants.JOB_ROLE}?filter=${JSON.stringify({ and: { job_designation: { icontains: text } } })}`;
  const apiCall = await get(url);
  return apiCall;
};
