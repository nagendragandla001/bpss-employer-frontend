import { SettingsStateI, PayloadActionI } from 'screens/authenticated/Settings/Common/settingsPageUtils';

export interface DataI {
  name: string;
}

export const SettingsInititalState = {
  loggedInManager: null,
  primaryManager: null,
  secondaryManagers: [],
  orgId: '',
  dataLoading: true,
  verificationInfo: {
    status: 'P_D',
    pan_verification: { value: '', value_status: 'P_D' },
    registered_company_name: { value: '', value_status: 'P_D' },
  },
  type: '',
  website: '',
  passwordExists: false,
  emailVerified: false,
  email: '',
  showModal: '',
  resendingOtp: false,
  formErrorMessage: '',
  requestInProgress: false,
};

export const SettingsReducer = (state: SettingsStateI, action: PayloadActionI): SettingsStateI => {
  switch (action.type) {
    case 'INIT':
      if (action?.payload?.loggedInManager) {
        if (action?.payload?.loggedInManager?.type === 'P') {
          return {
            ...state,
            secondaryManagers: action?.payload?.orgManagers,
            loggedInManager: action?.payload?.loggedInManager,
            dataLoading: false,
            orgId: action?.payload?.orgId,
            verificationInfo: action?.payload?.verificationInfo,
            type: action?.payload?.type,
            website: action?.payload?.website,
            passwordExists: action?.payload?.passwordExists,
            emailVerified: action?.payload?.emailVerified,
          };
        }
        const primaryManager = action?.payload?.orgManagers.find((item) => item.type === 'P');
        return {
          ...state,
          primaryManager,
          loggedInManager: action?.payload?.loggedInManager,
          dataLoading: false,
          orgId: action?.payload?.orgId,
          verificationInfo: action?.payload?.verificationInfo,
          type: action?.payload?.type,
          website: action?.payload?.website,
          passwordExists: action?.payload?.passwordExists,
          emailVerified: action?.payload?.emailVerified,
        };
      }
      return { ...state, dataLoading: false };

    case 'UPDATESTATE':
      return { ...state, ...action?.payload };
    default: return state;
  }
};
