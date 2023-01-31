import { ApiConstants } from 'constants/index';
import config from 'config';
import { get, patch, post } from 'service/api-method';

export const getUserInfo = async (userId, withAuth = false): Promise<any> => {
  const apiResponse = await get(`${config.API_ENDPOINT}api/v4/user/${userId}/`, { withAuth, isForm: false, errorMessage: '' });
  return apiResponse;
};

export const generateOtp = async (userId, otpPostObj, withAuth = false): Promise<any> => {
  const apiResponse = await post(`${config.API_ENDPOINT}api/v4/user/${userId}/generate_otp/`, otpPostObj, { withAuth, isForm: false, errorMessage: '' });
  return apiResponse;
};

export const generateEmailOtp = async (userId, otpPostObj, withAuth = false): Promise<any> => {
  const apiResponse = await post(`${config.API_ENDPOINT}api/v4/user/${userId}/generate_user_email_otp/`, otpPostObj, { withAuth, isForm: false, errorMessage: '' });
  return apiResponse;
};

export const submitOtp = async (userId, otpPostObj, withAuth = false): Promise<any> => {
  const apiResponse = await post(`${config.API_ENDPOINT}api/v4/user/${userId}/verify_mobile_change/`, otpPostObj, { withAuth, isForm: true, errorMessage: '' });
  return apiResponse;
};

export const submitEmailOtp = async (otpPostObj, withAuth = false): Promise<any> => {
  const apiResponse = await patch(`${config.API_ENDPOINT}api/v4/user/verify_email/`, otpPostObj, { withAuth, isForm: true, errorMessage: '' });
  return apiResponse;
};

export const submitLoginOtp = async (otpPostObj, withAuth = false): Promise<any> => {
  const apiResponse = await post(`${config.API_ENDPOINT}api/v4/login_via_otp/`, otpPostObj, { withAuth, isForm: true, errorMessage: '' });
  return apiResponse;
};

export const getUserProfile = async (): Promise<void> => {
  const res = await get(`${ApiConstants.USER_PROFILE}`, { withAuth: true, isForm: false, errorMessage: '' });
  const apiResponse = await res.data;
  return apiResponse;
};

export const otpRegistration = async (otpPostObj, withAuth = false): Promise<any> => {
  const apiResponse = await post(`${ApiConstants.OTP_REGISTRATION}`, otpPostObj, { withAuth, isForm: false, errorMessage: '' });
  return apiResponse;
};
