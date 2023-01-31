/* eslint-disable camelcase */
import { getCompSkillListAPI } from 'service/login-service';
import { gql } from '@apollo/client';
import { getOrgPricingStats } from 'service/organization-service';
import { getJobsStats } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from './clevertap';

const prepareJobDetailsPatchObj = (data): any => ({
  title: data?.title,
  functional_area_id: data?.functionalArea,
  city_name: data.cityName,
  hiring_org_name: data?.hiringOrgName || '',
  client_approval_required: !data?.clientApprovalRequired,
  share_contact_to_public: data?.callHR,
  locations: [{ place_id: data?.locality?.value, vacancies: data?.vacancies }],
  description: data?.description,
  is_location_wise_vacancies: true,
  employment_type: data?.employmentType || 'FT',
  vacancies: data?.vacancies,
  offer: {
    salary_format: 1,
    min_offered_salary: parseInt(data?.minOfferedSalary, 10) || 15000,
    max_offered_salary: parseInt(data?.maxOfferedSalary, 10) || 25000,
    salary_payout_duration: 1,
    other_salary_payout_duration: null,
  },
  working_days: {
    count: data.workDays || 5,
    comments: null,
  },
  shifts: [
    {
      work_start_time: data.shiftStartTime,
      work_end_time: data.shiftEndTime,
      type: data.shiftType,
      male_only: false,
    },
  ],
});

const prepareCandidateRequirementPatchObj = (data): any => ({
  expectation: {
    min_preferred_age: data?.minPreferredAge || 0,
    max_preferred_age: data?.maxPreferredAge || 0,
    gender_preference: data?.genderPreference || 'D',
    proficiency_level: data?.proficiencyLevel || 0,
    max_experience: data?.maximumExperience || 0,
    work_exp_requirements: {
      min_experience: data?.minimumExperience || 0,
    },
    skills: data?.skills || [],
    skill_list: data?.skills?.map((skill) => skill?.name),
    documents_map: data?.documents?.filter((d) => d.type === 'O_D')
      ?.map((d) => ({ document_id: d.id, is_mandatory: true })),
    vehicle_ownership_ids: data?.documents?.filter((d) => d.type === 'O_V')
      ?.map((d) => d.id),
    laptop_required: data?.documents?.some((d) => d.name === 'Laptop'),
    mobile_ownership_id: data?.documents?.find((d) => d.name === 'Android Phone')?.id || '',
  },
  assessment: data?.assessmentIds,
  is_resume_subscribed: data?.isResumeSubscribed || false,
  language_preference_list: data?.englishProficiency !== 0 ? [
    {
      preference: 2,
      language_id: 1,
      proficiency: data?.englishProficiency,
      modes: [
        1,
      ],
    },
  ] : [],
});

const prepareDuplicateCandidateRequirementPatchObj = (data): any => ({
  expectation: {
    min_preferred_age: data?.minPreferredAge || 0,
    max_preferred_age: data?.maxPreferredAge || 0,
    gender_preference: data?.genderPreference || '',
    proficiency_level: data?.proficiencyLevel,
    max_experience: data?.maxExperience || 0,
    work_exp_requirements: {
      min_experience: data?.minExperience || 0,
    },
    skills: data?.skills || [],
    skill_list: data?.skills?.map((skill) => skill?.name),
    documents_map: data?.documents?.filter((d) => d.type === 'O_D')
      ?.map((d) => ({ document_id: d.id, is_mandatory: true })),
    vehicle_ownership_ids: data?.documents?.filter((d) => d.type === 'O_V')
      ?.map((d) => d.id),
    laptop_required: data?.documents?.some((d) => d.name === 'Laptop'),
    mobile_ownership_id: data?.documents?.find((d) => d.name === 'Android Phone')?.id || '',
  },
  is_resume_subscribed: data?.isResumeSubscribed,
  language_preference_list: data?.englishProficiency !== 0 ? [
    {
      preference: 2,
      language_id: 1,
      proficiency: data.englishProficiency,
      modes: [
        1,
      ],
    },
  ] : [],
});

