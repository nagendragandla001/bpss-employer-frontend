/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import has from 'lodash/has';
import isArray from 'lodash/isArray';
import {
  applicationAPI,
  combineService,
  searchAPI,
  searchMobileAPI,
} from 'service/application-card-service';

export interface MatchingCriteria {
  type: string;
  name: number | string | Array<any>;
  status: 'matched' | 'un_matched' | 'no_data';
}
export interface CMSInterface {
  documents_and_assets: Array<MatchingCriteria>;
  required_criteria: Array<MatchingCriteria>;
  score: number;
}

export interface ApplicationDataInterface {
  name: string;
  age: number;
  gender: string;
  appliedJobTitle: string;
  candidateAddress: string;
  experience: string;
  candidateEducation: string;
  noticePeriod: string;
  expectedSalary: string;
  currentSalary: string;
  candidateResume: string;
  applicationId: string;
  candidateContactUnblocked: boolean;
  appliedJobPricingPlan: string;
  applicationCreatedDate: string;
  candidateEmail: string;
  candidateMobileNo: any;
  applicationStage: string;
  isNewApplication: boolean;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewAttendance: string;
  appliedJobType: string;
  appliedJobId: string;
  suggestedSlotTemplateName: string;
  suggestedSlotTemplateId: string;
  candidateJoiningDate: string;
  appliedJobLocation: string;
  interviewAttendanceByCandidate: string;
  applicationOnHold: boolean;
  profileAvatarIndex: number;
  cms?: CMSInterface;
  previousCompany: string;
  preSkilled: boolean;
}
export interface DatabaseTabInterface {
  name: string;
  age: number;
  gender: string;
  appliedJobTitle: string;
  candidateAddress: string;
  experience: string;
  candidateEducation: string;
  noticePeriod: string;
  expectedSalary: string;
  currentSalary: string;
  candidateResume: string;
  candidateId: string;
  candidateContactUnblocked: boolean;
  appliedJobPricingPlan: string;
  applicationCreatedDate: string;
  candidateEmail: string;
  candidateMobileNo: any;
  appliedJobId: string;
  profileAvatarIndex: number;
  lastActiveOn: string;
  activeTag: boolean;
  cms: CMSInterface;
  preSkilled: boolean;
}

const educationLevel = [
  'Less than 10th',
  '10th',
  '12th',
  'Pursuing Graduate',
  'Graduate',
  'Post Graduate',
  'Doctorate',
  'Diploma',
];

export const selectedFiltersDict = {
  pre_skilled: 'Pre-skilled Candidates',
  public_resume: 'Public Resume',
  freeUnlock: 'Free Unlocks',
  walk_in: 'Walk in Jobs',
  interviewToday: 'Interview Today',
  interviewTomorrow: 'Interview Tomorrow',
  interview_done: 'Interview Done',
  rejected: 'Rejected',
  joined: 'Joined',
  offer_accepted: 'Offer Accepted',
  offer_rejected: 'Offer Rejected',
  left_job: 'Left Job',
  education_less_than_10th: 'Education less than 10th',
  education_10th: 'Education 10th',
  education_12th: 'Education 12th',
  education_diploma: 'Education Diploma',
  education_graduate: 'Education Gradudate',
  gender_male: 'Male Gender',
  gender_female: 'Female Gender',
  created_today: 'Created Today',
  created_yesterday: 'Created Yesterday',
  created_last7days: 'Created last 7 days',
  created_last14days: 'Created last 14 days',
  created_last30days: 'Created last 30 days',
  created_before30days: 'Created before 30 days',
  activeCandidate: 'Only Active Candidate',
  unlockCandidate: 'Unlocked Candidate',
  lockCandidate: 'Locked Candidate',
  age_filter: 'Age Filter',
  experience_filter: 'Experience Filter',
  candidate_locked: 'Candidate Contact Locked',
  candidate_unlocked: 'Candidate Contact Unlocked',
};

