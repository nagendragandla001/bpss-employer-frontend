import { JobPost, OrganizationStoreModel, UserDetailsStoreModel } from 'stores/index';
import { FormInstance } from 'antd/lib/form';

export interface JobPostingPagePropsType{
  store: JobPost;
  userDetails: UserDetailsStoreModel;
  orgstore: OrganizationStoreModel;
  form: FormInstance;
}
