/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConstants } from 'constants/index';
import {
  get, patch, post,
} from 'service/api-method';
import queryString from 'query-string';

export const getLoggedInUser = async (): Promise<any> => {
  const apiCall = await get(ApiConstants.USER_INFO, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type changeNamePatchObj={
  first_name: string;
  id: string;
  last_name: string;
}

type changeEmailSubscription={
  email_subscribed: boolean;
  id: string;
}

type changeSmsSubscription={
  sms_subscribed: boolean;
  id: string;
}

export const changeUserData = async (patchObj:
changeNamePatchObj| changeEmailSubscription | changeSmsSubscription)
: Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${patchObj.id}/`;
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type changeEmailPostObj={
  new_email: string;
}

export const changeEmail = async (postObj:changeEmailPostObj, id:string): Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${id}/initiate_email_change/`;
  const apiCall = await post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type changeMobilePostObj={
  new_mobile: string;
}

export const changeMobileNo = async (postObj:changeMobilePostObj, id:string): Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${id}/initiate_mobile_change/`;
  const apiCall = await post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type changePwdPostObj={
  new_password: string;
  old_password: string;
}

export const changePwd = async (postObj:changePwdPostObj, id:string): Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${id}/change_password/`;
  const apiCall = await post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type SetPassWordPostObj = {
  password: string;
}

export const setPassword = async (postObj: SetPassWordPostObj, id: string): Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${id}/employer_set_passoword/`;
  const apiCall = await post(url, postObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type deactivateManagerPatchObj={
  id: string;
}

export const deactivateManger = async (patchObj:deactivateManagerPatchObj): Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${patchObj.id}/deactivate/`;
  const apiCall = await patch(url, patchObj, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

type addManagerPostObj={
  organization_id: string;
  user_data: {
    email: string;
    first_name: string;
    last_name: string;
    mobile: string;
  }
}

export const addSecondaryManager = async (postObj:addManagerPostObj, options = { isForm: false, withAuth: false, errorMessage: '' }): Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}${postObj.organization_id}/add_manager/`;
  const apiCall = await post(url, postObj, options);
  return apiCall;
};

export const getAccountSummary = async (orgId:string,
  limit:number, offset:number):Promise<any> => {
  const url = `${ApiConstants.ORGANIZATION_DETAILS}${orgId}/account_summary/?${queryString.stringify({ limit, offset })}`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const changeWhatsAppSubscription = async (patchObject:
{whatsapp_subscribed: boolean}, userID:string):Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${userID}/whatsapp_subscribe_unsubscribe/`;
  const apiCall = await patch(url, patchObject, { withAuth: true, isForm: false, errorMessage: 'A whatsapp verification link has been sent on the linked phone number' });
  return apiCall;
};

export const getWhatsAppSubscription = async (userID:string): Promise<any> => {
  const url = `${ApiConstants.USER_INFO}${userID}/whatsapp_subscribe_unsubscribe/`;
  const apiCall = await get(url, { withAuth: true, isForm: false, errorMessage: '' });
  return apiCall;
};

export const subscribeToWhatsApp = async (
  whatsAppNotificationsEnabled: boolean, userID:string,
):Promise<any> => {
  const apiCall = await changeWhatsAppSubscription(
    { whatsapp_subscribed: whatsAppNotificationsEnabled }, userID,
  );
  return apiCall;
};
