/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import moment from 'moment';
// import dayjs from 'dayjs';

export const EDUCATION = [
  { value: 0, label: 'No Preference' },
  { value: 1, label: '10th Pass' },
  { value: 2, label: '12th Pass' },
  { value: 3, label: 'Diploma' },
  { value: 4, label: 'Graduate' },
];

export const PROFICIENCY_LEVEL = [
  { label: 'None', value: 1 },
  { label: 'Basic', value: 2 },

  { label: 'Good', value: 3 },
  { label: 'Fluent', value: 4 },
];

export const getProficiencyLevel = (input: number): string => (PROFICIENCY_LEVEL.find(({ value }) => value === input)?.label || 'None');

export const gender = (val: string): string => {
  switch (val) {
    case 'M':
      return 'Male';

    case 'F':
      return 'Female';

    case 'D':
      return 'No Preference';
    default:
      return 'No Preference';
  }

  // if (val === 'M') label = 'Male';
  // if (val === 'F') label = 'Female';
  // if (val === 'D') label = 'No preference';
  // return label;
};

export const SalaryFormat = [
  { value: 1, label: 'Monthly' },
  { value: 0, label: 'Annual CTC' },
];

export const EMPLOYMENT_TYPE = [
  { key: 'FT', label: 'Full Time' },
  { key: 'PT', label: 'Part Time' },
  { key: 'WH', label: 'Work From Home' },
  { key: 'IS', label: 'Internship' },
];

export const ShiftType = [
  { label: 'Morning Shift', value: 'DAY' },
  { label: 'Night Shift', value: 'NIGHT' },
];

export const proficiency = [
  { value: 1, label: 'Basic' },
  { value: 2, label: 'Good' },
  { value: 3, label: 'Fluent' },
  { value: 4, label: 'Excellent' },
];

// eslint-disable-next-line no-shadow
export enum constants {
  FT = 'Full Time',
  PT = 'Part Time',
  I = 'Internship',
  IS = 'Internship',
  WH = 'Work From Home',
  SHIFT_TIME = 'Shift Timings',
  MALE_CHECK = 'For Males only',
  F = 'Female',
  M = 'Male',
  NP = 'Both',
  FEATURE_PHONE = 'Featured Phone',
  ANDROID_PHONE = 'Android Phone',
  OTHER = 'Other Smartphones'
}

export const proficiencyToName = (val: number): string => {
  switch (val) {
    case 1: return 'None';
    case 2: return 'Basic';
    case 3: return 'Good';
    case 4: return 'Fluent';
    default: return '';
  }
};

export const eduMapToName = (val:number): string => {
  switch (val) {
    case 0: return 'No minimum';
    case 1: return '10th Pass';
    case 2: return '12th Pass';
    case 3: return 'Diploma';
    case 4: return 'Graduate';

    default: return '';
  }

  // if (val === 0) label = 'Any Degree or Schooling';
  // if (val === 1) label = '10';
  // if (val === 2) label = '12';
  // if (val === 4) label = 'Graduate';
  // if (val === 5) label = 'Post Graduate';
  // if (val === 6) label = 'Doctrate';
  // return label;
};

export const edumaptovalue = (val: string): number => {
  // let label;
  switch (val) {
    case 'Any Degree or Schooling': return 0;
    case '10': return 1;
    case '12': return 2;
    case 'Pursuing Graduation': return 3;
    case 'Graduate': return 4;
    case 'Post Graduate': return 5;
    case 'Doctrate': return 6;
    default: return 0;
  }
  // if (val === 'Any Degree or Schooling') label = 0;
  // if (val === '10') label = 1;
  // if (val === '12') label = 2;
  // if (val === 'Graduate') label = 4;
  // if (val === 'Post Graduate') label = 5;
  // if (val === 'Doctrate') label = 6;
  // return label;
};

