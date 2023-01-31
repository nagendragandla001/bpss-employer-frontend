/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import { getJobDetailsAPI, jobFutureSlots, patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  getdegreearr, getreq,
} from 'stores/setupJobpostStore';
import has from 'lodash/has';
import isArray from 'lodash/isArray';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import calendar from 'dayjs/plugin/calendar';
import { getTotalApplications } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';

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

interface FunctionAreaType {
  id: number,
  name: string
}
interface CallPocType {
  name: string,
  contact: string,
}
interface LanguageType {
  language: number,
  proficiency: number;
  mode: number[];
}
interface ShiftType {
  workStartTime: string,
  workEndTime: string,
  type: string;
  maleOnly: boolean;
}
interface PointOfContact {
  name: string,
  email: string,
  mobile: number,
  id:string
}
interface LocationType {
  // eslint-disable-next-line camelcase
  place_id: any,
  description: any,
  vacancies: number,
  city: string,
  state: string,
}

export interface IAssessmentData{
  active: boolean;
  description: string;
  id: string;
  title: string;
  skills: Array<string>;
}
export interface JobDetailsType {
  id: string;
  logo: string,
  title: string;
  hiringOrgName: string;
  jobslug: string,
  orgId: string;
  expiryDate: string | null;
  pausedDate: string;
  orgSlug: string;
  functionalArea: FunctionAreaType,
  functionalAreaName: string,
  functionalAreaId: number,
  description: string,
  completionScore: number,
  approvedDate: string;
  modifiedDate: string,
  createdDate: string,
  employmentType: string,
  jobState: string,
  jobStage: string,
  shareContact: string,
  callPoc: CallPocType
  callHrEnabled: boolean,
  callHrOpted: boolean,
  locations: Array<LocationType>,
  minOfferSalary: number,
  maxOfferSalary: number,
  workingDays: number,
  workingDaysComment: string,
  shifts: Array<ShiftType>,
  minAge: number,
  maxAge: number,
  ageMandatory: boolean,
  minExp: number,
  maxExp: number,
  experienceMandatory: boolean,
  industryMandatory: boolean;
  candidateFunctionalarea: any;
  candidateIndustries: any;
  gender: string;
  genderMandatory: boolean,
  clientApprovalRequired: boolean,
  isResumeSubscribed: boolean,
  isCallPocNull: boolean,
  proficiencyLevel: number,
  proficiencyMandatory: boolean,
  totalOpening: number,
  pointOfContact: Array<PointOfContact>,
  languageList: Array<LanguageType>;
  salaryFormat: number;
  pricingPlanType: string;
  organizationPopularName: string;
  // appliedApplications: number;
  // interviewedApplications: number;
  // selectedApplications: number;
  totalApplications: number;
  createdBy: string;
  preferredSkills: Array<string>;
  mandatorySkills: Array<string>;
  documentOwnership: any;
  vehicleOwnership: any;
  mobileOwnership: any;
  laptop: boolean;
  vehicleMandatory: boolean,
  phoneMandatory: boolean;
  laptopMandatory: boolean;
  degreeData: any;
  miscRequirements: Array<string>;
  activeTag: any;
  organizationLogo: string;
  organizationName: string;
  expectedSalary: boolean
  pocList: any;
  appliedJobType: string;
  banner:string|null
  jobStatus: string | null;
  cityName: string;
}
const getlocarr = (data): Array<LocationType> => {
  if (data && data.length) {
    return data.map((d) => ({
      place_id: d.place.place_id,
      description: `${d.place.short_formatted_address}, ${d.place.state}, India`,
      vacancies: d.vacancies || 0,
      city: d.place.city,
      state: d.place.state,
    }));
  }
  return [];
};
const getpointOfContactarr = (data): Array<PointOfContact> => {
  if (data && data.length) {
    return data.map((d) => ({
      name: `${d.user.first_name} ${d.user.last_name}`,
      email: d.user.email,
      mobile: d.user.mobile || 0,
      id: d.user.id,
    }));
  }
  return [];
};
const getshiftarr = (data): Array<ShiftType> => {
  if (data && data.length > 0) {
    return data.map((s) => ({
      workStartTime: s.work_start_time,
      workEndTime: s.work_end_time,
      type: s.type,
      maleOnly: s.male_only,
    }));
  }
  return [];
};
const getDocument = (data): Array<any> => {
  if (data && data.length > 0) {
    return data.map((d) => ({
      name: d.name,
      id: d.id,

    }));
  }
  return [];
};
const getlangarr = (data): Array<LanguageType> => {
  if (data && data.length > 0) {
    return data.map((d) => ({
      language: d.language.id,
      proficiency: d.proficiency,
      mode: d.modes,
    }));
  }
  return [];
};
const getdata = (data): Array<string> => {
  const skill = [] as Array<string>;

  if (data && data.length > 0) {
    data.map((s) => skill.push(s.name));
    return [...skill];
  }
  return [];
};
export const stripHtmlTags = (str: string | null): any => {
  if (str == null || str === '') return false;
  const updatedstr = str.toString();
  return updatedstr.replace(/<[^>]*>?/gm, '');
};