export const educationFilters = ['education_less_than_10th', 'education_10th', 'education_12th', 'education_diploma', 'education_graduate'];
export const genderFilters = ['gender_male', 'gender_female', 'gender_all'];
export const applicationCreatedOnFilters = ['created_today', 'created_yesterday', 'created_last7days', 'created_last14days', 'created_last30days', 'created_before30days', 'created_all'];
export const applicationStatusFilters = ['interviewToday', 'interviewTomorrow', 'interview_done', 'rejected', 'joined', 'offer_accepted', 'offer_rejected', 'left_job'];
export const applicationStageFilters = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export const getMinMaxAge = (ageList): Array<number> => {
  const ages = [0, 0];
  ageList.forEach((age) => {
    if (age.includes('age_min')) {
      ages[0] = age.slice(8);
    } else if (age.includes('age_max')) {
      ages[1] = age.slice(8);
    }
  });
  return ages;
};

export const getMinMaxExp = (expList): Array<number> => {
  const exps = [0, 0];
  expList.forEach((exp) => {
    if (exp.includes('experience_min')) {
      exps[0] = exp.slice(15);
    } else if (exp.includes('experience_max')) {
      exps[1] = exp.slice(15);
    }
  });
  return exps;
};

const formatMonths = (
  experience: number | null,
  isExperience: boolean,
): string => {
  if (!experience || (!isExperience && experience === 0)) {
    return '';
  }
  if (experience % 12 === 0) {
    return experience === 0
      ? 'Fresher'
      : `${experience / 12}Yr${experience === 1 ? '' : 's'}`;
  }
  if (Math.floor(experience / 12) !== 0) {
    return `${Math.floor(experience / 12)}Yr${experience === 1 ? '' : 's'} ${
      experience % 12
    } Months`;
  }
  return `${experience % 12} Months`;
};

const formatSalary = (salary: number | null, format = 0): string => {
  if (!salary) {
    return '';
  }
  if (salary <= 99999) {
    return `${salary.toLocaleString('en-IN')} ${format === 0 ? 'CTC' : 'PM'}`;
  }
  if (salary <= 9999999) {
    return `${(salary / 100000).toFixed(2)} Lakhs ${
      format === 0 ? 'CTC' : 'PM'
    }`;
  }
  return `${(salary / 10000000).toFixed(2)} Crores ${
    format === 0 ? 'CTC' : 'PM'
  }`;
};
const formatGraphqlSalary = (
  salary: number | null,
  format = 'ANNUAL',
): string => {
  if (!salary) {
    return '';
  }
  if (salary <= 99999) {
    return `${salary.toLocaleString('en-IN')} ${
      format === 'ANNUAL' ? 'CTC' : 'PM'
    }`;
  }
  if (salary <= 9999999) {
    return `${(salary / 100000).toFixed(2)} Lakhs ${
      format === 'ANNUAL' ? 'CTC' : 'PM'
    }`;
  }
  return `${(salary / 10000000).toFixed(2)} Crores ${
    format === 'ANNUAL' ? 'CTC' : 'PM'
  }`;
};

const checkIfNew = (createdDate): boolean => {
  const appCreatedDate = dayjs(createdDate);
  const currentDate = dayjs(new Date());
  const diff = currentDate.diff(appCreatedDate, 'h');
  if (diff > 0 && diff <= 24) return true;
  return false;
};

const getProfileAvatarIndex = (name: string): number => {
  let total = 0;
  for (let i = 0; i < name.length; i += 1) {
    total += name.charCodeAt(i);
  }
  return total % 3;
};
export const getAddressIndex = (name: string): number => {
  let total = 0;
  for (let i = 0; i < name.length; i += 1) {
    total += name.charCodeAt(i);
  }
  return total % 8;
};

