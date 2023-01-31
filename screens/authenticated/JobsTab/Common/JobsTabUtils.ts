/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import isBetween from 'dayjs/plugin/isBetween';
import has from 'lodash/has';
import { PricingStats, PricingStatsType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import { getJobs, getOrgJobsStats } from 'service/jobs-tab-service';
import { getOrgDetails, getOrgPricingStats } from 'service/organization-service';

dayjs.extend(isBetween);
dayjs.extend(calendar);

// Job states:
//  1. J_O (Job open)
//  2. J_P (Job paused)
//  3. J_D (Job draft)
//  4. J_C (Job closed)

// Job stages:
//  1. J_A (Job approved)
//  2. J_UA (Job unapproved)
//  3. J_R (Job rejected)

// Job Types:
//  1. NCAR (candidate approval not required i.e., walk-in job)
//  2. CAR (candidate approval required)

export type ApplicationStatsType = {
  totalApplications: number;
  applied: number;
  selected: number;
  interviews: number;
}

export type JobsStatsType = {
  open: number,
  paused: number,
  closed: number,
  drafts: number,
  unapproved: number,
};

export type JobType = {
  id: string;
  title: string;
  pricingPlanType: string;
  location: string;
  stage: string;
  jobType: string;
  totalLocations: number;
  postedBy: string;
  postedOn: string;
  validTill: string;
  recentSlot: string;
  isActive: boolean;
  slug: string;
  orgName: string;
  orgPopularName: string;
  applicationStats: ApplicationStatsType
  currentStep: number;
  completionScore: number;
  banner: string | null;
  lastUpdated: string;
  jobCityAndState: string;
  pausedOn: string;
  featuredUntil:string
  maxSalary: number;
  minSalary: number;
  callHR: boolean;
  databaseRecommendationCount: number;
  newApplications: number;
  pocName: string;
}

/**
 * Function which decides which banner to shown on open jobs
 * @param {object} job - job data
 * @returns {string|null} - Type of banner (null indicates no banner )
 */
const getBanner = (job): string | null => {
  if (has(job, '_source.state') && job._source.state !== 'J_O') return null;
  // Following logic is followed to show banners on open jobs
  // Active Tip - For first two days ( Priority 2 )
  // pauseWarning - For last seven days before the job gets expired ( Priority 1 )
  // premiumPromotion - All those days in between we show
  //                    premium banner and only in case of Free jobs ( Priority 3 )
  if (has(job, '_source.valid_till') && job._source.valid_till) {
    const expDate = dayjs(job._source.valid_till).subtract(7, 'day');
    const currDate = dayjs(new Date());
    if (currDate > expDate) {
      return 'pausedWarning';
    }
  }

  if (has(job, '_source.pricing_plan_type') && job._source.pricing_plan_type === 'FR') {
    if ((has(job, '_source.is_active') && !job._source.is_active) && (has(job, '_source.created') && job._source.created)) {
      const createDate = dayjs(job._source.created);
      const currDate = dayjs(new Date());
      if (createDate.isBetween(currDate.subtract(2, 'day'), currDate)) {
        return 'activeTip';
      }
    }
    return 'premiumPromotion';
  }
  return null;
};

export const getTotalApplications = (applicationStats): number => {
  if (applicationStats) {
    let total = 0;
    const keys = Object.keys(applicationStats);
    for (let i = 0; i < keys.length; i += 1) {
      if (applicationStats[keys[i]] && (keys[i] !== 'last_24_hrs_applications')) {
        total += +applicationStats[keys[i]];
      }
    }
    return total;
  }
  return 0;
};

/**
 * Function which makes the api call and return the flat jobs data
 * @param {string} jobStage - Type of jobs (open,closed,paused,drafts,unapproved)
 * @param {number} limit - limit on how many jobs to be returned at a time.
 * @param {number} offset - offset
 * @returns {Promise} Promise of jobs and orgId
 */
export const getFlatJobsData = async (jobsStage: string,
  limit: number, offset: number): Promise<{ jobs: JobType[], totalJobs: number }> => {
  const apiCall = await getJobs(jobsStage, limit, offset);
  if ([200, 201, 202].includes(apiCall.status)) {
    const response = await apiCall.data;
    if (response?.objects?.length > 0) {
      const jobs = response.objects.map((job) => ({
        id: job?._id || '',
        title: job?._source?.title || '',
        pricingPlanType: job?._source?.pricing_plan_type || '',
        location: job?._source?.locations?.[0]?.place.short_formatted_address || '',
        jobCityAndState: job._source?.city_name || '',
        stage: (has(job, '_source.stage') && job._source.stage) || '',
        jobType: (has(job, '_source.client_approval_required') && job._source.client_approval_required && 'CAR') || 'NCAR',
        totalLocations: (has(job, '_source.locations')
                    && Array.isArray(job._source.locations) && job._source.locations.length) || 0,
        postedBy: (has(job, '_source.created_by.first_name')
                    && job._source.created_by.first_name
                    && `${job._source.created_by.first_name} ${job._source.created_by.last_name || ''}`) || '',
        postedOn: (has(job, '_source.created') && dayjs(job._source.created).format('DD MMM YYYY')) || '',
        validTill: (has(job, '_source.valid_till') && dayjs(job._source.valid_till).format('DD MMM YYYY')) || '',
        featuredUntil: (has(job, '_source.featured_until') && job._source.featured_until != null && dayjs(job._source.featured_until).format('DD MMM YYYY')) || '',
        recentSlot: (has(job, '_source.recent_slot') && job._source.recent_slot && dayjs(dayjs(job._source.recent_slot)).calendar(new Date())) || '',
        isActive: (has(job, '_source.is_active') && job._source.is_active) || false,
        slug: (has(job, '_source.slug') && job._source.slug) || '',
        orgName: (has(job, '_source.organization.name') && job._source.organization.name) || '',
        orgPopularName: (has(job, '_source.organization.popular_name') && job._source.organization.popular_name) || '',
        applicationStats: {
          totalApplications: (has(job, '_source.application_stats')
                        && getTotalApplications(job._source.application_stats)) || 0,
          applied: (has(job, '_source.application_stats.new_applications')
                        && job._source.application_stats.new_applications) || 0,
          selected: (has(job, '_source.application_stats.selected')
                        && job._source.application_stats.selected) || 0,
          interviews: (has(job, '_source.application_stats')
                        && +(job._source.application_stats.pending_feedback || 0)
                        + +(job._source.application_stats.lined_up || 0)) || 0,
        },
        currentStep: (has(job, '_source') && 1) || 1,
        completionScore: (has(job, '_source.completion_score') && job._source.completion_score) || 0,
        lastUpdated: has(job, '_source.last_activity_on') ? dayjs(job._source.last_activity_on).format('DD MMM') : '',
        banner: getBanner(job),
        pausedOn: (has(job, '_source.paused_on') && dayjs(job._source.paused_on).format('DD MMM YYYY')) || '',
        maxSalary: (has(job, '_source.offer.max_offered_salary') && job._source.offer.max_offered_salary) || 0,
        minSalary: (has(job, '_source.offer.min_offered_salary') && job._source.offer.min_offered_salary) || 0,
        callHR: has(job, '_source.share_contact_to_public') && job._source.share_contact_to_public,
        databaseRecommendationCount: job?._source?.total_recommended_candidate_count || 0,
        newApplications: (has(job, '_source.application_stats.last_24_hrs_applications')
        && job._source.application_stats.last_24_hrs_applications) || 0,
        pocName: (job?._source?.call_poc?.name || ''),
      }));
      const totalJobs = (has(response, 'meta.count') && response.meta.count) || 0;
      return { jobs, totalJobs };
    }
  }
  return { jobs: [], totalJobs: 0 };
};

/**
 * Function which gives no. of jobs in specific stages and states
 * @param {string} orgId - organisation ID
 * @returns {Promise} Promise of jobsStats
 */
export const getJobsStats = async (orgId: string): Promise<JobsStatsType | null> => {
  const apiCall = await getOrgJobsStats(orgId);
  if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
    const response = await apiCall.data;
    if (response && response.aggregations) {
      return {
        open: (has(response.aggregations, 'open.doc_count')
                    && response.aggregations.open.doc_count) || 0,
        paused: (has(response.aggregations, 'paused.doc_count')
                    && response.aggregations.paused.doc_count) || 0,
        closed: (has(response.aggregations, 'closed.doc_count')
                    && response.aggregations.closed.doc_count) || 0,
        drafts: (has(response.aggregations, 'draft.doc_count')
                    && response.aggregations.draft.doc_count) || 0,
        unapproved: (has(response.aggregations, 'unapproved.doc_count')
                    && response.aggregations.unapproved.doc_count) || 0,
      };
    }
  }
  return null;
};

