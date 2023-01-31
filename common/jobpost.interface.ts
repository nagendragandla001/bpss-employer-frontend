export interface INameID {
  id: number;
  name: string;
  type?: string;
}

export interface ILabelValue {
  value: string;
  label: string;
}
export interface IKeyValue {
  id: string;
  key: number;
  value: string;
}

export class POC {
  name: string;

  email: string;

  id: string;

  mobile: string;

  managerId: number;

  constructor(name = '', email = '', id = '', mobile = '', managerId = 0) {
    this.name = name;
    this.email = email;
    this.id = id;
    this.mobile = mobile;
    this.managerId = managerId;
  }
}

export interface IBasicDetails {
  id: string;
  title: string;
  functionalArea: INameID;
  ownCompany: boolean;
  hiringOrgName?: string;
  clientApprovalRequired: boolean;
  employmentType: string;
  vacancies: number;
  cityName: string;
  locality: ILabelValue;
  workDays: Array<IKeyValue>;
  comment:number;
  shiftType: string;
  shiftStartTime: string;
  shiftEndTime: string;
  minOfferedSalary: number;
  maxOfferedSalary: number;
  description: string;
  disableFA: boolean;
  disableFields: boolean;
  visibleFA:boolean
}

interface IAssessment {
  id: string;
  title: string;
  description: string;
}

export interface ICandidateRequirements {
  id: string;
  proficiencyLevel: number;
  experienceLevel: string;
  experienceRange: string;
  minExperience: number;
  maxExperience: number;
  minPreferredAge: number;
  maxPreferredAge: number;
  genderPreference: string;
  englishProficiency: number;
  isResumeSubscribed: boolean;
  documents: Array<INameID>;
  skills: Array<INameID>;
  assessmentId: Array<string>;
  assessment: Array<IAssessment>;
}
export interface IJobPost extends IBasicDetails, ICandidateRequirements {
  stage: string;
  state: string;
  slug: string;
  pricingPlanType: string;
  activeTag: boolean;
  banner: string;
  shareContact: boolean
  totalApplications: number;
  organizationPopularName: string;
  pointOfContacts: POC;
  completionScore: number;
  created: string;
  modified: string;
  expired: string;
  paused: string;
  jobStatus:any;
  featuredUntil:any;
  orgId: string;
}

export interface IDefaultJobInfo {
  hiringOrgName: string;
  clientApprovalRequired: boolean;
  employmentType: string;
  workDays: Array<IKeyValue>;
  shiftType: string;
  shiftStartTime: string;
  shiftEndTime: string;
  minOfferedSalary: number;
  maxOfferedSalary: number
  description: string;
  proficiencyLevel: number;
  experienceRange: string;
  experienceLevel: string;
  minExperience: number;
  maxExperience: number;
  minPreferredAge: number;
  maxPreferredAge: number;
  genderPreference: string;
  englishProficiency: number
  isResumeSubscribed: boolean;
}