export const empType = (value: string | undefined): string => {
  // let type;
  switch (value) {
    case 'FT': return 'Full Time';
    case 'PT': return 'Part Time';
    case 'WH': return 'Work From Home';
    case 'IS': return 'Internship';
    default: return '';
  }
  // if (value === 'FT') type = 'Full Time';
  // if (value === 'PT') type = 'Part Time';
  // if (value === 'WH') type = 'Work From Home';
  // if (value === 'IS') type = 'Internship';
  // return type;
};

export const shiftTypeToName = (value: string): string => (
  value === 'DAY' ? 'Morning Shift' : 'Night Shift'
);

export const salaryPeriod = (value: number): string => {
  if (value === 0) {
    return 'Annual';
  } if (value === 1) {
    return 'Monthly';
  }
  return 'Other';
};

export const vehicleMapToName = (id: number): string => {
  let vehicle;
  if (id === 1) vehicle = 'Bike/Scooter';
  if (id === 2) vehicle = 'Car';
  if (id === 3) vehicle = 'Cycle';
  return vehicle;
};

export const modeToName = (val: number): string => {
  let mode;
  if (val === 1) mode = 'Speak';
  if (val === 2) mode = 'Read';
  if (val === 3) mode = 'Write';
  return mode;
};

export const licenseVal = [
  { text: '2-Wheeler Driving License', id: 1 },
  { text: '4-Wheeler Driving License', id: 2 },
  { text: 'TR Driving License', id: 3 },
];

const documentMap = {
  1: '2-Wheeler Driving License',
  2: '4-Wheeler Driving License',
  3: 'TR Driving License',
  4: 'Aadhar Card',
  5: 'Pan Card',
  6: 'Voter ID',
  7: 'Passport',
  8: 'Electricity Bill',
  9: 'Marksheets and Degree',
  10: 'Joining and Relieving Letters',
  11: 'Salary slips',
  12: 'Photos',
  13: 'Cheque Book / Pass Book',

};
export const documentMapToName = (id: number): string => documentMap[id];

const languageMap = {
  1: 'English',
  2: 'Hindi',
  3: 'Marathi',
  4: 'Gujarati',
  5: 'Bengali',
  6: 'Oriya',
  7: 'Kannada',
  8: 'Tamil',
  9: 'Urdu',
  10: 'Assamese',
  11: 'Malayalam',
  12: 'Punjabi',
  13: 'Arabic',
  14: 'French',
  15: 'Telugu',
};
export const languageToName = (id: any): string => languageMap[id];

const languageIdMap = {
  English: 1,
  Hindi: 2,
  Marathi: 3,
  Gujarati: 4,
  Bengali: 5,
  Oriya: 6,
  Kannada: 7,
  Tamil: 8,
  Urdu: 9,
  Assamese: 10,
  Malayalam: 11,
  Punjabi: 12,
  Arabic: 13,
  French: 14,
  Telugu: 15,
};
export const languageToID = (id: string | any): number => languageIdMap[id];

export const mobileToName = (id: number): string => {
  let mobile;
  if (id === 1) mobile = 'Feature Phone';
  if (id === 2) mobile = 'Other SmartPhone';
  if (id === 3) mobile = 'Android Phone';
  return mobile;
};

export const exp = (): Array<{ years: string; months: any }> => {
  const exparr = [
    { years: 'Any Year', months: null },
    { years: '6 months', months: 6 },
    { years: '1 year', months: 12 },
  ] as Array<{ years: string; months: any }>;
  for (let i = 2; i <= 40; i += 1) {
    exparr.push({ years: `${i} years`, months: i * 12 });
  }
  return exparr;
};

export const ageList = (): Array<number> => {
  const ages = [] as Array<number>;
  for (let i = 14; i <= 60; i += 1) {
    ages.push(i);
  }
  return ages;
};

export const documents = (doc): Array<{ document_id: number; is_mandatory: boolean }> => {
  const documentmap = [] as Array<{ document_id: number; is_mandatory: boolean }>;
  for (let i = 0; i < doc.length; i += 1) {
    documentmap.push({ document_id: doc[i], is_mandatory: true });
  }
  return documentmap;
};

