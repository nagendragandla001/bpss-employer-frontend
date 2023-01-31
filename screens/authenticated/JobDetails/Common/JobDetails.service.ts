/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/prefer-default-export */

import config from 'config';
import {
  get, patch,
} from 'service/api-method';
import moment from 'moment';
import queryString from 'query-string';
import { ApiConstants } from 'constants/index';

export const getJobDetailsAPI = async (id:string): Promise<any> => {
  const url = `${config.API_ENDPOINT}api/v4/job/${id}?application_stats=true`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};
export const changeJobState = async (id, state):Promise<any> => {
  const url = `${config.API_ENDPOINT}api/v4/job/${id}/${state}/`;
  const obj = { id };
  // console.log(url);
  const apiCall = await patch(url, obj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};
export const jobSlotFilter = (id) => {
  const request = {
    filter: JSON.stringify({
      and: {
        job_id: {
          eq: id,
        },
        end_dt: {
          gte: moment().format('YYYY-MM-DDTHH:mm:ss'),
        },
      },
    }),
    // order_by: 'start_dt',
    // limit: 100,
    // offset: 0,
  };
  return request;
};
export const jobFutureSlots = async (id: string) :Promise<any> => {
  const filter = jobSlotFilter(id);

  const url = `${ApiConstants.JOB_SLOT_API}?${queryString.stringify(filter)}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const patchJobChanges = async (id, patchObj):Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${id}/`;
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const patchJobClose = async (id: string): Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${id}/close/`;
  const patchObj = {
    id,
  };
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const patchJobOpen = async (id: string): Promise<any> => {
  const url = `${ApiConstants.JOB_ID_PATCH_REQ}${id}/open/`;
  const patchObj = {
    id,
  };
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};