const getOpenBanner = (job): string | null => {
  if (job?._source?.state === 'J_O' && job?._source?.stage === 'J_A') {
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
      if ((has(job, '_source.is_active')
    && !job._source.is_active) && (has(job, '_source.created') && job._source.created)) {
        const createDate = dayjs(job._source.created);
        const currDate = dayjs(new Date());
        if (createDate.isBetween(currDate.subtract(2, 'day'), currDate)) {
          return 'activeTip';
        }
      }
      return 'premiumPromotion';
    }
  }
  return null;
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
  const banner = getOpenBanner(job);
  return banner === 'activeTip' || banner === null ? 'open' : getOpenBanner(job);
  // return getOpenBanner(job) ? getOpenBanner(job) : 'open';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getFlatJobDetailsData = (JobData): JobDetailsType => ({
  id: JobData?._source?.id || '',
  logo: JobData?._source?.organization?.logo || '',
  orgId: JobData?._source?.organization?.id || '',
  orgSlug: JobData?._source?.organization?.slug || '',
  jobslug: JobData?._source?.slug || '',
  expiryDate: JobData?._source?.valid_till || '',
  pausedDate: JobData?._source?.paused_on || '',
  title: JobData?._source?.title || '',
  hiringOrgName: JobData?._source?.hiring_org_name || '',
  organizationPopularName: JobData?._source?.organization?.popular_name || '',
  totalApplications: getTotalApplications(JobData?._source?.application_stats) || 0,
  createdDate: JobData?._source?.created || '',
  createdBy: `${JobData?._source?.created_by?.first_name}${JobData?._source?.created_by?.last_name}` || '',
  activeTag: JobData?._source?.is_active,
  functionalArea: JobData?._source?.functional_area,
  functionalAreaName: JobData?._source?.functional_area?.name,
  functionalAreaId: JobData?._source?.functional_area?.id,
  description: JobData?._source?.description,
  completionScore: parseInt(JobData?._source?.completion_score || 0, 10),
  approvedDate: JobData?._source?.approved_on,
  modifiedDate: JobData?._source?.modified,
  employmentType: JobData?._source?.employment_type,
  jobStage: JobData?._source?.stage,
  jobState: JobData?._source?.state,
  callHrEnabled: true,
  callHrOpted: false,
  callPoc: JobData?._source?.call_poc,
  isCallPocNull: !JobData?._source?.call_poc || false,
  locations: getlocarr(JobData?._source?.locations),
  salaryFormat: JobData?._source?.offer?.salary_format,
  minOfferSalary: JobData?._source?.offer?.min_offered_salary,
  maxOfferSalary: JobData?._source?.offer?.max_offered_salary,
  workingDays: JobData?._source?.working_days?.count,
  workingDaysComment: JobData?._source?.working_days?.comments || 'SAT and SUN are off',
  shifts: getshiftarr(JobData?._source?.shifts),
  minAge: JobData?._source?.expectation?.min_preferred_age,
  maxAge: JobData?._source?.expectation?.max_preferred_age,
  ageMandatory: false,
  minExp: JobData?._source?.expectation?.work_exp_requirements?.min_experience,
  maxExp: JobData?._source?.expectation?.max_experience,
  experienceMandatory: false,
  shareContact: JobData?._source?.share_contact_to_public,
  clientApprovalRequired: JobData?._source?.client_approval_required,
  isResumeSubscribed: JobData?._source?.is_resume_subscribed,
  candidateFunctionalarea: getDocument(
    JobData?._source?.expectation?.work_exp_requirements?.functional_areas,
  ) || [],
  candidateIndustries: getDocument(
    JobData?._source?.expectation?.work_exp_requirements?.industries,
  ) || [],
  industryMandatory: false,
  gender: JobData?._source?.expectation?.gender_preference || 'D',
  genderMandatory: false,
  proficiencyLevel: JobData?._source?.expectation?.proficiency_level,
  proficiencyMandatory: false,
  mandatorySkills: getdata(JobData?._source?.expectation?.skills),
  preferredSkills: getdata(JobData?._source?.expectation?.preferred_skills),
  totalOpening: JobData?._source?.vacancies,
  pointOfContact: getpointOfContactarr(JobData?._source?.point_of_contacts),
  languageList: getlangarr(JobData?._source?.language_preferences),
  degreeData: getdegreearr(JobData?._source?.expectation?.degree_requirements),
  miscRequirements: getreq(JobData?._source?.expectation?.misc_requirements),
  vehicleOwnership: getDocument(JobData?._source?.expectation?.vehicle_ownership),
  mobileOwnership: JobData?._source?.expectation?.mobile_ownership,
  documentOwnership: getDocument(JobData?._source?.expectation?.document_ownership),
  laptop: JobData?._source?.expectation?.laptop_required || false,
  laptopMandatory: JobData?._source?.expectation?.is_laptop_requirement_mandatory || false,
  vehicleMandatory: JobData?._source?.expectation?.is_vehicle_ownership_mandatory || false,
  phoneMandatory: JobData?._source?.expectation?.is_mobile_ownership_mandatory || false,
  expectedSalary: JobData?._source?.expectation?.is_expected_salary_required || false,
  pricingPlanType: JobData?._source?.pricing_plan_type,
  organizationLogo: JobData?._source?.organization?.logo || '',
  organizationName: JobData?._source?.organization?.popular_name || '',
  pocList: JobData?._source?.point_of_contacts,
  appliedJobType: JobData?._source?.client_approval_required ? 'CAR' : 'NCAR' || '',
  banner: getOpenBanner(JobData),
  jobStatus: getJobStatus(JobData),
  cityName: JobData?._source?.city_name,
});
export interface slotI {
  slotinterviewType: string;
  pocName: string;
  pocContact: string;
  interviewDuration: number;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewDates: any;
  interviewEndDate: any;
  interviewStartDate:any;
  id:number

}
const add = (arr, name): any[] => {
  const found = arr.some((el) => el.d === name.d);
  if (!found) arr.push(name);
  return arr;
};
const getInterviewDate = (datesData): Array<string> => {
  const arr = [] as any;
  for (let i = 0; i < datesData.length; i += 1) {
    const obj = {
      d: dayjs(datesData[i].start_dt).format('YYYY-MM-DD'),
      m: dayjs(datesData[i].start_dt).format('D MMM'),
      date: dayjs(datesData[i].start_dt).format('DD'),
      day: dayjs(datesData[i].start_dt).format('dd'),
    };

    add(arr, obj);
  }
  return arr;
};
const sortDate = (interviewDates): Array<any> => {
  let SortedInterviewDates:Array<{d:string, m:string, date: string, day: string}> = [];
  SortedInterviewDates = interviewDates.sort((a, b) => dayjs(a.d).diff(b.d));
  // const StartDate = SortedInterviewDates[0].m;
  // const EndDate = SortedInterviewDates[SortedInterviewDates.length - 1].m;

  return SortedInterviewDates;
};