export const convertTime12to24 = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    const hourvar = parseInt(hours, 10) + 12;
    hours = hourvar.toString();
  }
  return `${hours}:${minutes}:00`;
};

export const InterviewTimingsArray = () => {
  const hours = [] as any;
  for (let hour = 0; hour < 24; hour += 1) {
    hours.push(moment({ hour }).format('hh:mm A'));
    hours.push(
      moment({
        hour,
        minute: 30,
      }).format('hh:mm A'),
    );
  }
  return hours;
};

export const tConvert = (time): string => {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }

  return time.join(''); // return adjusted time or original string
};

// export const timeConvert = (time): string => dayjs(time).format('H:MM a');

export const randomAddressImage = (): number => Math.floor(Math.random() * 7) + 1;

export const InterviewRangePickerValues = [{ display: '00:00 am', value: '00:00:00' },
  { display: '00:30 am', value: '00:30:00' },
  { display: '1:00 am', value: '1:00:00' },
  { display: '1:30 am', value: '1:30:00' },
  { display: '2:00 am', value: '2:00:00' },
  { display: '2:30 am', value: '2:30:00' },
  { display: '3:00 am', value: '3:00:00' },
  { display: '3:30 am', value: '3:30:00' },
  { display: '4:00 am', value: '4:00:00' },
  { display: '4:30 am', value: '4:30:00' },
  { display: '5:00 am', value: '5:00:00' },
  { display: '5:30 am', value: '5:30:00' },
  { display: '6:00 am', value: '6:00:00' },
  { display: '6:30 am', value: '6:30:00' },
  { display: '7:00 am', value: '7:00:00' },
  { display: '7:30 am', value: '7:30:00' },
  { display: '8:00 am', value: '8:00:00' },
  { display: '8:30 am', value: '8:30:00' },
  { display: '9:00 am', value: '9:00:00' },
  { display: '9:30 am', value: '9:30:00' },
  { display: '10:00 am', value: '10:00:00' },
  { display: '10:30 am', value: '10:30:00' },
  { display: '11:00 am', value: '11:00:00' },
  { display: '11:30 am', value: '11:30:00' },
  { display: '12:00 pm', value: '12:00:00' },
  { display: '12:30 pm', value: '12:30:00' },
  { display: '1:00 pm', value: '13:00:00' },
  { display: '1:30 pm', value: '13:30:00' },
  { display: '2:00 pm', value: '14:00:00' },
  { display: '2:30 pm', value: '14:30:00' },
  { display: '3:00 pm', value: '15:00:00' },
  { display: '3:30 pm', value: '15:30:00' },
  { display: '4:00 pm', value: '16:00:00' },
  { display: '4:30 pm', value: '16:30:00' },
  { display: '5:00 pm', value: '17:00:00' },
  { display: '5:30 pm', value: '17:30:00' },
  { display: '6:00 pm', value: '18:00:00' },
  { display: '6:30 pm', value: '18:30:00' },
  { display: '7:00 pm', value: '19:00:00' },
  { display: '7:30 pm', value: '19:30:00' },
  { display: '8:00 pm', value: '20:00:00' },
  { display: '8:30 pm', value: '20:30:00' },
  { display: '9:00 pm', value: '21:00:00' },
  { display: '9:30 pm', value: '21:30:00' },
  { display: '10:00 pm', value: '22:00:00' },
  { display: '10:30 pm', value: '22:30:00' },
  { display: '11:00 pm', value: '23:00:00' },
  { display: '11:30 pm', value: '23:30:00' },
];

export const interviewType = (type: string): string => {
  if (type === 'FACE') return 'Face to Face Interview';
  if (type === 'TELE') return 'Telephonic Interview';
  return 'Video Interview';
};