export const flatTheApplication = (item): ApplicationDataInterface => ({
  applicationId: item?._id || '',
  applicationCreatedDate: item?._source?.created || '',
  applicationStage: item?._source?.stage || '',
  candidateContactUnblocked: item?._source?.candidate?.user?.contact_unblocked || false,
  candidateEmail: item?._source?.candidate?.user?.email || '',
  candidateMobileNo: item?._source?.candidate?.user?.mobile || '',
  appliedJobPricingPlan: item?._source?.job?.pricing_plan_type || '',
  name: item?._source?.candidate?.user?.first_name
    ? `${item._source.candidate.user.first_name} ${item._source.candidate.user.last_name}` : '',
  age: item?._source?.candidate?.user?.age || 0,
  gender: item?._source?.candidate?.user?.gender || '',
  appliedJobTitle: item?._source?.job?.title || '',
  candidateAddress: item?._source?.candidate?.address?.place?.short_formatted_address || '',
  experience: item?._source?.candidate?.total_experience
    ? formatMonths(item._source.candidate.total_experience, true) : '',
  candidateEducation: item?._source?.candidate?.education_level
    ? educationLevel[item._source.candidate.education_level] : '',
  noticePeriod: item?._source?.candidate?.expectation?.notice_period ? formatMonths(
    item._source.candidate.expectation.notice_period,
    false,
  ) : '',
  expectedSalary: item?._source?.candidate?.salary_info?.expected_salary ? formatSalary(
    item._source.candidate.salary_info.expected_salary,
    item._source.candidate.salary_info.expected_salary_format,
  ) : '',
  currentSalary: item?._source?.candidate?.salary_info?.current_salary ? formatSalary(
    item._source.candidate.salary_info.current_salary,
    item._source.candidate.salary_info.current_salary_format,
  ) : '',
  candidateResume: item?._source?.candidate?.public_resume || '',
  isNewApplication: item?._source?.created ? checkIfNew(item._source.created) : false,
  interviewStartTime: item?._source?.interview?.duration?.lower || '',
  interviewEndTime:
      (has(item, '_source.interview.duration.upper')
        && item._source.interview.duration.lower)
      || '',
  interviewAttendance:
      (has(item, '_source.interview.attendance')
        && item._source.interview.attendance)
      || '',
  appliedJobType:
      (has(item, '_source.job.client_approval_required')
        && (item._source.job.client_approval_required ? 'CAR' : 'NCAR'))
      || '',
  appliedJobId: (has(item, '_source.job.id') && item._source.job.id) || '',

  suggestedSlotTemplateName:
      (has(item, '_source.suggested_slot_template.template.name')
        && item._source.suggested_slot_template.template.name)
      || '',
  suggestedSlotTemplateId:
      (has(item, '_source.suggested_slot_template.template.id')
        && item._source.suggested_slot_template.template.id)
      || '',
  candidateJoiningDate:
      (has(item, '_source.selection.date_of_joining')
        && item._source.selection.date_of_joining)
      || '',
  appliedJobLocation:
      (has(item, '_source.job.places')
        && isArray(item._source.job.places)
        && item._source.job.places.length
        && item._source.job.places[0].short_formatted_address)
      || '',
  interviewAttendanceByCandidate:
      (has(item, '_source.interview.attendance_by_candidate')
        && item._source.interview.attendance_by_candidate)
      || '',
  applicationOnHold:
      (has(item, '_source.on_hold') && item._source.on_hold) || false,
  profileAvatarIndex:
      (has(item, '_source.candidate.user.first_name')
        && item._source.candidate.user.first_name
        && getProfileAvatarIndex(
          `${item._source.candidate.user.first_name} ${item._source.candidate.user.last_name || ''
          }`,
        ))
      || 0,
  previousCompany: item?._source?.prev_company,
  preSkilled: item?._source?.pre_skilled || false,
});