const prepareDefaultJobDataRequest = (formData, defaultData): any => {
  const basicDetailsObj = prepareJobDetailsPatchObj(formData);
  const candiadteReqObj = prepareCandidateRequirementPatchObj(defaultData);

  return { ...basicDetailsObj, ...candiadteReqObj };
};

const prepareDuplicateJobDataRequest = (formData, candidateData): any => {
  const basicDetailsObj = prepareJobDetailsPatchObj(formData);
  const candidateReqObj = prepareDuplicateCandidateRequirementPatchObj(candidateData);

  return { ...basicDetailsObj, ...candidateReqObj };
};

const prepareJobRolePatchChanges = (data): any => ({
  title: data.title,
  functional_area_id: data.functionalArea,
  description: data.description,
  hiring_org_name: data.hiringOrgName || '',
});

const prepareCallHRPatchChanges = (data): any => ({
  share_contact_to_public: data,
});

const preapreBasicDetailsPatchChanges = (data): any => ({
  employment_type: data.employmentType,
  description: data.description,
  client_approval_required: !data?.clientApprovalRequired,
});

const preapreLocationPatchChanges = (data): any => ({
  city_name: data.cityName,
  locations: [{ place_id: data?.locality?.value, vacancies: data.vacancies }],
  description: data.description,
  is_location_wise_vacancies: true,
  vacancies: data.vacancies,
});

const preparePOCPatchChanges = (data): any => (
  {
    point_of_contact_ids: [data],
    share_contact_to_public: true,
  });

const preapreSalaryPatchChanges = (data): any => ({
  offer: {
    salary_format: 1,
    min_offered_salary: parseInt(data?.minOfferedSalary, 10) || 15000,
    max_offered_salary: parseInt(data?.maxOfferedSalary, 10) || 25000,
    salary_payout_duration: 1,
    other_salary_payout_duration: null,
  },
  working_days: {
    count: data?.workDays || 5,
    comments: null,
  },
  shifts: [
    {
      work_start_time: data.shiftStartTime,
      work_end_time: data.shiftEndTime,
      type: data.shiftType,
      male_only: false,
    },
  ],
});

/* eslint-disable camelcase */
const patchobj = (data, desc, locarr): any => {
  const obj = {
    title: data.title || null,
    functional_area_id: data.functionalArea || null,
    city_name: data.cityName || null,
    hiring_org_name: data.companyName || '',
    locations: locarr || [],
    description: desc,
    is_location_wise_vacancies: true,
    employment_type: data.employmentType || 'FT',
    offer: {
      salary_format: 1,
      min_offered_salary: parseInt(data.minOfferedSalary, 10) || null,
      max_offered_salary: parseInt(data.maxOfferedSalary, 10) || null,
      salary_payout_duration: 1,
      other_salary_payout_duration: null,
    },
    vacancies: data.vacancies,
  };
  return obj;
};

const patchobj12 = (data, shift_arr): any => {
  const obj = {
    working_days: {
      count: data.count || null,
      comments: data.comments || null,
    },
    shifts: shift_arr || [],
    description: data.description || '',
  };
  return obj;
};

const isValidMobile = (str: string): boolean => str.match(/^[6-9][0-9]{9}$/) !== null;