export const getPricingStats = async (orgId: string): Promise<PricingStatsType> => {
  const apiCall = await getOrgPricingStats(orgId);
  if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
    const response = await apiCall.data;
    return response;
  }
  return {
    pricing_stats: { total_pricing_stats: {}, plan_wise_pricing_stats: [] },
  };
};

export type OrgOfficesListType={
  address: string;
  id: number;
  formattedAddress: string;
  mapsLink: string;
  placeId: string;
};

export type ManagersListType={
  name: string;
  email: string;
  mobile: string;
  id: number;
};

export type OrgDetailsType={
  orgId: string;
  offices: Array<OrgOfficesListType>;
  managers: Array<ManagersListType>;
  contactsUnlocksLeft: number;
  type?: string;
};

const getOrgOfficesList = (officesList): Array<OrgOfficesListType> => {
  if (Array.isArray(officesList) && officesList.length > 0) {
    return officesList.map(
      (item) => ({
        address: (has(item, 'address') && item.address) || '',
        id: (has(item, 'id') && item.id) || '',
        formattedAddress: (has(item, 'place.formatted_address') && item.place.formatted_address) || '',
        mapsLink: (has(item, 'place.location') && `https://maps.google.com/?q=${item.place.location}`) || '',
        placeId: (has(item, 'place.place_id') && item.place.place_id) || '',
      }),
    );
  }
  return [];
};

