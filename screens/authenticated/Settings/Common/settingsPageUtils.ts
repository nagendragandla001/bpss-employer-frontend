/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import snackBar from 'components/Notifications';
import AppConstants from 'constants/constants';
import dayjs from 'dayjs';
import { VerificationInfo } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import {
  addSecondaryManager,
  changeEmail, changeMobileNo, changePwd,
  changeUserData, deactivateManger, getAccountSummary,
  getLoggedInUser, setPassword,
} from 'service/accounts-settings-service';
import { initiateResetPasswordAPI, recognizeUserAPI } from 'service/login-service';
import { getOrgDetails, patchOrgDetails } from 'service/organization-service';
import { generateOtp, submitOtp } from 'service/userInfoService';
import { pushClevertapEvent } from 'utils/clevertap';
import { has } from 'utils/common-utils';
import {
  EmailRegexPattern, MobileRegexPattern,
} from 'utils/constants';

export type ManagerType = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  emailSubscribed: boolean;
  smsSubscribed: boolean;
  type: string;
  id: string;
  unverifiedEmail: string;
  unverifiedMobileNo: string;
  whatsappNotificationSubscribed: boolean;
  managerId: string;
}

type changeNamePatchObj = {
  first_name: string;
  id: string;
  last_name: string;
}

export interface PayloadActionI {
  type: string;
  payload: any;
}

export interface SettingsStateI {
  loggedInManager: ManagerType | null;
  primaryManager: ManagerType | null;
  secondaryManagers: Array<ManagerType>;
  dataLoading: boolean;
  orgId: string;
  verificationInfo: VerificationInfo;
  type: string;
  website: string;
  passwordExists: boolean;
  emailVerified: boolean;
  email: string;
  showModal: string;
  resendingOtp: boolean;
  formErrorMessage: string;
  requestInProgress: boolean;
}

export interface SettingsFieldInterface {
  state: SettingsStateI;
  onEdit: (type, optional?) => void | Promise<void> | any;
}

export interface VerificationInterface {
  state: any;
  toggleState: boolean;
  dispatch?: ({ type: string, payload: any }) => void;
}

export const modalTitles = {
  changeName: 'Change Name',
  changeEmail: 'Change Email',
  verifyEmail: 'Verify New Email',
  changeMobileNo: 'Change Mobile no.',
  addNewMobileNo: 'Add Mobile no.',
  verifyMobileNo: 'Verify New Mobile no.',
  mobileNoUpdated: 'Mobile no. updated!',
  mobileNoVerified: 'Mobile no. verified!',
  changePwd: 'Change Password',
  setPwd: 'Set New Password',
  forgotPassword: 'Forgot Password?',
  forgotPasswordSuccess: 'Forgot Password?',
  addSecondaryManager: 'Add Secondary Manager',
};

export const modalFooterBtnText = {
  changeName: 'Update Name',
  changeEmail: 'Update Email',
  verifyEmail: 'OK',
  changeMobileNo: 'Update Mobile no.',
  addNewMobileNo: 'Add Mobile no.',
  mobileNoUpdated: 'OK',
  mobileNoVerified: 'OK',
  changePwd: 'Change Password',
  setPwd: 'Save Password',
  forgotPassword: 'SUBMIT',
  addSecondaryManager: 'Add Manager',
};

export const getManagerDetails = (data: any): ManagerType => ({
  firstName: (has(data, 'user.first_name')
    && data.user.first_name) || '',
  lastName: (has(data, 'user.last_name')
    && data.user.last_name) || '',
  email: (has(data, 'user.email') && data.user.email) || '',
  mobileNo: (has(data, 'user.mobile') && data.user.mobile) || '',
  id: (has(data, 'user.id') && data.user.id) || '',
  emailVerified: (has(data, 'user.email_verified')
    && data.user.email_verified) || false,
  mobileVerified: (has(data, 'user.mobile_verified')
    && data.user.mobile_verified) || false,
  emailSubscribed: (has(data, 'user.email_subscribed')
    && data.user.email_subscribed) || false,
  smsSubscribed: (has(data, 'user.sms_subscribed')
    && data.user.sms_subscribed) || false,
  type: data.type || 'S',
  unverifiedEmail: '',
  unverifiedMobileNo: '',
  whatsappNotificationSubscribed: false,
  managerId: data.id || '',
});

