/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import {
  get,
} from 'service/api-method';
import queryString from 'query-string';
import { dashboaardAggsFilter } from 'service/application-card-filter';

const Filters = {
  open: { stage: { inq: ['J_A'] }, state: { inq: ['J_O'] } },
  paused: { state: { inq: ['J_P'] } },
  closed: { state: { inq: ['J_C'] } },
  drafts: { state: { inq: ['J_D'] } },
  unapproved: { stage: { inq: ['J_R', 'J_UA'] }, state: { inq: ['J_O'] } },
};
/**
 * Function to get the jobs in specific stages and states
 * @param {string} filterType - Type of filter to be applied (open,closed,paused,drafts,unapproved)
 * @param {number} limit - limit on how many jobs to be returned at a time.
 * @param {number} offset - offset
 */
export const getJobs = async (filterType: string, limit: number,
  offset: number): Promise<any> => {
  const filter = {
    application_stats: ['open', 'closed', 'paused'].indexOf(filterType) !== -1,
    filter: JSON.stringify({ and: Filters[filterType] }),
    limit,
    offset,
    order_by: '-modified',
    recent_slots: ['open', 'paused', 'unapproved'].indexOf(filterType) !== -1,
  };
  const url = `${ApiConstants.ALL_JOB_API}?${queryString.stringify(filter)}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

/**
 * Function to get pricing stats of an organisation
 * @param {string} orgId - organisation ID
 */
export const getOrgJobsStats = async (orgId: string): Promise<any> => {
  const filter = {
    aggs_query: JSON.stringify({
      open: { filter: { bool: { must: [{ term: { stage: 'J_A' } }, { term: { state: 'J_O' } }] } } },
      unapproved: { filter: { bool: { must: [{ terms: { stage: ['J_R', 'J_UA'] } }, { terms: { state: ['J_O'] } }] } } },
      closed: { filter: { bool: { must: [{ term: { state: 'J_C' } }] } } },
      paused: { filter: { bool: { must: [{ term: { state: 'J_P' } }] } } },
      draft: { filter: { bool: { must: [{ term: { state: 'J_D' } }] } } },
      paid_jobs: { filter: { bool: { must_not: [{ term: { pricing_plan_type: 'FR' } }] } } },
    }),
    filter: JSON.stringify({ and: { 'organization.id': { eq: orgId } } }),
    limit: 0,
  };
  const url = `${ApiConstants.ALL_JOB_API}?${queryString.stringify(filter)}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const getTabsFilterCount = async (orgId: string): Promise<any> => {
  const request = dashboaardAggsFilter() as any;
  request.filter = JSON.stringify({ and: { 'organization.id': { eq: orgId } } });
  request.limit = 0;

  const url = `${ApiConstants.ALL_JOB_API}?${queryString.stringify(request)}`;
  const response = await get(url, { withAuth: true, isForm: false, errorMessage: '' });

  return response;
};
