/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable camelcase */

/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-nested-ternary */

import { JobPostStore, JobPost } from 'stores';
import has from 'lodash/has';
import isArray from 'lodash/isArray';
import { nFormatter } from 'service/login-service';

import {
  documentMapToName, mobileToName, eduMapToName,
} from 'constants/enum-constants';

const getshiftarr = (data): Array<Record<string, string|boolean>> => {
  if (data.length > 0) {
    return data.map((s) => ({
      workStartTime: s.work_start_time,
      workEndTime: s.work_end_time,
      type: s.type,
      maleOnly: s.male_only,
    }));
  }
  return [];
};

const getlangarr = (data): Array<Record<string, string|number[]>> => {
  if (data.length > 0) {
    return data.map((d) => ({
      language: d.language.id,
      proficiency: d.proficiency,
      mode: d.modes,
    }));
  }
  return [];
};

export const getdegreearr = (data): Array<{
  degree: string; degreeMandatory: boolean;
  enableDegree: boolean; specialization: string[];
  degreeId: number; specializationId: number[];
  specializationMandatory: boolean;
  enableSpecialization: boolean;}> => {
  const degreearr = [] as Array<{
    degree: string; degreeMandatory: boolean;
    enableDegree: boolean; specialization: string[];
    degreeId: number; specializationId: number[];
    specializationMandatory: boolean;
    enableSpecialization: boolean;}>;

  if (data && data.length > 0) {
    for (let i = 0; i < data.length; i += 1) {
      const specializationarr = [] as Array<string>;
      const specializationarrId = [] as Array<number>;

      const temp = data[i];

      if (data[i]) {
        for (let j = 0; j < temp.specializations.length; j += 1) {
          specializationarr.push(temp.specializations[j].name);
          specializationarrId.push(temp.specializations[j].id);
        }
      }
      degreearr.push({
        degree: temp.degree.name,
        degreeMandatory: temp.is_degree_mandatory,
        enableDegree: !!temp.degree.id,
        specialization: specializationarr,
        degreeId: temp.degree.id,
        specializationId: specializationarrId,
        specializationMandatory: temp.is_specializations_mandatory,
        enableSpecialization: specializationarrId.length > 0,
      });
    }
    return [...degreearr];
  }
  return [];
};

const getpreferskill = (data): Array<string> => {
  const preferSkill = [] as Array<string>;
  if (data.length > 0) {
    data.map((s) => (
      preferSkill.push(s.name)
    ));
    return [...preferSkill];
  }
  return [];
};
export const getcandidateFunctionalarea = (data): string[] => {
  const initCandidateFunctionalarea = [] as string[];
  for (let i = 0; i < data.length; i += 1) {
    initCandidateFunctionalarea.push(data[i].name);
  }
  return initCandidateFunctionalarea;
};
const getcandidateFunctionalareaid = (data): number[] => {
  const initCandidateFunctionalareaid = [] as number[];
  for (let i = 0; i < data.length; i += 1) {
    initCandidateFunctionalareaid.push(data[i].id);
  }
  return initCandidateFunctionalareaid;
};
const getskill = (data): Array<string> => {
  const skill = [] as Array<string>;
  if (data.length > 0) {
    data.map((s) => skill.push(s.name));
    return [...skill];
  }
  return [];
};

const getinitialvehicle = (data): Array<string> => {
  const initialvehicle = [] as Array<string>;
  if (data.length > 0) {
    data.map((v) => initialvehicle.push(v.name));
    return [...initialvehicle];
  }
  return [];
};
export const getinitialvehicleid = (data): Array<number> => {
  const initialvehicleid = [] as Array<number>;
  if (data.length > 0) {
    data.map((v) => initialvehicleid.push(v.id));
    return [...initialvehicleid];
  }
  return [];
};
const getinitlic = (data): Array<string> => {
  if (data.length > 0) {
    const initlic = [] as Array<string>;
    data.filter((doc) => {
      if ([1, 2, 3].includes(doc.id)) {
        initlic.push(documentMapToName(doc.id));
      }
      return [...initlic];
    });
    return [...initlic];
  }
  return [];
};
export const getinitlicid = (data): Array<number> => {
  if (data.length > 0) {
    const initlicid = [] as Array<number>;
    data.filter((doc) => {
      if ([1, 2, 3].includes(doc.id)) {
        initlicid.push(doc.id);
      }
      return [...initlicid];
    });
    return [...initlicid];
  }
  return [];
};
const getinitgov = (data): Array<string> => {
  if (data.length > 0) {
    const initgov = [] as Array<string>;
    data.filter((doc) => {
      if ([4, 5, 6, 7].includes(doc.id)) {
        initgov.push(documentMapToName(doc.id));
      }
      return [...initgov];
    });
    return [...initgov];
  }
  return [];
};
export const getinitgovid = (data): Array<number> => {
  if (data.length > 0) {
    const initgovid = [] as Array<number>;
    data.filter((doc) => {
      if ([4, 5, 6, 7].includes(doc.id)) {
        initgovid.push(doc.id);
      }
      return [...initgovid];
    });
    return [...initgovid];
  }
  return [];
};
const getinitother = (data): Array<string> => {
  if (data.length > 0) {
    const initother = [] as Array<string>;
    data.filter((doc) => {
      if ([8, 9, 10, 11, 12, 13].includes(doc.id)) {
        initother.push(documentMapToName(doc.id));
      }
      return [...initother];
    });
    return [...initother];
  }
  return [];
};
export const getinitotherid = (data): Array<number> => {
  if (data.length > 0) {
    const initotherid = [] as Array<number>;
    data.filter((doc) => {
      if ([8, 9, 10, 11, 12, 13].includes(doc.id)) {
        initotherid.push(doc.id);
      }
      return [...initotherid];
    });
    return [...initotherid];
  }
  return [];
};