const patchobj21 = (data, degree): any => {
  const obj = {
    expectation: {
      max_preferred_age: parseInt(data.maxAge, 10) || 0,
      min_preferred_age: parseInt(data.minAge, 10) || 0,
      gender_preference: data.genderType || '',
      proficiency_level: data.education || 0,
      is_age_pref_mandatory: data.ageMandatory || false,
      is_proficiency_level_mandatory: data.proficiencyMandatory || false,
      is_gender_pref_mandatory: data.genderMandatory || false,

      work_exp_requirements: {
        min_experience: data.minExp || 0,
        functional_area_ids: data.functionalAreaId || [],
        industry_ids: data.industryType || [],
        is_industries_mandatory: data.industryTypeMandatory || false,
        is_experience_mandatory: data.experienceRangeMandatory || false,
      },

      max_experience: data.maxExp || 0,
      degree_requirements: degree || [],
    },
  };
  return obj;
};
// eslint-disable-next-line max-len
const patchobj22 = (data, documents, skills, preferredSkill, languagepref, req, resumeDetails, carDetails): any => {
  const obj = {
    expectation: {
      misc_requirements: req || [],
      skill_list: data.skillList || [],
      preferred_skill_list: data.preferredSkillList || [],
      documents_map: documents || [],
      laptop_required: (!!data.Laptop) || '',
      vehicle_ownership_ids: data.vehiclechecks || [],
      mobile_ownership_id: (data.Phone ? 2 : '') || '',
      is_mobile_ownership_mandatory: data.phoneMandatory || false,
      is_vehicle_ownership_mandatory: data.vehicleMandatory || false,
      is_laptop_requirement_mandatory: (data.Laptop.length > 0) || false,
      preferred_skills: preferredSkill || [],
      skills: skills || [],
      proficiency_level: data.proficiencyLevel || 0,
    },

    language_preference_list: languagepref || [],
    is_resume_subscribed: resumeDetails,
    // client_approval_required: carDetails,
  };
  return obj;
};

// const locationDiff = (formLocation, storeLocation) => {
//   const storeLocationIdArr = storeLocation.map((location) => location.description);
//   const formLocationIdArr = formLocation.map((location) => location.description);
//   const diff = formLocationIdArr.filter((value) => storeLocationIdArr.includes(value));
//   return diff.length > 0;
// };

const locationDiff = (ogCityName, ogLocality, duplicateCityName, duplicateLocality) => {
  if (ogCityName?.toUpperCase() === duplicateCityName?.toUpperCase()) {
    if (ogLocality?.value === duplicateLocality?.value) {
      return false;
    }
  }
  return true;
};