const getFlatOrgManagers = (managers): Array<ManagerType> => managers.map((item) => ({
  firstName: (has(item, 'user.first_name')
    && item.user.first_name.trim()) || '',
  lastName: (has(item, 'user.last_name')
    && item.user.last_name.trim()) || '',
  email: (has(item, 'user.email') && item.user.email) || '',
  mobileNo: (has(item, 'user.mobile') && item.user.mobile) || '',
  id: (has(item, 'user.id') && item.user.id) || '',
  emailVerified: (has(item, 'user.email_verified')
    && item.user.email_verified) || false,
  mobileVerified: (has(item, 'user.mobile_verified')
    && item.user.mobile_verified) || false,
  emailSubscribed: (has(item, 'user.email_subscribed')
    && item.user.email_subscribed) || false,
  smsSubscribed: (has(item, 'user.sms_subscribed')
    && item.user.sms_subscribed) || false,
  type: item.type || 'S',
  unverifiedEmail: '',
  unverifiedMobileNo: '',
  whatsappNotificationSubscribed: false,
  managerId: item.id || '',
}));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getOrgManagers = (data): Array<ManagerType> => {
  const orgManagers: Array<ManagerType> = (has(data.objects[0], '_source.managers')
    && Array.isArray(data.objects[0]._source.managers)
    && data.objects[0]._source.managers.length
    && getFlatOrgManagers(data.objects[0]._source.managers)) || [];
  return orgManagers;
};

export const getSettingPageData = async (): Promise<{
  orgManagers: Array<ManagerType>;
  loggedInManager: ManagerType | null;
  orgId: string;
  remaniningJPCredits: number;
  verificationInfo: VerificationInfo;
  type: string;
  website: string;
  passwordExists: boolean;
  emailVerified: boolean;
}> => {
  const apiCall1 = await getLoggedInUser();
  const apiCall2 = await getOrgDetails();
  if (apiCall1 && apiCall2) {
    const userDetails = await apiCall1.data;
    const orgDetails = await apiCall2.data;
    if (orgDetails && orgDetails.objects && orgDetails.objects.length
      && userDetails && userDetails.objects && userDetails.objects.length) {
      const loggedInUserId = (has(userDetails.objects[0], 'id') && userDetails.objects[0].id) || '';
      const orgManagers: Array<ManagerType> = getOrgManagers(orgDetails);
      const loggedInManagerIndex = orgManagers.findIndex((item) => item.id === loggedInUserId);
      let loggedInManager: Array<ManagerType> = [];
      if (loggedInManagerIndex >= 0) {
        loggedInManager = orgManagers.splice(loggedInManagerIndex, 1);
        if (has(userDetails.objects[0], 'reset_code.temp_email')) {
          loggedInManager[0].unverifiedEmail = userDetails.objects[0].reset_code.temp_email;
        }
        if (has(userDetails.objects[0], 'reset_code.temp_mobile')) {
          loggedInManager[0].unverifiedMobileNo = userDetails.objects[0].reset_code.temp_mobile;
        }
        loggedInManager[0].whatsappNotificationSubscribed = (
          userDetails.objects[0].whatsapp_subscribed) || false;
      }
      const orgId = (has(orgDetails.objects[0], '_id') && orgDetails.objects[0]._id) || '';
      const remaniningJPCredits = (has(orgDetails.objects[0],
        '_source.org_pricing_stats.remaining_job_posting_credits')
        && orgDetails.objects[0]._source.org_pricing_stats.remaining_job_posting_credits) || 0;
      const verificationInfo = orgDetails?.objects?.[0]?._source?.verification_info;
      const type = ['SME', 'HR', 'IND'].includes(orgDetails?.objects?.[0]?._source?.type) ? orgDetails?.objects?.[0]?._source?.type : '';
      const website = orgDetails?.objects?.[0]?._source?.website;
      const passwordExists = userDetails?.objects[0]?.password_exists || false;
      const emailVerified = userDetails?.objects[0]?.email_verified || false;
      return ({
        orgManagers,
        loggedInManager: loggedInManager.length > 0 ? loggedInManager[0] : null,
        orgId,
        remaniningJPCredits,
        verificationInfo,
        type,
        website,
        passwordExists,
        emailVerified,
      });
    }
  }
  return ({
    orgManagers: [],
    loggedInManager: null,
    orgId: '',
    remaniningJPCredits: 0,
    verificationInfo: {
      status: 'P_D',
      pan_verification: { value: '', value_status: 'P_D' },
      gst_verification: { value: '', value_status: 'P_D' },
      registered_company_name: { value: '', value_status: 'P_D' },
    },
    type: '',
    website: '',
    passwordExists: false,
    emailVerified: false,
  });
};

