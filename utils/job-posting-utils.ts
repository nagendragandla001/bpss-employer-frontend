/* eslint-disable no-underscore-dangle */
import {
  IDefaultJobInfo, IJobPost, IKeyValue, POC,
} from 'common/jobpost.interface';
import { WORKDAYS } from 'constants/enum-constants';
import dayjs from 'dayjs';
import { getTotalApplications } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { imagePattern } from 'utils/constants';

/* eslint-disable import/prefer-default-export */
interface IReturnType {
  [key:string]: {
    [key:string]:{
      [key:string]:number
    }
  }
}
const functionalAreaElasticFilter = (filtersValue: number | undefined): IReturnType => {
  const filters = { and: {} };

  if (filtersValue) {
    // eslint-disable-next-line dot-notation
    filters.and['functional_area.id'] = {
      eq: filtersValue,
    };
  }

  return filters;
};

const convertExperienceRange = (min, max): string => {
  if ((min >= 0 && max <= 12) || min < 12) {
    return '0-1';
  }
  if ((min >= 12 && max <= 36) || (min >= 12 && min < 36)) {
    return '1-3';
  } if ((min >= 36 && max <= 60) || (min >= 36 && min < 60)) {
    return '3-5';
  } if (min >= 60) {
    return '5-40';
  }

  return '0-0';
};

const getWorkDays = (count = 5): Array<IKeyValue> => WORKDAYS.filter((day) => day.key <= count);

const getPOCDetails = (poc): POC => {
  if (poc?.length > 0) {
    return new POC(
      `${poc[0]?.user?.first_name} ${poc[0]?.user?.last_name}`,
      poc[0]?.user?.email,
      poc[0]?.user?.id,
      poc[0]?.user?.mobile,
      poc[0]?.id,
    );
  }
  return new POC();
};

const getDocumentsAndAssets = (data): Array<any> => {
  let list = [] as Array<any>;
  if (data?.vehicle_ownership?.length > 0) {
    list = data.vehicle_ownership.map((v) => ({ ...v, type: 'O_V' }));
  }
  if (data?.document_ownership?.length > 0) {
    const docs = data.document_ownership.map((d) => ({ ...d, type: 'O_D' }));
    list = [...list, ...docs];
  }
  if (data?.laptop_required) {
    list.push({ id: null, name: 'Laptop', type: 'O_L' });
  }
  if (data?.mobile_ownership) {
    list.push({ ...data.mobile_ownership, type: 'O_E' });
  }
  return list;
};

/**
 * Function which decides which banner to shown on open jobs
 * @param {object} job - job data
 * @returns {string|null} - Type of banner (null indicates no banner )
 */
