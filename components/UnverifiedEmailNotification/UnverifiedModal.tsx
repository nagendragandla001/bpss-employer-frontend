/* eslint-disable no-nested-ternary */
import { Form } from 'antd';
import UnverifiedContext from 'components/Context/UnverifiedContext';
import UnverifiedEmailModal from 'components/UnverifiedEmailNotification/UnverifiedEmailModal';
import React, { useContext, useEffect, useState } from 'react';
import { getSettingPageData, ManagerType } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { getLoggedInUser } from 'service/accounts-settings-service';
import UnverifiedMobileModal from 'components/UnverifiedEmailNotification/UnverifiedMobileModal';

require('components/UnverifiedEmailNotification/UnverifiedEmailNotification.less');

interface StateInterface {
  loggedInManager: ManagerType | null;
  resendInProgress: boolean;
  mobileNo: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  formErrorMessage: string;
  isEmailSubscribed: boolean;
}
interface IProps{
  isEmailModalVisible: boolean;
}

const UnverifiedModal = (props: IProps): JSX.Element|null => {
  const { isEmailModalVisible } = props;
  const [form] = Form.useForm();
  const [state, setState] = useState<StateInterface>({
    loggedInManager: null,
    resendInProgress: false,
    mobileNo: '',
    isEmailVerified: true,
    isMobileVerified: true,
    formErrorMessage: '',
    isEmailSubscribed: false,
  });
  const [abTestFlow, setABTestFlow] = useState('');
  const verifyStatus = useContext(UnverifiedContext);

  const getuserData = async (): Promise<void> => {
    const apiCall = await getLoggedInUser();
    const userDetails = await apiCall.data;
    const mobileNo = (await getSettingPageData()).loggedInManager?.mobileNo;
    if (userDetails && userDetails.objects && userDetails.objects.length && mobileNo?.length) {
      // if (!userDetails.objects[0].mobile_verified) {
      //   generateOTP(userDetails.objects[0].id, false);
      // }
      // if (userDetails.objects[0].mobile_verified && !userDetails?.objects?.[0]?.email_verified) {
      //   generateEmailOTP(userDetails.objects[0].id, false);
      // }
      if (userDetails && userDetails.objects && userDetails.objects.length) {
        setState((prevState) => ({
          ...prevState,
          loggedInManager: userDetails.objects && userDetails.objects[0],
          mobileNo,
          isEmailVerified: userDetails.objects && userDetails.objects[0]?.email_verified,
          isMobileVerified: userDetails.objects && userDetails.objects[0]?.mobile_verified,
          isEmailSubscribed: userDetails.objects && userDetails.objects[0]?.email_subscribed,
        }));
      }
    }
  };

  useEffect(() => {
    getuserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    !(state.isMobileVerified && state.isEmailVerified)
      ? (
        !state.isMobileVerified
          ? (
            <UnverifiedMobileModal
              state={state}
              setState={setState}
              form={form}
              abTestFlow={abTestFlow}
            />
          )
          : (
            <UnverifiedEmailModal
              state={state}
              setState={setState}
              form={form}
              abTestFlow={abTestFlow}
            />
          )
      )
      : null
  );
};

export default UnverifiedModal;