export type transactionDetails = {
  id: string;
  summaryType: string;
  txnType: string;
  totalCredits: string;
  invoiceLink: string;
  referenceId: string;
  txnEndTime: string;
  isGoodWill: boolean;
  noOfJobsBought: number;
  title: string;
  closingBalance: number;
}

export const getPassbookDetails = async (orgId: string,
  limit: number, offset: number): Promise<{
  transactions: Array<transactionDetails>;
  noOfTransactions: number;
  walletBalance: number;
}> => {
  const apiCall = await getAccountSummary(orgId, limit, offset);
  if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
    const response = await apiCall.data;
    if (response && response.objects
      && Array.isArray(response.objects) && response.objects.length) {
      const transactions = response.objects.map((item) => ({
        id: (has(item, 'id') && item.id) || '',
        summaryType: (has(item, 'summary_type') && item.summary_type) || '',
        txnType: (has(item, 'txn_type') && item.txn_type) || '',
        totalCredits: (has(item, 'total_credits'), item.total_credits) || '',
        invoiceLink: (has(item, 'payment_info.invoice_link') && item.payment_info.invoice_link) || '',
        referenceId: (has(item, 'payment_info.reference_id') && item.payment_info.reference_id) || '',
        txnEndTime: (has(item, 'end_ts') && dayjs(item.end_ts).format('DD MMM YY h:mm A')) || '',
        noOfJobsBought: (has(item, 'job_posting_info.num_bought_jobs') && item.job_posting_info.num_bought_jobs) || 0,
        title: (has(item, 'title') && item.title) || '',
        closingBalance: (has(item, 'closing_balance') && item.closing_balance) || 0,
      }));
      const walletBalance = (has(response.objects[0], 'cumulative_wallet_balance')
        && response.objects[0].cumulative_wallet_balance) || 0;
      return {
        transactions,
        noOfTransactions: (has(response, 'meta.count') && response.meta.count) || response.objects.length,
        walletBalance,
      };
    }
  }
  return {
    transactions: [],
    noOfTransactions: 0,
    walletBalance: 0,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isUserValid = async (_rule, value: string): Promise<void> => {
  if (value && (EmailRegexPattern.test(value.trim()) || MobileRegexPattern.test(value.trim()))) {
    const resData = await recognizeUserAPI(value.trim(), { isForm: true, withAuth: false, errorMessage: '' });
    const userData = await resData.data;
    if (userData) {
      if (userData && userData.user_type) {
        switch (userData.user_type) {
          case 'ER':
            throw new Error('You already have an account with us.');
          case 'CA':
            throw new Error('You already have an account with us as Candidate.');
          case 'P':
            throw new Error('You already have an account with us as Partner.');
          case 'PA':
            throw new Error('You seem to have an Agency account with us.');
          default:
            throw new Error('Some Error Occured');
        }
      }
    }
  }
  return Promise.resolve();
};

export const removeManager = async (index: number,
  state: SettingsStateI, dispatch: (evt: PayloadActionI) => void): Promise<void> => {
  if (index >= 0 && state?.secondaryManagers
    && state?.secondaryManagers[index] && state?.secondaryManagers[index].id) {
    const apiCall = await deactivateManger({ id: state?.secondaryManagers[index].id });
    if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
      const response = await apiCall.data;
      if (response && response.is_deleted) {
        const tempSecondaryManagers = [...state?.secondaryManagers];
        tempSecondaryManagers.splice(index, 1);
        dispatch({
          type: 'UPDATESTATE',
          payload: {
            secondaryManagers: tempSecondaryManagers,
          },
        });
      }
    }
  }
};
export const resendOtp = async (setResending: boolean,
  state: SettingsStateI, dispatch: (et: PayloadActionI) => void): Promise<void> => {
  if (setResending) {
    dispatch({ type: 'UPDATESTATE', payload: { resendingOtp: true } });
  }
  const otpPostObj = {
    reset_code_type: 'A',
  };
  const apiRespone = await generateOtp(
    (state?.loggedInManager && state?.loggedInManager.id) || '', otpPostObj, true,
  );
  if (apiRespone) {
    dispatch({ type: 'UPDATESTATE', payload: { resendingOtp: false } });
  }
};
export const verifyMobileHandler = (state: SettingsStateI,
  dispatch: (et: PayloadActionI) => void): void => {
  pushClevertapEvent('Special Click', {
    Type: 'Verify Mobile',
  });
  resendOtp(false, state, dispatch);
  const tempLoggedInManager: ManagerType | null = (
    state?.loggedInManager
    && {
      ...state?.loggedInManager,
      unverifiedMobileNo: state?.loggedInManager.mobileNo,
    }) || null;
  dispatch({
    type: 'UPDATESTATE',
    payload: {
      loggedInManager: tempLoggedInManager,
      showModal: 'verifyMobileNo',
    },
  });
};