const getFlatApplicationData = (
  ApplicationData,
): {
  applicationData: Array<ApplicationDataInterface>;
  applicationsCount: number;
} => {
  const applicationData = ApplicationData;
  let flatApplicationData: Array<ApplicationDataInterface> = [];
  let applicationsCount = 0;
  if (
    applicationData
    && applicationData.objects
    && Array.isArray(applicationData.objects)
    && applicationData.objects.length
  ) {
    flatApplicationData = applicationData.objects.map((item) => ({
      applicationId: (has(item, '_id') && item._id) || '',
      applicationCreatedDate:
        (has(item, '_source.created') && item._source.created) || '',
      applicationStage:
        (has(item, '_source.stage') && item._source.stage) || '',
      candidateContactUnblocked:
        (has(item, '_source.candidate.user.contact_unblocked')
          && item._source.candidate.user.contact_unblocked)
        || false,
      candidateEmail:
        (has(item, '_source.candidate.user.email')
          && item._source.candidate.user.email)
        || '',
      candidateMobileNo:
        (has(item, '_source.candidate.user.mobile')
          && item._source.candidate.user.mobile)
        || '',
      appliedJobPricingPlan:
        (has(item, '_source.job.pricing_plan_type')
          && item._source.job.pricing_plan_type)
        || '',
      name:
        (has(item, '_source.candidate.user.first_name')
          && item._source.candidate.user.first_name
          && `${item._source.candidate.user.first_name} ${
            item._source.candidate.user.last_name || ''
          } `)
        || '',
      age:
        (has(item, '_source.candidate.user.age')
          && item._source.candidate.user.age)
        || 0,
      gender:
        (has(item, '_source.candidate.user.gender')
          && item._source.candidate.user.gender)
        || '',
      appliedJobTitle:
        (has(item, '_source.job.title') && item._source.job.title) || '',
      candidateAddress:
        (has(item, '_source.candidate.address.place.short_formatted_address')
          && item._source.candidate.address.place.short_formatted_address)
        || '',
      experience:
        (has(item, '_source.candidate.total_experience')
          && formatMonths(item._source.candidate.total_experience, true))
        || '',
      candidateEducation:
        (has(item, '_source.candidate.education_level')
          && educationLevel[item._source.candidate.education_level])
        || '',
      noticePeriod:
        (has(item, '_source.candidate.expectation.notice_period')
          && item._source.candidate.expectation
          && formatMonths(
            item._source.candidate.expectation.notice_period,
            false,
          ))
        || '',
      expectedSalary:
        (has(item, '_source.candidate.salary_info.expected_salary')
          && item._source.candidate.salary_info
          && formatSalary(
            item._source.candidate.salary_info.expected_salary,
            item._source.candidate.salary_info.expected_salary_format,
          ))
        || '',
      currentSalary:
        (has(item, '_source.candidate.salary_info.current_salary')
          && item._source.candidate.salary_info
          && formatSalary(
            item._source.candidate.salary_info.current_salary,
            item._source.candidate.salary_info.current_salary_format,
          ))
        || '',
      candidateResume:
        (has(item, '_source.candidate.public_resume')
          && item._source.candidate.public_resume)
        || '',
      isNewApplication:
        (has(item, '_source.created') && checkIfNew(item._source.created))
        || false,
      interviewStartTime:
        (has(item, '_source.interview.duration.lower')
          && item._source.interview.duration.lower)
        || '',
      interviewEndTime:
        (has(item, '_source.interview.duration.upper')
          && item._source.interview.duration.lower)
        || '',
      interviewAttendance:
        (has(item, '_source.interview.attendance')
          && item._source.interview.attendance)
        || '',
      appliedJobType:
        (has(item, '_source.job.client_approval_required')
          && (item._source.job.client_approval_required ? 'CAR' : 'NCAR'))
        || '',
      appliedJobId: (has(item, '_source.job.id') && item._source.job.id) || '',

      suggestedSlotTemplateName:
        (has(item, '_source.suggested_slot_template.template.name')
          && item._source.suggested_slot_template.template.name)
        || '',
      suggestedSlotTemplateId:
        (has(item, '_source.suggested_slot_template.template.id')
          && item._source.suggested_slot_template.template.id)
        || '',
      candidateJoiningDate:
        (has(item, '_source.selection.date_of_joining')
          && item._source.selection.date_of_joining)
        || '',
      appliedJobLocation:
        (has(item, '_source.job.places')
          && isArray(item._source.job.places)
          && item._source.job.places.length
          && item._source.job.places[0].short_formatted_address)
        || '',
      interviewAttendanceByCandidate:
        (has(item, '_source.interview.attendance_by_candidate')
          && item._source.interview.attendance_by_candidate)
        || '',
      applicationOnHold:
        (has(item, '_source.on_hold') && item._source.on_hold) || false,
      profileAvatarIndex:
        (has(item, '_source.candidate.user.first_name')
          && item._source.candidate.user.first_name
          && getProfileAvatarIndex(
            `${item._source.candidate.user.first_name} ${
              item._source.candidate.user.last_name || ''
            }`,
          ))
        || 0,
      cms: item?._source?.cms,
      previousCompany: item?._source?.prev_company,
      preSkilled: item?._source?.pre_skilled || false,
    }));
  }
  if (applicationData && applicationData.meta && applicationData.meta.count) {
    applicationsCount = applicationData.meta.count;
  }
  return { applicationData: flatApplicationData, applicationsCount };
};