export const videoType = (type: string): string => {
  if (type === 'WHATSAPP_VID') return 'Whatsapp Video Call';
  if (type === 'VID') return 'Skype Call';
  if (type === 'HANG_VID') return 'Google Hangouts';
  return 'Other';
};

export const OrganizationType = [
  { label: 'Small & Medium Enterprise', value: 'SME' },
  { label: 'Manpower Agency', value: 'HR' },
  { label: 'Startup', value: 'STA' },
  { label: 'Corporate', value: 'CORP' },
  { label: 'Individual Employer', value: 'IND' },
];

export const EmployeeCount = [
  { label: '0-50', value: 'SME' },
  { label: '50-200', value: 'HR' },
  { label: '200-500', value: 'STA' },
  { label: '500-1000', value: 'CORP' },
  { label: 'Above 1000', value: 'IND' },
];

export const JobTabs = [
  { label: 'Open', key: 'open' },
  { label: 'Drafts', key: 'drafts' },
  { label: 'Unapproved', key: 'unapproved' },
  { label: 'Paused', key: 'paused' },
  { label: 'Closed', key: 'closed' },
];

export const rechargeInvoiceStatus = {
  CR: 'Unpaid',
  PP: 'Partially Paid',
  ISP: 'Paid',
  PR: 'Paid',
  TBC: 'Cancelled',
  CL: 'Cancelled',
};
export const profileLinksConst = (link:string): string => {
  let label;
  if (link === 'Add Why Work With Us') label = 'Why Work With Us';
  if (link === 'Add Office photos') label = 'Photos';
  if (link === 'Add Logo') label = 'Logo';
  if (link === 'Add Website') label = 'Website';
  if (link === 'Add Founded Year') label = 'Founded Year';
  if (link === 'Add No of Employees') label = 'No of Employees';
  if (link === 'Add Industry') label = 'Industry';
  if (link === 'Add Type') label = 'Type of company';
  if (link === 'Add About Your Company') label = 'About Us';
  if (link === 'Add Social Links') label = 'Social Media links';
  if (link === 'Add Tagline') label = 'Tagline';
  return label;
};

export const pricingConstants = {
  JP: 'Jobs Posted',
  FJ: 'Promoted Job Credits',
  APP_UL: 'Application Unlocks Used',
  DB_UL: 'Database Unlocks Used',
};

export const pricingConstantsClevertapValue = {
  JP: 'Job Posting Credits',
  FJ: 'Promoted Job Credits',
  APP_UL: 'Application Unlock Credits',
  DB_UL: 'Database Unlock Credits',
};

export const WORKDAYS = [
  {
    key: 7,
    value: 'S',
    id: 'SUN',
  },
  {
    key: 1,
    value: 'M',
    id: 'MON',
  },
  {
    key: 2,
    value: 'T',
    id: 'TUE',
  },
  {
    key: 3,
    value: 'W',
    id: 'WED',
  },
  {
    key: 4,
    value: 'T',
    id: 'THU',
  },
  {
    key: 5,
    value: 'F',
    id: 'FRI',
  },
  {
    key: 6,
    value: 'S',
    id: 'SAT',
  },
];

export const EXPERIENCE_RANGE = [
  {
    key: '0-1',
    label: '0-1 years',
  },
  {
    key: '1-3',
    label: '1-3 years',
  },
  {
    key: '3-5',
    label: '3-5 years',
  },
  {
    key: '5-40',
    label: '5+ years',
  },
];

export const GENDER = [
  {
    key: 'D',
    label: 'Both',
  },
  {
    key: 'M',
    label: 'Male',
  },
  {
    key: 'F',
    label: 'Female',
  },
];

export const AddressValidator = (value: string | any, addressList: Array<any>): Promise<void> => {
  const selectedAddress = addressList.find((address) => address.id === value);
  if (selectedAddress && selectedAddress.address.length > 90) {
    return Promise.reject(new Error('Address cannot be more than 90 characters'));
  }

  return Promise.resolve();
};