const getCallPoc = (callPoc): { name: string;contact: string} => {
  if (callPoc) {
    return ({
      name: callPoc.name || '',
      contact: callPoc.contact || '',
    });
  }
  return {
    name: '',
    contact: '',
  };
};
const getlocarr = (data): Array<{place_id: string; description: string; vacancies: number}> => {
  if (data.length) {
    return data.map((d) => ({
      place_id: d.place.place_id,
      description: `${(d.place.city === d.place.state)
        ? (`${d.place.locality}, ${d.place.city}`)
        : (`${d.place.locality}, ${d.place.city}, ${d.place.state}`)}, India`,
      vacancies: d.vacancies || 0,
    }));
  }
  return [];
};

export const getreq = (data): Array<string> => {
  if (data && data.length) {
    const req = [] as Array<string>;
    for (let i = 0; i < data.length; i += 1) {
      req.push(data[i].text);
    }
    return [...req];
  } return [];
};
const getindustriesid = (data): Array<number> => {
  if (data.length > 0) {
    const industries = [] as Array<number>;
    for (let i = 0; i < data.length; i += 1) {
      industries.push(data[i].id);
    }
    return [...industries];
  }
  return [];
};
const getinitialfunctionalareaid = (data): string[] => {
  const initialfunctionalareaid = [] as string[];
  initialfunctionalareaid.push(data);

  return [...initialfunctionalareaid];
};
const getinitialfunctionalareaname = (data): number[] => {
  const initialfunctionalareaname = [] as number[];
  initialfunctionalareaname.push(data);

  return [...initialfunctionalareaname];
};
export const getinitExp = (data): any => {
  if (data) {
    if (data <= 6) return '6 months';
    return `${Math.ceil(data / 12)} years`;
  }
  return 'any';
};
const convertToMonthlySalary = (JobData, field, defaultValue): number => {
  if (JobData && JobData._source && JobData._source.offer) {
    if (JobData._source.offer.salary_format === 0) {
      return Math.ceil((JobData._source.offer[field] || 0) / 12);
    }
    return JobData._source.offer[field] || 0;
  }
  return defaultValue || 0;
};