export const flatDatabaseDataFunc = (
  DatabaseData,
  job,
): {
  DatabaseData: Array<DatabaseTabInterface>;
  applicationsCount: number;
} => {
  const applicationData = DatabaseData;
  let flatDatabaseData: Array<DatabaseTabInterface> = [];
  let applicationsCount = 0;
  if (
    applicationData
    && applicationData.edges
    && Array.isArray(applicationData.edges)
    && applicationData.edges.length
  ) {
    flatDatabaseData = applicationData.edges.map((item) => ({
      candidateId: item?.id || '',
      candidateEmail: item?.unlocked_user?.email || '',
      candidateMobileNo: item?.unlocked_user?.mobile || '',
      name: item?.user?.first_name
      && `${item?.user?.first_name} ${item?.user?.last_name || ''}`,
      age: item?.user?.age || 0,
      gender: item?.user?.gender === 'NOT_SPECIFIED' ? '' : (item?.user?.gender[0] || ''),
      candidateAddress: item?.address?.place?.short_formatted_address || '',
      experience: formatMonths(item?.total_experience, true) || '',
      candidateEducation: item?.educations[0]?.proficiency_level || '',
      noticePeriod: formatMonths(item?.expectation?.notice_period, false) || '',
      expectedSalary: (item?.salary
      && formatGraphqlSalary(item?.salary?.expected_salary, item?.salary?.expected_salary_format)) || '',
      currentSalary: (item?.salary
      && formatGraphqlSalary(item?.salary?.current_salary, item?.salary?.current_salary_format)) || '',
      candidateResume: (item?.public_resume) || '',
      profileAvatarIndex: (item?.user.first_name
      && getProfileAvatarIndex(`${item?.user?.first_name} ${item?.user?.last_name || ''}`)) || 0,
      applicationCreatedDate: (item?.created) || '',
      lastActiveOn: (item?.modified) || '',
      activeTag: ((item?.tags) && item?.tags?.length > 0 && item?.tags?.includes('Hot')) || false,
      candidateContactUnblocked: item?.is_unlocked || false,
      appliedJobTitle: job.jobTitle,
      appliedJobId: job.jobId,
      cms: item?.cms || [],
      preSkilled: item?.pre_skilled || false,
    }));
    if (DatabaseData && DatabaseData.totalCount) {
      applicationsCount = DatabaseData.totalCount;
    }
  }
  return { DatabaseData: flatDatabaseData, applicationsCount };
};