const getBanner = (job): string => {
  if (job?._source?.state !== 'J_O') return '';
  // Following logic is followed to show banners on open jobs
  // Active Tip - For first two days ( Priority 2 )
  // pauseWarning - For last seven days before the job gets expired ( Priority 1 )
  // premiumPromotion - All those days in between we show
  //                    premium banner and only in case of Free jobs ( Priority 3 )
  if (job?._source?.valid_till) {
    const expDate = dayjs(job._source.valid_till).subtract(7, 'day');
    const currDate = dayjs(new Date());
    if (currDate > expDate) {
      return 'pausedWarning';
    }
  }

  if (job?._source?.pricing_plan_type === 'FR') {
    if (!job?._source?.is_active && job?._source?.created) {
      const createDate = dayjs(job._source.created);
      const currDate = dayjs(new Date());
      if (createDate.isBetween(currDate.subtract(2, 'day'), currDate)) {
        return 'activeTip';
      }
    }
    return 'premiumPromotion';
  }
  return '';
};
const getJobStatus = (job): string | null => {
  if (job?._source?.stage === 'J_UA') {
    return 'unApproved';
  } if (job?._source?.stage === 'J_A' && job?._source?.state === 'J_P') {
    return 'paused';
  } if (job?._source?.stage === 'J_R') {
    return 'rejected';
  } if (job?._source?.state === 'J_C') {
    return 'closed';
  }
  const banner = getBanner(job);
  return banner === 'activeTip' || banner === null ? 'open' : getBanner(job);
  // return getOpenBanner(job) ? getOpenBanner(job) : 'open';
};
const getFlatJobData = (job?: any): IJobPost => ({
  id: job?._source?.id || '',
  title: job?._source?.title || '',
  functionalArea: {
    id: job?._source?.functional_area?.id,
    name: job?._source?.functional_area?.name,
  },
  ownCompany: job?._source?.hiring_org_name === '',
  hiringOrgName: job?._source?.hiring_org_name || '',
  clientApprovalRequired: !job?._source?.client_approval_required,
  cityName: job?._source?.city_name || '',
  locality: job?._source?.locations?.length > 0 ? {
    value: job?._source?.locations[0]?.place?.place_id,
    label: `${job?._source?.locations[0]?.place?.short_formatted_address}, ${job?._source?.locations[0]?.place?.state}, India`,
  } : { value: '', label: '' },
  vacancies: job?._source?.vacancies || 1,
  employmentType: job?._source?.employment_type || 'FT',
  workDays: getWorkDays(job?._source?.working_days?.count),
  comment: 7 - (job?._source?.working_days?.count),
  shiftType: job?._source?.shifts?.length > 0 ? job._source.shifts[0].type : 'DAY',
  shiftStartTime: job?._source?.shifts?.length > 0 ? job._source.shifts[0].work_start_time : '09:00:00',
  shiftEndTime: job?._source?.shifts?.length > 0 ? job._source.shifts[0].work_end_time : '18:00:00',
  minOfferedSalary: job?._source?.offer?.min_offered_salary || 15000,
  maxOfferedSalary: job?._source?.offer?.max_offered_salary || 25000,
  description: job?._source?.description || '',
  proficiencyLevel: job?._source?.expectation?.proficiency_level,
  experienceRange: convertExperienceRange(
    job?._source?.expectation?.work_exp_requirements?.min_experience,
    job?._source?.expectation?.max_experience,
  ),
  experienceLevel: job?._source?.expectation?.max_experience !== 0 ? 'experienced' : 'fresher',
  minExperience: job?._source?.expectation?.work_exp_requirements?.min_experience,
  maxExperience: job?._source?.expectation?.max_experience,
  minPreferredAge: job?._source?.expectation?.min_preferred_age,
  maxPreferredAge: job?._source?.expectation?.max_preferred_age,
  genderPreference: job?._source?.expectation?.gender_preference || 'M',
  englishProficiency: job?._source?.language_preferences?.length > 0
    ? job?._source?.language_preferences[0]?.proficiency : 1,
  isResumeSubscribed: job?._source?.is_resume_subscribed,
  skills: job?._source?.expectation?.skills || [],
  documents: getDocumentsAndAssets(job?._source?.expectation),
  organizationPopularName: job?._source?.organization?.popular_name || '',
  pointOfContacts: getPOCDetails(job?._source?.point_of_contacts),
  disableFA: !!job?._source?.functional_area?.id,
  visibleFA: true,
  disableFields: job?._source?.state ? ['J_D', 'J_O'].includes(job._source.state) && job._source.stage !== 'J_UA' : false,
  stage: job?._source?.stage,
  state: job?._source?.state,
  slug: job?._source?.slug,
  totalApplications: getTotalApplications(job?._source?.application_stats),
  pricingPlanType: job?._source?.pricing_plan_type,
  activeTag: job?._source?.is_active,
  banner: getBanner(job),
  jobStatus: getJobStatus(job),
  shareContact: job?._source?.share_contact_to_public || false,
  completionScore: job?._source?.completion_score,
  created: dayjs(job?._source?.created).format('DD MMM YYYY').toString(),
  modified: dayjs(job?._source?.modified).format('DD MMM YYYY').toString(),
  expired: dayjs(job?._source?.valid_till).format('DD MMM YYYY') || '',
  featuredUntil: job?._source?.featured_until ? job._source.featured_until != null && dayjs(job._source.featured_until).format('DD MMM YYYY') : '',
  paused: job?._source?.paused_on ? dayjs(job?._source?.paused_on).format('DD MMM YYYY').toString() : '',
  orgId: job?._source?.organization?.id,
  assessmentId: job?._source?.assessment?.filter((a) => a?.active).map((a) => a?.id) || [],
  assessment: job?._source?.assessment?.filter((a) => a?.active)?.map((a) => ({
    id: a?.id,
    title: a?.assessment_title,
    description: a?.assessment_description,
  })),
});

const getFlatDefaultJobData = (data): IDefaultJobInfo => ({
  hiringOrgName: '',
  clientApprovalRequired: data?.client_approval_required || false,
  employmentType: data?.employment_type || 'FT',
  workDays: getWorkDays(data?.working_days_info?.days),
  shiftType: 'DAY',
  shiftStartTime: '09:00:00',
  shiftEndTime: '18:00:00',
  minOfferedSalary: data?.salary_details?.min_salary || 15000,
  maxOfferedSalary: data?.salary_details?.max_salary || 25000,
  description: data?.description || '',
  proficiencyLevel: data?.proficiency_level,
  experienceRange: convertExperienceRange(
    (data?.experience?.min_experience || 0) * 12,
    (data?.experience.max_experience || 0) * 12,
  ),
  experienceLevel: data?.experience.max_experience !== 0 ? 'experienced' : 'fresher',
  minExperience: data?.experience?.min_experience || 0,
  maxExperience: data?.experience?.max_experience || 0,
  minPreferredAge: data?.min_preferred_age || 18,
  maxPreferredAge: data?.max_preferred_age || 30,
  genderPreference: data?.gender_preference || 'M',
  englishProficiency: data?.language_proficiency || 1,
  isResumeSubscribed: data?.is_resume_subscribed || false,
});

const checkSpecialCharacters = (value): boolean => {
  const imgPattern = new RegExp(`${imagePattern.source}`);
  return imgPattern.test(value);
};

export {
  functionalAreaElasticFilter,
  getFlatJobData,
  getFlatDefaultJobData,
  checkSpecialCharacters,
};