const getSkipPatchObj = async (store, mainStep, subStep) => {
  const patchFor11 = {
    title: store.aboutJob.basicInfo.title || null,
    functional_area_id: store.aboutJob.basicInfo.jobCategory || null,
    city_name: store.aboutJob.basicInfo.cityName || null,
    hiring_org_name: store.aboutJob.basicInfo.hiringOrgName || '',
    locations: store.aboutJob.basicInfo.locations.map((location) => ({
      place_id: location.place_id,
      vacancies: location.vacancies,
    })) || [],
    description: store.aboutJob.salaryAndWorkTiming.jobDescription,
    is_location_wise_vacancies: true,
    employment_type: store.aboutJob.basicInfo.employmentType || 'FT',
    offer: {
      salary_format: 1,
      min_offered_salary: parseInt(store.aboutJob.basicInfo.minOfferedSalary, 10) || null,
      max_offered_salary: parseInt(store.aboutJob.basicInfo.maxOfferedSalary, 10) || null,
      salary_payout_duration: 1,
      other_salary_payout_duration: null,
    },
    vacancies: store.aboutJob.basicInfo.vacancies,
  };

  const patchFor12 = {
    working_days: {
      count: store.aboutJob.salaryAndWorkTiming.count || null,
      comments: store.aboutJob.salaryAndWorkTiming.comments || null,
    },
    shifts: store.aboutJob.salaryAndWorkTiming.shifts.map((shift) => ({
      work_start_time: shift.workStartTime,
      work_end_time: shift.workEndTime,
      type: shift.type,
      male_only: shift.maleOnly,
    })) || [],
    description: store.aboutJob.salaryAndWorkTiming.jobDescription || '',
  };

  const patchFor21 = {
    expectation: {
      max_preferred_age: parseInt(store.candidateRequirement.candidateInfo.maxAge, 10) || 0,
      min_preferred_age: parseInt(store.candidateRequirement.candidateInfo.minAge, 10) || 0,
      gender_preference: store.candidateRequirement.candidateInfo.gender || '',
      proficiency_level: store.candidateRequirement.candidateInfo.educationId || 0,
      is_age_pref_mandatory: store.candidateRequirement.candidateInfo.ageMandatory || false,
      is_proficiency_level_mandatory:
      store.candidateRequirement.candidateInfo.proficiencyMandatory || false,
      is_gender_pref_mandatory: store.candidateRequirement.candidateInfo.genderMandatory || false,

      work_exp_requirements: {
        min_experience: store.candidateRequirement.candidateInfo.minExperience || 0,
        functional_area_ids:
        store.candidateRequirement.candidateInfo.candidateFunctionalareaid || [],
        industry_ids: store.candidateRequirement.candidateInfo.industryId || [],
        is_industries_mandatory:
        store.candidateRequirement.candidateInfo.industryMandatory || false,
        is_experience_mandatory:
        store.candidateRequirement.candidateInfo.experienceMandatory || false,
      },
      max_experience: store.candidateRequirement.candidateInfo.maxExperience || 0,
      degree_requirements: store.candidateRequirement.candidateInfo.degrees || [],
    },
  };

  const documentArray:Array<any> = [];
  documentArray.push(...store.candidateRequirement.addReqInfo.govid.map((id) => ({
    document_id: id,
    is_mandatory: true,
  })));
  documentArray.push(...store.candidateRequirement.addReqInfo.licid.map((id) => ({
    document_id: id,
    is_mandatory: true,
  })));
  documentArray.push(...store.candidateRequirement.addReqInfo.otherid.map((id) => ({
    document_id: id,
    is_mandatory: true,
  })));
  const skillRes = await getCompSkillListAPI();
  const skillsDict = skillRes?.objects;
  const getSkillId = (skillName) => {
    let result = 0;
    skillsDict.forEach((skill) => {
      if (skill.name === skillName) {
        result = skill.id;
      }
    });
    return result;
  };
  const mandatorySkillsArray = store.candidateRequirement.addReqInfo.mandatorySkill.map(
    (skill) => ({
      name: skill,
      id: getSkillId(skill),
    }),
  );
  const otherSkillsArray = store.candidateRequirement.addReqInfo.skills.map(
    (skill) => ({
      name: skill,
      id: getSkillId(skill),
    }),
  );

  const patchFor22 = {
    expectation: {
      max_preferred_age: parseInt(store.candidateRequirement.candidateInfo.maxAge, 10) || 0,
      min_preferred_age: parseInt(store.candidateRequirement.candidateInfo.minAge, 10) || 0,
      gender_preference: store.candidateRequirement.candidateInfo.gender || '',
      proficiency_level: store.candidateRequirement.candidateInfo.educationId || 0,
      is_age_pref_mandatory: store.candidateRequirement.candidateInfo.ageMandatory || false,
      is_proficiency_level_mandatory:
      store.candidateRequirement.candidateInfo.proficiencyMandatory || false,
      is_gender_pref_mandatory: store.candidateRequirement.candidateInfo.genderMandatory || false,

      work_exp_requirements: {
        min_experience: store.candidateRequirement.candidateInfo.minExperience || 0,
        functional_area_ids:
        store.candidateRequirement.candidateInfo.candidateFunctionalareaid || [],
        industry_ids: store.candidateRequirement.candidateInfo.industryId || [],
        is_industries_mandatory:
        store.candidateRequirement.candidateInfo.industryMandatory || false,
        is_experience_mandatory:
        store.candidateRequirement.candidateInfo.experienceMandatory || false,
      },
      max_experience: store.candidateRequirement.candidateInfo.maxExperience || 0,
      degree_requirements: store.candidateRequirement.candidateInfo.degrees || [],

      misc_requirements: store.candidateRequirement.addReqInfo.otherreq || [],
      skill_list: store.candidateRequirement.addReqInfo.mandatorySkill || [],
      preferred_skill_list: store.candidateRequirement.addReqInfo.skills || [],
      documents_map: documentArray,
      laptop_required: (store.candidateRequirement.addReqInfo.laptop) || '',
      vehicle_ownership_ids: store.candidateRequirement.addReqInfo.vehicleId || [],
      mobile_ownership_id: (store.candidateRequirement.addReqInfo.phone ? 2 : '') || '',
      is_mobile_ownership_mandatory: store.candidateRequirement.addReqInfo.phoneMandatory || false,
      is_vehicle_ownership_mandatory:
      store.candidateRequirement.addReqInfo.vehicleMandatory || false,
      is_laptop_requirement_mandatory: (store.candidateRequirement.addReqInfo.laptop) || false,
      preferred_skills: otherSkillsArray || [],
      skills: mandatorySkillsArray || [],
    },

    language_preference_list: store.candidateRequirement.addReqInfo.languages.map((language) => ({
      preference: 2,
      language_id: language.language,
      proficiency: language.proficiency,
      modes: language.mode,
    })) || [],
    is_resume_subscribed: store.applicationProcess.isResumeSubscribed,
  };

  const patchFor31 = {
    call_poc: store.applicationProcess.callPoc,
    id: store.id,
    share_contact_to_public: store.applicationProcess.shareContactToPublic,
  };

  let finalObj = {};
  if (mainStep === 1 && subStep === 1) {
    finalObj = {
      ...patchFor11,
      ...patchFor12,
      ...patchFor21,
      ...patchFor22,
      ...patchFor31,
    };
  } else if (mainStep === 1 && subStep === 2) {
    finalObj = {
      ...patchFor21,
      ...patchFor22,
      ...patchFor31,
    };
  } else if (mainStep === 2 && subStep === 1) {
    finalObj = {
      ...patchFor22,
      ...patchFor31,
    };
  } else if (mainStep === 2 && subStep === 2) {
    finalObj = {
      ...patchFor31,
    };
  }
  return finalObj;
};