export const getApplicationData = async (
  offset: number,
  limit = 10,
  sortBy: string,
): Promise<{
  applicationData: Array<ApplicationDataInterface>;
  applicationsCount: number;
}> => {
  const apiCall = await applicationAPI(limit, offset, sortBy);
  const ApplicationData = await apiCall.data;
  return getFlatApplicationData(ApplicationData);
};
export const getAllApplicationData = async (
  offset: number,
  limit: number,
  sortBy: string,
): Promise<{
  applicationData: Array<ApplicationDataInterface>;
  applicationsCount: number;
}> => {
  const apiCall = await applicationAPI(limit, offset, sortBy);
  const ApplicationData = await apiCall.data;
  return getFlatApplicationData(ApplicationData);
};

export const getFilterSpecificApplicaticationData = async (
  offset: number,
  limit: number,
  values,
  jobId: string,
  sortBy: string,
): Promise<{
  applicationData: Array<ApplicationDataInterface>;
  applicationsCount: number;
}> => {
  const apiCall = await combineService(offset, limit, values, jobId, sortBy);
  const ApplicationData = await apiCall.data;
  return getFlatApplicationData(ApplicationData);
};
export const getSearchSpecificApplicaticationData = async (
  offset: number,
  limit: number,
  search,
  filter,
  jobId,
  sortBy,
): Promise<{
  applicationData: Array<ApplicationDataInterface>;
  applicationsCount: number;
}> => {
  const apiCall = await searchAPI(limit, offset, search, filter, jobId, sortBy);
  const ApplicationData = await apiCall.data;
  return getFlatApplicationData(ApplicationData);
};
export const getSearchSpecificApplicaticationMobileData = async (
  offset: number,
  limit: number,
  search,
): Promise<{
  applicationData: Array<ApplicationDataInterface>;
  applicationsCount: number;
}> => {
  const apiCall = await searchMobileAPI(limit, offset, search, 'recent_slots');
  const ApplicationData = await apiCall.data;
  return getFlatApplicationData(ApplicationData);
};

export interface OrgOfficesType {
  address: string;
  formattedAddress: string;
  id: number;
  location: string;
  placeId: string;
}

export interface OrgManagersType {
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export interface OrganizationDetailsType {
  name?: OrganizationDetailsType | undefined;
  id: string;
  managers: Array<OrgManagersType>;
  offices: Array<OrgOfficesType>;
}

const getManagersList = (managersList): Array<OrgManagersType> => managersList.map(
  (item) => ({
    type: item.type || '',
    firstName: item?.user?.first_name || '',
    lastName: item?.user?.last_name || '',
    email: item?.user?.email || '',
    mobile: item?.user?.mobile || '',
  }),
);

const getOrgOfficesList = (officesList): Array<OrgOfficesType> => officesList.map(
  (item) => ({
    address: item.address || '',
    id: item.id,
    formattedAddress: (item.place && item.place?.formatted_address) || '',
    location: (item.place && item.place?.location) || '',
    placeId: (item.place && item.place?.place_id) || '',
  }),
);

// orgData is api data, so it cannot be typed
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getFlatOrgData = (orgData): OrganizationDetailsType => ({
  id:
    (orgData
      && orgData.objects
      && orgData.objects.length > 0
      && orgData.objects[0]._source
      && orgData.objects[0]._source.id)
    || '',
  managers:
    orgData
    && orgData.objects
    && orgData.objects.length > 0
    && orgData.objects[0]._source
    && orgData.objects[0]._source.managers.length > 0
      ? getManagersList(orgData.objects[0]._source.managers)
      : [],
  offices:
    orgData
    && orgData.objects
    && orgData.objects.length > 0
    && orgData.objects[0]._source
    && orgData.objects[0]._source.offices.length > 0
      ? getOrgOfficesList(orgData.objects[0]._source.offices)
      : [],
});

export interface recommmendTemplatesType {
  interviewStartTime: string;
  interviewEndTime: string;
  interviewDuration: number;
  templateId: number;
  SortedInterviewDates: Array<{ d: string; date: string; day: string }>;
  interviewType: string;
  suggestedTo: number;
}