export const resendVerificationEmail = async (state: SettingsStateI,
  dispatch: (et: PayloadActionI) => void): Promise<void> => {
  const apiCall = await changeEmail({ new_email: (state?.loggedInManager && state?.loggedInManager.unverifiedEmail) || '' },
    (state?.loggedInManager && state?.loggedInManager.id) || '');
  if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
    dispatch({
      type: 'UPDATESTATE',
      payload: {
        showModal: 'verifyEmail',
      },
    });
  }
};

export const onEditHandler = (type: string, state: SettingsStateI,
  dispatch: (et: PayloadActionI) => void, optional = 0):
void | Promise<void> | any => {
  switch (type) {
    case 'changeName':
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: type,
        },
      });
      break;
    case 'changeEmail': {
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: 'changeEmail',
        },
      });
      pushClevertapEvent('Email Change', { Type: 'Start' });
      break;
    }
    case 'resendLink': {
      pushClevertapEvent('Email Change', { Type: 'Resend' });
      return resendVerificationEmail(state, dispatch);
    }
    case 'verifyMobile': {
      verifyMobileHandler(state, dispatch);
      break;
    }
    case 'addNewMobileNo': {
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: type,
        },
      });
      break;
    }
    case 'changeMobileNo': {
      pushClevertapEvent('Mobile Change', { Type: 'Start' });
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: 'changeMobileNo',
        },
      });
      break;
    }
    case 'changePwd': {
      pushClevertapEvent('Password change', { Type: 'Start' });
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: 'changePwd',
        },
      });
      break;
    }
    case 'setPwd': {
      pushClevertapEvent('Password set', { Type: 'Start' });
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: 'setPwd',
        },
      });
      break;
    }
    case 'removeManager': {
      pushClevertapEvent('Secondary Manager', { Type: 'Remove' });
      return removeManager(optional, state, dispatch);
    }
    case 'addSecondaryManager': {
      pushClevertapEvent('Secondary Manager', { Type: 'Start' });
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          showModal: 'addSecondaryManager',
        },
      });
      break;
    }

    default: break;
  }

  return '';
};