export const getFlatJobSlotData = (slotData): slotI => ({
  slotinterviewType: (slotData[0].interview_type),
  pocName: (slotData[0].poc.name),
  pocContact: (slotData[0].poc.contact),
  interviewDuration: (slotData[0].duration),
  interviewStartTime: (slotData[0].start_dt),
  interviewEndTime: (slotData[0].end_dt),
  interviewEndDate: sortDate(getInterviewDate(slotData))[
    sortDate(getInterviewDate(slotData)).length - 1],
  interviewDates: sortDate(getInterviewDate(slotData)),
  interviewStartDate: sortDate(getInterviewDate(slotData))[0],
  id: slotData[0].id,
});
function groupBy(arr, property) {
  // console.log(arr);
  return arr.reduce((memo, x) => {
    // eslint-disable-next-line no-param-reassign
    if (!memo[x[property]]) { memo[x[property]] = []; }
    memo[x[property]].push(x);
    return memo;
  }, {});
}
export const getSlotTypeData = (slotType): any => {
  const arrdata = [] as any;
  const slotdata = [] as any;
  if (slotType?.objects?.length > 0) {
    for (let i = 0; i < slotType.objects.length; i += 1) {
      arrdata.push(slotType.objects[i]._source);
    }
    const data = groupBy(arrdata, 'interview_type');

    if (data.FACE) { slotdata.push(getFlatJobSlotData(data.FACE)); }
    if (data.TELE) { slotdata.push(getFlatJobSlotData(data.TELE)); }
    if (data.HANG_VID) { slotdata.push(getFlatJobSlotData(data.HANG_VID)); }
    if (data.WHATSAPP_VID) { slotdata.push(getFlatJobSlotData(data.WHATSAPP_VID)); }
    if (data.VID) { slotdata.push(getFlatJobSlotData(data.VID)); }
    if (data.OTHER) { slotdata.push(getFlatJobSlotData(data.OTHER)); }
  }

  return slotdata;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJobDetailsData = async (id:string): Promise<any> => {
  const apiCall = await getJobDetailsAPI(id);
  const JobData = await apiCall.data;
  return getFlatJobDetailsData(JobData);
};

export const patchJobChangesData = async (id: string, patchObj: any):Promise<any> => {
  const response = await patchJobChanges(id, patchObj);
  const jobData = await response.data;

  return getFlatJobDetailsData(jobData);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJobSlotsData = async (id:string): Promise<any> => {
  const apiCall = await jobFutureSlots(id);
  const slotData = await apiCall.data;
  return getSlotTypeData(slotData);
};

export const JobState = (state:string):string => {
  if (state === 'J_O') return 'OPEN';
  if (state === 'J_P') return 'PAUSE';
  return 'CLOSE';
};

export const createMarkup = (data): any => ({ __html: data });