export const setupJobPostStore = (JobData?): {jobPost: JobPost} => {
  const jobPost = JobPostStore.create({
    aboutJob: {
      basicInfo: {
        title: has(JobData, '_source.title') ? JobData._source.title : '',
        jobCategory: has(JobData, '_source.functional_area.id') ? JobData._source.functional_area.id : undefined,
        // jobCategory_id: (JobData && JobData._source && JobData._source.functional_area.id) || 0,
        cityName: JobData?._source?.city_name,
        hiringOrgName: (JobData && JobData._source && JobData._source.hiring_org_name) || '',
        locations: (JobData && JobData._source && JobData._source.locations.length > 0)
          ? getlocarr(JobData._source.locations)
          : [{ place_id: undefined, description: undefined, vacancies: 1 }],
        vacancies: 0,
        salaryFormat: 1,
        actualSalaryFormat: has(JobData, '_source.offer.salary_format') ? JobData._source.offer.salary_format : 1,
        employmentType: (JobData && JobData._source && JobData._source.employment_type) ? JobData._source.employment_type : 'FT',
        minOfferedSalary: convertToMonthlySalary(JobData, 'min_offered_salary', 15000),
        maxOfferedSalary: convertToMonthlySalary(JobData, 'max_offered_salary', 25000),
        minSalary: (JobData && JobData._source && JobData._source.offer.min_offered_salary) ? nFormatter(JobData._source.offer.min_offered_salary, 1) : '',
        maxSalary: (JobData && JobData._source && JobData._source.offer.min_offered_salary) ? nFormatter(JobData._source.offer.max_offered_salary, 1) : '',
      },
      salaryAndWorkTiming: {
        count: (JobData && JobData._source && JobData._source.working_days
        && JobData._source.working_days.count) || 5,
        comments: (JobData && JobData._source && JobData._source.working_days && JobData._source.working_days.comments) || '',
        shifts: (JobData && JobData._source && JobData._source.shifts.length > 0)
          ? getshiftarr(JobData._source.shifts) : [{
            workStartTime: '09:00:00',
            workEndTime: '18:00:00',
            type: 'DAY',
            maleOnly: false,
          }],
        jobDescription: (JobData && JobData._source && JobData._source.description) || '',
      },
    },
    candidateRequirement: {
      candidateInfo: {
        educationId: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.proficiency_level)
          ? (JobData._source.expectation.proficiency_level <= 4
            ? JobData._source.expectation.proficiency_level : 0) : 0,
        education: (JobData && JobData._source && JobData._source.expectation && JobData._source.expectation.proficiency_level) ? eduMapToName(JobData._source.expectation.proficiency_level) : 'Any',
        proficiencyMandatory: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.is_proficiency_level_mandatory)
          ? JobData._source.expectation.is_proficiency_level_mandatory : false,
        degrees: (has(JobData, '_source.expectation.degree_requirements') && isArray(JobData._source.expectation.degree_requirements)) ? getdegreearr(JobData._source.expectation.degree_requirements) : [],
        minExperience: has(JobData, '_source.expectation.work_exp_requirements.min_experience')
          ? JobData._source.expectation.work_exp_requirements.min_experience : 0,
        maxExperience: has(JobData, '_source.expectation.max_experience')
          ? JobData._source.expectation.max_experience : 0,
        minExpyears: has(JobData, '_source.expectation.work_exp_requirements.min_experience')
          ? getinitExp(JobData._source.expectation.work_exp_requirements.min_experience) : 'any',
        maxExpyears: has(JobData, '_source.expectation.work_exp_requirements.min_experience') ? getinitExp(JobData._source.expectation.max_experience) : 'any',
        experienceMandatory: (JobData && JobData._source
        && JobData._source.expectation && JobData._source.expectation.work_exp_requirements
        && JobData._source.expectation.work_exp_requirements.is_experience_mandatory)
          ? JobData._source.expectation.work_exp_requirements.is_experience_mandatory : false,
        candidateFunctionalarea: (JobData && JobData._source
        && JobData._source.expectation && JobData._source.expectation.work_exp_requirements
        && JobData._source.expectation.work_exp_requirements.functional_areas
        && JobData._source.expectation.work_exp_requirements.functional_areas.length > 0)
          ? getcandidateFunctionalarea(
            JobData._source.expectation.work_exp_requirements.functional_areas,
          )
          : (JobData && JobData._source)
            ? getinitialfunctionalareaid(JobData._source.functional_area.name) : [],
        candidateFunctionalareaid: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.work_exp_requirements
        && JobData._source.expectation.work_exp_requirements.functional_areas
        && JobData._source.expectation.work_exp_requirements.functional_areas.length > 0)
          ? getcandidateFunctionalareaid(JobData._source.expectation.work_exp_requirements
            .functional_areas)
          : (JobData && JobData._source)
            ? getinitialfunctionalareaname(JobData._source.functional_area.id) : [],
        industrytype: [],
        industryId: (JobData && JobData._source
        && JobData._source.expectation && JobData._source.expectation
        && JobData._source.expectation.work_exp_requirements
        && JobData._source.expectation.work_exp_requirements.industries.length > 0)
          ? getindustriesid(JobData._source.expectation.work_exp_requirements.industries) : [],
        gender: (JobData && JobData._source && JobData._source.expectation && JobData._source.expectation.gender_preference) ? JobData._source.expectation.gender_preference : 'D',
        genderMandatory: (JobData && JobData._source
        && JobData._source.expectation && JobData._source.expectation.is_gender_pref_mandatory)
          ? JobData._source.expectation.is_gender_pref_mandatory : false,
        industryMandatory: (JobData && JobData._source
        && JobData._source.expectation && JobData._source.expectation.work_exp_requirements
        && JobData._source.expectation.work_exp_requirements.is_industries_mandatory)
          ? JobData._source.expectation.work_exp_requirements.is_industries_mandatory : false,
        minAge: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.min_preferred_age)
          ? JobData._source.expectation.min_preferred_age : 18,
        maxAge: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.max_preferred_age)
          ? JobData._source.expectation.max_preferred_age : 30,
        ageMandatory: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.is_age_pref_mandatory)
          ? JobData._source.expectation.is_age_pref_mandatory : false,

      },
      addReqInfo: {
        languages: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.language_preferences.length > 0)
          ? getlangarr(JobData._source.language_preferences) : [],
        mandatorySkill: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.skills.length > 0)
          ? getskill(JobData._source.expectation.skills) : [],
        skills: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.preferred_skills.length > 0)
          ? getpreferskill(JobData._source.expectation.preferred_skills) : [],
        vehicle: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.vehicle_ownership
        && JobData._source.expectation.vehicle_ownership.length > 0)
          ? getinitialvehicle(JobData._source.expectation.vehicle_ownership) : [],
        vehicleId: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.vehicle_ownership
        && JobData._source.expectation.vehicle_ownership.length > 0)
          ? getinitialvehicleid(JobData._source.expectation.vehicle_ownership) : [],
        licdoc: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.document_ownership
        && JobData._source.expectation.document_ownership.length > 0)
          ? getinitlic(JobData._source.expectation.document_ownership) : [],
        govdoc: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.document_ownership
        && JobData._source.expectation.document_ownership.length > 0)
          ? getinitgov(JobData._source.expectation.document_ownership) : [],
        otherdoc: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.document_ownership
        && JobData._source.expectation.document_ownership.length > 0)
          ? getinitother(JobData._source.expectation.document_ownership) : [],
        licid: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.document_ownership
        && JobData._source.expectation.document_ownership.length > 0)
          ? getinitlicid(JobData._source.expectation.document_ownership) : [],
        govid: (JobData && JobData._source
        && JobData._source.expectation
        && JobData._source.expectation.document_ownership
        && JobData._source.expectation.document_ownership.length > 0)
          ? getinitgovid(JobData._source.expectation.document_ownership) : [],
        otherid: (JobData && JobData._source
        && JobData._source.expectation
        && JobData._source.expectation.document_ownership
        && JobData._source.expectation.document_ownership.length > 0)
          ? getinitotherid(JobData._source.expectation.document_ownership) : [],
        phone: (JobData && JobData._source && JobData._source.expectation && JobData._source.expectation.mobile_ownership) ? mobileToName(JobData._source.expectation.mobile_ownership.id) : '',
        phoneId: (JobData && JobData._source
        && JobData._source.expectation
        && JobData._source.expectation.mobile_ownership)
          ? JobData._source.expectation.mobile_ownership.id : 0,
        laptop: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.laptop_required)
          ? JobData._source.expectation.laptop_required : false,

        vehicleMandatory: (JobData && JobData._source
        && JobData._source.expectation
        && JobData._source.expectation.is_vehicle_ownership_mandatory)
          ? JobData._source.expectation.is_vehicle_ownership_mandatory : false,
        phoneMandatory: (JobData && JobData._source
        && JobData._source.expectation
        && JobData._source.expectation.is_mobile_ownership_mandatory)
          ? JobData._source.expectation.is_mobile_ownership_mandatory : false,
        otherreq: (JobData && JobData._source && JobData._source.expectation
        && JobData._source.expectation.misc_requirements)
          ? getreq(JobData._source.expectation.misc_requirements) : [],
      },
    },
    applicationProcess: {
      callPoc: (JobData && JobData._source) ? getCallPoc(JobData._source.call_poc) : { name: '', contact: '' },
      shareContactToPublic: (JobData && JobData._source
        && JobData._source.share_contact_to_public) || false,
      clientApprovalRequired: (JobData && JobData._source
        && JobData._source.client_approval_required) || false,
      isResumeSubscribed: (JobData && JobData._source
        && JobData._source.is_resume_subscribed) || false,
      isCallPocNull: (JobData && JobData._source && !JobData._source.call_poc) || false,
      callHrEnabled: true,
      callHrOpted: false,
      interviewType: '',
      formSubmitted: false,
    },
    id: (JobData && JobData._id) || '',
    duplicateId: '',
    pricingPlanType: (JobData && JobData._source && JobData._source.pricing_plan_type) || 'FR',
    saveAsDraft: false,
    jobState: (JobData && JobData._source && JobData._source.state) || 'J_D',
    jobStage: (JobData && JobData._source && JobData._source.stage) || 'J_UA',
    redirectToPrevious: false,
    nextInProgress: false,
    skipInProgress: false,
    saveAndClose: false,
    skipToLastInProgress: false,
  });
  return { jobPost };
};