const getManagersList = (managersList): Array<ManagersListType> => {
  if (Array.isArray(managersList) && managersList.length > 0) {
    return managersList.map(
      (item) => ({
        name: (((has(item, 'user.first_name') && item.user.first_name) || '')
        + ((has(item, 'user.last_name') && item.user.last_name) || '')),
        email: (has(item, 'user.email') && item.user.email) || '',
        mobile: (has(item, 'user.mobile') && item.user.mobile) || '',
        id: (has(item, 'id') && item.id) || 0,
      }),
    );
  }
  return [];
};

/**
 * Function which returns the org details of OrgDetailsType
 * @returns {Promise} Promise of OrgDetailsType
 */
export const getOrganisationDetails = async (): Promise<OrgDetailsType> => {
  const orgApiCall = await getOrgDetails();
  if (orgApiCall && [200, 201, 202].indexOf(orgApiCall.status) !== -1) {
    const orgDetails = await orgApiCall.data;
    if (orgDetails && orgDetails.objects && Array.isArray(orgDetails.objects)
            && orgDetails.objects.length) {
      return {
        orgId: (has(orgDetails.objects[0], '_id')
                && orgDetails.objects[0]._id) || '',
        offices: (has(orgDetails.objects[0], '_source.offices')
        && getOrgOfficesList(orgDetails.objects[0]._source.offices)) || [],
        managers: (has(orgDetails.objects[0], '_source.managers')
        && getManagersList(orgDetails.objects[0]._source.managers)) || [],
        contactsUnlocksLeft: (has(orgDetails.objects[0], 'contact_unlocks_left')
        && orgDetails.objects[0].contact_unlocks_left) || 0,
      };
    }
  }
  return {
    orgId: '',
    offices: [],
    managers: [],
    contactsUnlocksLeft: 0,
  };
};

export type updateSlotsDataObjectType={
  interviewType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  interviewduration: string;
  pocName: string;
  pocContact: string;
  interviewDates: string[]
}

export const getPausedDate = (d1, d2) => {
  const valid = dayjs(d1).format('DD MM YYYY');
  const featured = dayjs(d2).format('DD MM YYYY');

  if (valid > featured) return d1;
  return d2;
};

interface IPricingStats{
  total_pricing_stats: any,
  plan_wise_pricing_stats: Array<any>
}

export interface IJobsTabData {
  refresh: boolean,
  jobs: Array<any>,
  dataLoading: boolean,
  currentTab: 'open' | 'paused' | 'unapproved' | 'drafts' | 'closed',
  showUnverifiedEmailNotification: boolean,
  limit: number,
  offset: number,
  totalJobs: number,
  pricing_stats: PricingStats,
  open: number,
  paused: number,
  closed: number,
  drafts: number,
  unapproved: number,
  orgDataLoaded: boolean,
  orgId: string,
  offices: Array<any>,
  managers: Array<any>,
  contactsUnlocksLeft: number,
  orgHasNoJobs: boolean,
}

interface IJobsTabPayload{
  refresh?: boolean,
  jobs?: Array<any>,
  dataLoading?: boolean,
  currentTab?: string,
  showUnverifiedEmailNotification?: boolean,
  limit?: number,
  offset?: number,
  totalJobs?: number,
  pricing_stats?: PricingStats,
  open?: number,
  paused?: number,
  closed?: number,
  drafts?: number,
  unapproved?: number,
  orgDataLoaded?: boolean,
  orgId?: string,
  offices?: Array<any>,
  managers?: Array<any>,
  contactsUnlocksLeft?: number,
  orgHasNoJobs?: boolean,
}

export interface IJobsTabDispatch{
  type:string;
  payload: IJobsTabPayload;

}

export const jobPostingSteps = {
  1: { title: 'About the Job', page: 'JobSpecs' },
  2: { title: 'About the Job', page: 'WorkTimingAndJobDetails' },
  3: { title: 'Candidate Requirements', page: 'CandidateSpecs' },
};

export const sharingPlatforms = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Linkedin', value: 'linkedIn' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Email JD', value: 'email' }];

export const applicationStages = [
  { label: 'Applied', value: 'applied' },
  // { label: 'Interviews', value: 'interviews' },
  // { label: 'Selections', value: 'selected' },
];
export const openapplicationStages = [
  { label: 'Applied', value: 'applied' },
  { label: 'Database', value: 'database' },

];
