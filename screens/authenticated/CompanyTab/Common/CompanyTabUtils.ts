/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { getOrgDetails } from 'service/organization-service';

export interface OrgOfficesType{
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
  id:number
}
export interface SocialLinksType{
  facebook:string;
  google:string;
  glassdoor:string;
  linkedin:string;
  twitter:string;
}
interface DataInterface{
  id:number,
  name:string,
}

interface VerificationStatus {
  value: string | null;
  value_status: string;
}
export interface VerificationInfo {
  status: string;
  pan_verification?: VerificationStatus;
  gst_verification?: VerificationStatus | null;
  registered_company_name: VerificationStatus;
}
export interface OrganizationDetailsType{
  contactsUnlock:number;
  id: string;
  managers: Array<OrgManagersType>,
  offices: Array<OrgOfficesType>,
  description:string;
  operatingCities:Array<DataInterface>;
  headQ:any,
  profileScore:number;
  industry:Record<string, string>;
  name:string;
  photos:any;
  logo:string;
  popularName:string;
  socialLinks:Array<SocialLinksType>;
  facebook:string;
  google:string;
  glassdoor:string;
  linkedin:string;
  twitter:string;
  tagline:string;
  type:string;
  website:string;
  whyWorkHere:string;
  yearOfEstablishment:string;
  employeeCount:number;
  industryName:string;
  isPaidClient: boolean;
  slug:string;
  verificationInfo: VerificationInfo;
}

const getManagersList = (managersList): Array<OrgManagersType> => managersList.map(
  (item) => ({
    type: item.type || '',
    firstName: item?.user?.first_name || '',
    lastName: item?.user?.last_name || '',
    email: item?.user?.email || '',
    mobile: item?.user?.mobile || '',
    id: item?.id || '',
  }),
);

const getOrgOfficesList = (officesList): Array<OrgOfficesType> => officesList.map(
  (item) => ({
    address: item.address || '',
    id: item.id,
    formattedAddress: (item?.place?.formatted_address) || '',
    location: (item?.place?.location) || '',
    placeId: (item?.place?.place_id) || '',
  }),
);

// orgData is api data, so it cannot be typed
export const getFlatOrgData = (orgData): OrganizationDetailsType => ({

  contactsUnlock: (orgData?.objects?.length > 0
    && orgData?.objects[0]?.contact_unlocks_left) || 0,
  id: (orgData?.objects?.length > 0
      && orgData?.objects[0]?._source?.id) || '',

  managers: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.managers?.length > 0
    ? getManagersList(orgData?.objects[0]?._source?.managers) : [],

  offices: orgData?.objects?.length > 0 && orgData?.objects[0]?._source?.offices?.length > 0
    ? getOrgOfficesList(orgData?.objects[0]?._source?.offices) : [],

  description: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.description,

  headQ: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.city,

  operatingCities: orgData && orgData.objects && orgData.objects.length > 0
  && orgData.objects[0]._source && orgData.objects[0]._source.operating_cities,

  profileScore: orgData?.objects && orgData?.objects?.length > 0

  && orgData.objects[0]?._source?.company?.profile_completion_score,

  industry: orgData?.objects && orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.industry,

  industryName: orgData?.objects && orgData?.objects?.length > 0

  && orgData?.objects[0]?._source?.industry?.name,

  name: orgData?.objects?.length > 0 && orgData?.objects[0]?._source?.name,

  photos: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.photos,

  popularName: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.popular_name,

  socialLinks: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.social_links,

  facebook: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.social_links?.facebook,

  twitter: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.social_links?.twitter,

  linkedin: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.social_links?.linkedin,

  glassdoor: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.social_links?.glassdoor,

  google: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.social_links?.google,

  tagline: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.tag_line,

  type: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.type,

  website: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.website,

  yearOfEstablishment: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.year_of_establishment,

  employeeCount: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.employee_count,

  whyWorkHere: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.why_work_here,

  logo: orgData?.objects?.length > 0
  && orgData?.objects[0]?._source?.logo,

  isPaidClient: (orgData?.objects?.length > 0
    && orgData?.objects[0]?._source?.org_pricing_stats?.is_paid_client),
  slug: orgData?.objects?.length > 0
 && orgData?.objects[0]?._source?.slug,

  verificationInfo: orgData?.objects?.[0]?._source?.verification_info,
});

export const getOrganizationData = async ():Promise<any> => {
  const apiCall = await getOrgDetails();
  const OrganizationData = await apiCall.data;
  return getFlatOrgData(OrganizationData);
};

export const companyType = (value:string|undefined):string => {
  if (value === 'STA') return 'Startup';
  if (value === 'HR') return 'Agency/HR firm';
  if (value === 'SME') return 'Small Medium Enterprises (SMEs)';
  if (value === 'IND') return 'Individual Employer';
  if (value === 'CORP') return 'Corporate';
  return '';
};

export const employeeCountLabel = (value:number|undefined):string => {
  let label;
  if (value === 0) label = '0-50 employees';
  else if (value === 1) label = '50-200 employees';
  else if (value === 2) label = '200-500 employees';
  else if (value === 3) label = '500-1000 employees';
  else if (value === 4) label = 'Above 1000 employees';
  return label;
};

export const stripHtmlTags = (str:any):string|boolean => {
  if (str === null || str === '' || str === undefined) return false;
  const updatedString = str?.toString();
  return updatedString.replace(/<[^>]*>/g, '');
};

export const profileLinks = (link):string[] => {
  const it = link;
  const sorting = [
    'whyWorkHere',
    'photos',
    'logo',
    'website',
    'yearOfEstablishment',
    'employeeCount',
    'industryName',
    'type',
    'description',
    'facebook',
    'twitter',
    'linkedin',
    'glassdoor',
    'tagline',
  ];
  const solution = {
    whyWorkHere: 'Add Why Work With Us',
    photos: 'Add Office photos',
    logo: 'Add Logo',
    website: 'Add Website',
    yearOfEstablishment: 'Add Founded Year',
    employeeCount: 'Add No of Employees',
    industryName: 'Add Industry',
    type: 'Add Type',
    description: 'Add About Your Company',
    socialLinks: 'Add Social Links',
    tagline: 'Add Tagline',
  };
  const result = [] as string[];
  const reason = [] as string[];
  let itj = [] as string[];

  for (const key in it) {
    if (!it[key]) {
      if (!(key === 'employeeCount' && it.employeeCount === 0)) { itj.push(key); }
    }
  }
  sorting.forEach((key) => {
    let found = false;
    itj = itj.filter((item) => {
      if (!found && item === key) {
        reason.push(item);
        if ((result.indexOf('Add Social Links') === -1) && (item === 'twitter' || item === 'facebook' || item === 'linkedin' || item === 'glassdoor')) {
          result.push(solution.socialLinks);
        } else { result.push(solution[item]); }
        found = true;
        return false;
      } return true;
    });
  });
  return result;
};

export const tooltipMessage = (type): string => {
  if (type === 'IND') {
    return 'Company PAN will be verified against the Registered name';
  }
  return 'Company GST will be verified against the Registered company name';
};

export const generalDetailsModal = ['Add Website', 'Add Social Links', 'Add Tagline'];
export const AddDetailsModal = ['Add Founded Year', 'Add No of Employees', 'Add Industry', 'Add Type'];
