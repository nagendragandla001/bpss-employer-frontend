/* eslint-disable no-underscore-dangle */
import {
  OrganizationStore, OrganizationStoreModel,
} from 'stores';

interface ManagersListInterface{
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;

}
interface OrgOfficesListInterface{
  address: string;
  id: number;
  formattedAddress: string;
  location: string;
  placeId: string;
}

const getManagersList = (managersList): Array<ManagersListInterface> => managersList.map(
  (item) => ({
    type: item.type || '',
    firstName: item?.user?.first_name || '',
    lastName: item?.user?.last_name || '',
    email: item?.user?.email || '',
    mobile: item?.user?.mobile || '',
  }),
);

const getOrgOfficesList = (officesList): Array<OrgOfficesListInterface> => officesList.map(
  (item) => ({
    address: item.address || '',
    id: item.id,
    formattedAddress: (item?.place?.formatted_address) || '',
    location: (item?.place?.location) || '',
    placeId: (item?.place?.place_id) || '',
  }),
);

const getOrgIndustry = (industry): {name: string; id: string} | null => {
  if (industry) {
    return ({
      name: industry.name || '',
      id: industry.id.toString() || '',
    });
  }
  return null;
};

const setupOrganizationStore = (OrganizationData?): {orgData: OrganizationStoreModel} => {
  const orgData = OrganizationStore.create({
    id: (OrganizationData && OrganizationData.objects && OrganizationData.objects.length > 0 && OrganizationData.objects[0]._source && OrganizationData.objects[0]._source.id) || '',
    managers: OrganizationData && OrganizationData.objects
              && OrganizationData.objects.length > 0 && OrganizationData.objects[0]._source
              && OrganizationData.objects[0]._source.managers.length > 0
      ? getManagersList(OrganizationData.objects[0]._source.managers) : [],
    offices: OrganizationData && OrganizationData.objects
              && OrganizationData.objects.length > 0 && OrganizationData.objects[0]._source
              && OrganizationData.objects[0]._source.offices.length > 0
      ? getOrgOfficesList(OrganizationData.objects[0]._source.offices) : [],
    name: (OrganizationData && OrganizationData.objects && OrganizationData.objects.length > 0 && OrganizationData.objects[0]._source && OrganizationData.objects[0]._source.name) || '',
    type: (OrganizationData && OrganizationData.objects
          && OrganizationData.objects.length > 0 && OrganizationData.objects[0]._source
          && OrganizationData.objects[0]._source.type) || null,
    industry: OrganizationData && OrganizationData.objects && OrganizationData.objects.length > 0
          && OrganizationData.objects[0]._source && OrganizationData.objects[0]._source.industry
      ? getOrgIndustry(OrganizationData.objects[0]._source.industry) : null,
    logo: (OrganizationData && OrganizationData.objects && OrganizationData.objects.length > 0 && OrganizationData.objects[0]._source && OrganizationData.objects[0].logo) || '',
  });

  return { orgData };
};

export default setupOrganizationStore;