export const getLatestPricingPlan = (pricingPlanList): string => {
  if (pricingPlanList === null) {
    return 'NA';
  }
  if (pricingPlanList.length === 1) {
    return pricingPlanList?.[0]?.display_name;
  }
  let latestPlan = '';
  let latestPlanDate = '';
  pricingPlanList.forEach((pricingObj) => {
    if (pricingObj?.is_active && pricingObj?.start_date !== null) {
      if (pricingObj?.start_date >= latestPlanDate) {
        latestPlan = pricingObj?.display_name;
        latestPlanDate = pricingObj?.start_date;
      }
    }
  });
  if (latestPlan !== '') {
    return latestPlan;
  }
  return 'NA';
};

const orgClevertapEventHandler = async (orgData, userData): Promise<void> => {
  const pricingPlanApi = await getOrgPricingStats(orgData?.id);
  const jobStats = await getJobsStats(orgData?.id);
  const pricingPlan = getLatestPricingPlan(
    pricingPlanApi?.data?.pricing_stats?.plan_wise_pricing_stats,
  );
  pushClevertapEvent('Page Load', {
    Type: 'User Profile',
    orgId: orgData?.id,
    orgStatus: orgData?.status,
    emailVerified: userData?.email_verified,
    pricingPlan,
    openJobs: jobStats?.open,
    unapprovedJobs: jobStats?.unapproved,
    pausedJobs: jobStats?.paused,
    closedJobs: jobStats?.closed,
    draftJobs: jobStats?.drafts,
  });
};

const defaultApiGraphqlQuery = gql`
query jobFADefaults($functional_area_id: Int) {
  jobFADefaults(functional_area_id: $functional_area_id) {
    id
    title
    description
    employment_type
    contract_type
    proficiency_level
    client_approval_required
    is_resume_subscribed
    min_preferred_age
    max_preferred_age
    working_days_info {
      days
      offs
    }
    salary_type
    salary_details {
      max_salary
      min_salary
    }
    shift {
      work_start_time
      work_end_time
      type
      post_break_start_time
      post_break_end_time
      male_only
    }
    experience {
      min_experience
      max_experience
    }
    gender_preference
    language_proficiency
    functional_area
  }
}
`;

export {
  patchobj,
  patchobj12,
  patchobj21,
  patchobj22,
  isValidMobile,
  getSkipPatchObj,
  locationDiff,
  prepareJobDetailsPatchObj,
  prepareCandidateRequirementPatchObj,
  preapreBasicDetailsPatchChanges,
  preapreLocationPatchChanges,
  preapreSalaryPatchChanges,
  prepareJobRolePatchChanges,
  defaultApiGraphqlQuery,
  prepareDefaultJobDataRequest,
  prepareDuplicateJobDataRequest,
  preparePOCPatchChanges,
  prepareCallHRPatchChanges,
  orgClevertapEventHandler,
};