const initiateForgotPassword = (postObj, dispatch): void => {
  initiateResetPasswordAPI(postObj).then((response) => {
    if (response) {
      snackBar({
        title: 'Password Reset Email Sent Successfully!!',
        description: 'Password Reset Email Sent Successfully!!',
        iconName: '',
        notificationType: 'success',
        placement: 'topRight',
        duration: 5,
      });
      dispatch({ type: 'UPDATESTATE', payload: { showModal: 'forgotPasswordSuccess' } });
    }
  }).catch(() => {
    dispatch({ type: 'UPDATESTATE', payload: { showModal: '' } });
  });
};

export const getStateValue = (key: string, state: SettingsStateI): string => {
  switch (key) {
    case 'type': return state?.type;
    case 'registered_company_name': return state?.verificationInfo?.registered_company_name?.value || '';
    case 'pan_verification': return state?.verificationInfo?.pan_verification?.value || '';
    case 'gst_verification': return state?.verificationInfo?.gst_verification?.value || '';
    case 'website': return state?.website;
    default: return '';
  }
};

export const onFinishSettingsHandler = async (formData,
  state: SettingsStateI,
  dispatch: (et: PayloadActionI) => void,
  verifyStatus,
  form):
Promise<void> => {
  if (state?.showModal) {
    dispatch({
      type: 'UPDATESTATE',
      payload: {
        requestInProgress: true,
        formErrorMessage: '',
      },
    });
    if (state?.showModal === 'changeName') {
      const patchObj: changeNamePatchObj = {
        first_name: formData.firstName.trim(),
        id: (state?.loggedInManager && state?.loggedInManager.id) || '',
        last_name: formData.lastName.trim(),
      };
      const apiCall = await changeUserData(patchObj);
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        const tempLoggedInManager: ManagerType | null = (state?.loggedInManager
          && {
            ...state?.loggedInManager,
            firstName: patchObj.first_name,
            lastName: patchObj.last_name,
          }) || null;

        dispatch({
          type: 'UPDATESTATE',
          payload: { loggedInManager: tempLoggedInManager, showModal: '' },
        });
      }
    }
    if (state?.showModal === 'changeEmail' && formData.email) {
      const postObj = {
        new_email: formData.email,
      };
      pushClevertapEvent('Email Change', { Type: 'Update' });
      const apiCall = await changeEmail(postObj, (state?.loggedInManager && state?.loggedInManager.id) || '');
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        const tempLoggedInManager: ManagerType | null = (state?.loggedInManager
          && {
            ...state?.loggedInManager,
            unverifiedEmail: postObj.new_email,
          }) || null;
        dispatch({
          type: 'UPDATESTATE',
          payload: {
            loggedInManager: tempLoggedInManager,
            showModal: 'verifyEmail',
          },
        });
      }
    }
    if (['changeMobileNo', 'addNewMobileNo'].includes(state?.showModal) && formData.mobileNo) {
      pushClevertapEvent('Mobile Change', { Type: 'Update' });
      const apiCall = await changeMobileNo({ new_mobile: formData.mobileNo }, (state?.loggedInManager && state?.loggedInManager.id) || '');
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        const tempLoggedInManager: ManagerType | null = (state?.loggedInManager
          && {
            ...state?.loggedInManager,
            unverifiedMobileNo: formData.mobileNo,
          }) || null;

        dispatch({
          type: 'UPDATESTATE',
          payload: {
            loggedInManager: tempLoggedInManager,
            showModal: 'verifyMobileNo',
          },
        });
      }
    }
    if (state?.showModal === 'verifyMobileNo' && formData.otp) {
      const postObj = {
        otp: formData.otp,
        new_mobile: (state?.loggedInManager && state?.loggedInManager.unverifiedMobileNo) || '',
      };
      pushClevertapEvent('Mobile Change', { Type: 'OTP verify' });
      const apiCall = await submitOtp((state?.loggedInManager && state?.loggedInManager.id) || '', postObj, true);
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        verifyStatus.setMobileVerified(true);
        const tempLoggedInManager: ManagerType | null = (state?.loggedInManager
          && {
            ...state?.loggedInManager,
            mobileNo: state?.loggedInManager.unverifiedMobileNo,
            mobileVerified: true,
            unverifiedMobileNo: '',
          }) || null;

        dispatch({
          type: 'UPDATESTATE',
          payload: {
            loggedInManager: tempLoggedInManager,
            showModal: state?.loggedInManager?.mobileNo === state?.loggedInManager?.unverifiedMobileNo ? 'mobileNoVerified' : 'mobileNoUpdated',
          },
        });
      } else if (apiCall?.response?.status === 429) {
        dispatch({
          type: 'UPDATESTATE',
          payload: {
            formErrorMessage: AppConstants.ERRORS.MAX_RETRY_ERR,
          },
        });
      } else if (apiCall?.response?.status === 400) {
        dispatch({
          type: 'UPDATESTATE',
          payload: {
            formErrorMessage: apiCall.response.data.message,
          },
        });
      }
    }
    if (state?.showModal === 'changePwd' && formData) {
      const postObj = {
        new_password: formData.newPwd,
        old_password: formData.currentPwd,
      };
      const apiCall = await changePwd(postObj, (state?.loggedInManager && state?.loggedInManager.id) || '');
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        pushClevertapEvent('Password change', { Type: 'Success' });
        snackBar({
          title: 'Password Updated Successfully!!',
          description: 'Password Updated Successfully!!',
          iconName: '',
          notificationType: 'success',
          placement: 'topRight',
          duration: 5,
        });
        dispatch({
          type: 'UPDATESTATE',
          payload: {
            showModal: '',
          },
        });
      } else if (apiCall.status === 400) {
        form.setFields([{
          name: 'currentPwd',
          errors: ['current password is not correct'],
        }]);
      }
    }
    if (state?.showModal === 'setPwd' && formData) {
      const postObj = {
        password: formData.newPwd,
      };
      const apiCall = await setPassword(postObj, (state?.loggedInManager && state?.loggedInManager.id) || '');
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        dispatch({
          type: 'UPDATESTATE',
          payload: {
            passwordExists: true,
            showModal: '',
          },
        });
      }
      return;
    }
    if (state?.showModal === 'forgotPassword' && formData) {
      const postObj = {
        email: formData && formData.fpEmail,
      };
      dispatch({
        type: 'UPDATESTATE',
        payload: {
          email: formData.fpEmail,
        },
      });

      initiateForgotPassword(postObj, dispatch);
    }
    if (state?.showModal === 'addSecondaryManager' && formData) {
      const postObj = {
        organization_id: state?.orgId,
        user_data: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile: formData.mobileNo || undefined,
        },
      };
      pushClevertapEvent('Secondary Manager', { Type: 'Success' });
      const apiCall = await addSecondaryManager(postObj, { isForm: true, withAuth: true, errorMessage: '' });
      if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
        const response = await apiCall.data;
        const tempSecondaryManagers = [...state?.secondaryManagers];
        if (response && response.user) {
          const newSecondaryManager = getManagerDetails(response);
          tempSecondaryManagers.unshift(newSecondaryManager);
          dispatch({
            type: 'UPDATESTATE',
            payload: {
              secondaryManagers: tempSecondaryManagers,
              showModal: '',
            },
          });
        }
      }
    }
    dispatch({
      type: 'UPDATESTATE',
      payload: {
        requestInProgress: false,
      },
    });
  }
};

export const handleSubmitVerificationState = async (key, state): Promise<void> => {
  const stateValue = getStateValue(key, state);
  await patchOrgDetails({ [key]: stateValue }, state?.orgId);
};

export const onCloseHandler = (state, dispatch): void => {
  dispatch({
    type: 'UPDATESTATE',
    payload: {
      showModal: '',
      formErrorMessage: state?.formErrorMessage ?? '',
    },
  });
};
