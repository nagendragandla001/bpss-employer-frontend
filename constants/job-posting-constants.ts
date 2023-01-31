import { CompanyPattern, JobTitlePattern } from 'utils/constants';

const JobPostingConfig = {
  title: {
    label: 'Job Role',
    name: 'title',
    rules: [
      {
        required: true,
        message: 'Please input Job role!',
      },
      {
        min: 5,
        message: 'Job role cannot be less than 5 characters',
      },
      {
        max: 45,
        message: 'Job role cannot be more than 45 characters',
      },
      {
        pattern: JobTitlePattern,
        message: 'Special characters are not allowed.',
      },
      {
        whitespace: true,
        message: 'The job role cannot be empty!',
      },
    ],
  },
  functionalArea: {
    label: 'Job Category',
    name: 'functionalArea',
    rules: [
      {
        required: true,
        message: 'Search from dropdown',
      },
    ],
  },
  ownCompany: {
    label: 'Are you posting this job on behalf of some other company?',
    name: 'ownCompany',
  },
  hiringOrgName: {
    label: 'Company you are hiring for',
    name: 'hiringOrgName',
    rules: [
      {
        required: true,
        message: 'Please input company name!',
      },
      {
        whitespace: true,
        message: 'Company name cannot be empty!',
      },
      {
        max: 50,
        message: 'Company name cannot be more than 50 characters',
      },
      {
        pattern: CompanyPattern,
        message: 'Invalid company name',
      },
    ],
  },
  clientApprovalRequired: {
    label: 'Allow Direct Interviews',
    name: 'clientApprovalRequired',
  },
  callHR: {
    label: 'Allow candidates to Call HR',
    name: 'callHR',
  },
  employmentType: {
    label: 'Job Type',
    name: 'employmentType',
  },
  vacancies: {
    label: 'Openings',
    name: 'vacancies',
    rules: [
      {
        required: true,
        message: 'Please input number of openings',
      },
    ],
  },
  cityName: {
    label: 'Add City',
    name: 'cityName',
    rules: [
      {
        required: true,
        message: 'Please input location',
      },
    ],
  },
  locality: {
    label: 'Add Locality',
    name: 'locality',
    rules: [
      {
        required: true,
        message: 'Please input location',
      },
    ],
  },
  workingDays: {
    label: 'Work Days',
    name: 'workDays',
  },
  shiftType: {
    label: 'Shift Timings',
    name: 'shiftType',
  },
  shiftStartTime: {
    label: 'From',
    name: 'shiftStartTime',
  },
  shiftEndTime: {
    label: 'To',
    name: 'shiftEndTime',
  },
  salaryFormat: {
    label: '',
    name: '',
    rules: [],
  },
  minOfferedSalary: {
    label: '',
    name: '',
    rules: [],
  },
  maxOfferedSalary: {
    label: '',
    name: '',
    rules: [],
  },
  description: {
    label: '',
    name: '',
    rules: [],
  },
};

export default JobPostingConfig;
