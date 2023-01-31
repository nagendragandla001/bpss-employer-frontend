/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable prefer-promise-reject-errors */
import { InfoCircleFilled } from '@ant-design/icons';
import {
  Alert,
  Button,
  Form, Input, Row, Space, Tooltip, Typography,
} from 'antd';
import LoginModal from 'components/StaticPages/Common/LoginModal/LoginModal.component';
import config from 'config';
import { LinksConstants } from 'constants/index';
import Router from 'next/router';
import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import { getJobsStats } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { setCookie } from 'service/cookie-manager';
import {
  getUserInfo, recognizeUserAPI,
} from 'service/login-service';
import { getOrgPricingStats, getUnifiedOrgDetails } from 'service/organization-service';
import { generateOtp, otpRegistration, submitLoginOtp } from 'service/userInfoService';
import { getLatestPricingPlan } from 'utils';
import { logEvent, logGtagEvent } from 'utils/analytics';
import { getMarketingSource } from 'utils/browser-utils';
import { pushClevertapEvent, pushClevertapOnUserLogin, pushClevertapProfile } from 'utils/clevertap';
import { getManagerType } from 'utils/common-utils';
import {
  MobileRegexNewPattern, MobileRegexPattern,
  OTPRegexPattern,
} from 'utils/constants';

const { Text, Paragraph, Title } = Typography;

const RegistrationFormComponent: React.FunctionComponent = () => {
  const [registerForm] = Form.useForm();
  const [userId, setUserId] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [isUserInputEventSent, setUserInputEventSent] = useState(false);
  // state variable to keep track of screen
  // options:
  // getOTP for first form
  // setOTP for second form
  const [currentForm, setCurrentForm] = useState('getOTP');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const [disableResendOTP, setDisableResendOTP] = useState({
    disableFlag: false,
    disableCounter: 0,
  });

  // Push Clevertap Profile event as soon as user is logged in
  const fireClevertapProfilePush = async (userData, orgData): Promise<void> => {
    const userInfo = userData?.data?.objects[0];
    const orgInfo = orgData?.data?.objects[0]?._source;
    const pricingPlanApi = await getOrgPricingStats(orgInfo?.id);
    const jobStats = await getJobsStats(orgInfo?.id);
    const pricingPlan = getLatestPricingPlan(
      pricingPlanApi?.data?.pricing_stats?.plan_wise_pricing_stats,
    );
    pushClevertapOnUserLogin({
      Name: `${userInfo?.first_name} ${userInfo?.last_name}`,
      Identity: userInfo?.id,
      Email: userInfo?.email,
      Phone: `+91${userInfo?.mobile}`,
    });
    pushClevertapProfile({
      'Org Status': orgInfo?.status,
      'Org Name': orgInfo?.name,
      'Org Category': orgInfo?.type,
      'KYC Status': orgInfo?.verification_info?.status,
      // 'Company Location': orgInfo?.city?.name,
      'Email Verified': userInfo?.email_verified === true ? 'T' : 'F',
      'Mobile Verified': userInfo?.mobile_verified === true ? 'T' : 'F',
      'Email Subscribed': userInfo?.email_subscribed === true ? 'T' : 'F',
      'User ID': userInfo?.id,
      orgId: orgInfo?.id,
      pricingPlan,
      openJobs: jobStats?.open,
      unapprovedJobs: jobStats?.unapproved,
      pausedJobs: jobStats?.paused,
      closedJobs: jobStats?.closed,
      draftJobs: jobStats?.drafts,
    });
  };

  const formSubmitResponseEvent = (apiError, status = 'NA', managerType = 'NA'): void => {
    const formValues = registerForm.getFieldsValue();
    const formErrors = registerForm.getFieldsError();
    const { mobile } = formValues;
    let errors: string | {} = 'NA';
    if (!apiError) {
      errors = formErrors && formErrors
        .filter((t) => t.errors.length)
        .map((x) => x.name && x.name[0]);
    } else {
      errors = status === 'success' ? 'NA' : 'Invalid credentials provided';
    }
    pushClevertapEvent('Submit OTP', {
      Mobile: mobile,
      Status: status === 'success' ? 'S' : 'F',
      Error: errors && errors.toString(),
      managerType,
    });
  };

  const getRedirectRoute = async (): Promise<string> => {
    const defaultRoute = '/employer-zone/jobs/';
    return defaultRoute;
  };

  const registerEmployer = async (mobile) => {
    const marketing_source = getMarketingSource();
    const postObj = {
      marketing_source,
      user_type: 'ER',
      mobile,
    };
    const apiCall = await otpRegistration(postObj, false);
    const userID = apiCall?.data?.id;
  };

  const checkUser = async (_rule, value): Promise<boolean|void> => {
    if (value && MobileRegexNewPattern.test(value)) {
      const response = await recognizeUserAPI(value,
        { withAuth: false, isForm: true, errorMessage: '' });
      const userData = await response?.data;
      if (userData) {
        if (userData && userData.organization_status === 'O_RJ') {
          throw new Error('Your request for Account has been rejected.');
        } if (userData && userData.user_type) {
          switch (userData.user_type) {
            case 'ER':
              setUserId(userData?.id as string);
              return Promise.resolve();
            case 'CA':
              return Promise.reject(
                <>
                  You already have an account with us as Candidate.&nbsp;
                  <a href={LinksConstants.AJ_URL} rel="noopener noreferrer" target="_blank">
                    Login as candidate
                  </a>
                </>,
              );
            case 'P':
              throw new Error('You seem to be our Partner.');
            case 'PA':
              throw new Error('You seem to have an Agency account with us.');
            default:
              throw new Error('Some Error Occured');
          }
        } else {
          if (userData && userData.code === 404) {
            throw new Error('You do not have an account with us. Please register.');
          }
          throw new Error('Some Error Occured. Please try again after some time.');
        }
      } else {
        setIsNewUser(true);
        registerEmployer(value);
        // throw new Error('No user exists with this mobile number');
      }
    }
    return true;
  };

  const disableCounter = async (): Promise<void> => {
    setDisableResendOTP((prev) => ({
      ...prev,
      disableFlag: true,
    }));
    let counter = 0;
    const myInterval = setInterval(() => {
      counter += 1;
      setDisableResendOTP((prev) => ({
        ...prev,
        disableCounter: counter,
      }));
      if (counter === 30) {
        setDisableResendOTP((prev) => ({
          ...prev,
          disableFlag: false,
          disableCounter: 0,
        }));
        clearInterval(myInterval);
      }
    }, 1000);
  };

  const mobileOTPgenerator = async (formData): Promise<void> => {
    const { mobile } = formData;
    const postObj = {
      reset_code_type: 'L',
    };
    const apiCall = await generateOtp(userId, postObj, false);
    if ([200, 201, 202].includes(apiCall.status)) {
      // setUserMobile(fpMobile);
      // setCurrentScreen('mobileLoginOtpInput');
      pushClevertapEvent('Resend OTP');

      await disableCounter();
    }
  };

  const passwordLoginHandler = ():void => {
    setEmailModalVisible(true);
    pushClevertapEvent('Email Login');
  };

  const getOTPHandler = async (formData):Promise<void> => {
    const { mobile } = formData;
    const postObj = {
      reset_code_type: 'L',
    };

    const apiCall = await generateOtp(userId, postObj, false);
    if ([200, 201, 202].includes(apiCall.status)) {
      pushClevertapEvent('Send OTP', {
        status: 'success',
        type: (isNewUser ? 'Registration' : 'Login'),
      });
      setCurrentForm('setOTP');
      await disableCounter();
    } else {
      pushClevertapEvent('Send OTP', {
        status: 'failure',
        type: (isNewUser ? 'Registration' : 'Login'),
      });
    }
  };

  const loginHandler = async (formData) => {
    const { mobile, mobileOTP } = formData;
    // setLoginInProgress(true);
    const postObj = {
      mobile,
      otp: mobileOTP,
      client_id: config.CLIENT_ID,
    };
    const apiCall = await submitLoginOtp(postObj);
    if ([200, 201, 202].includes(apiCall?.status)) {
      const userData = apiCall?.data;
      const { access_token, jwt } = userData;
      // setLoginInProgress(false);
      setCookie('access_token', access_token, { path: '/' });
      setCookie('jwt', jwt, {});
      const userAPICall = await getUserInfo(true);
      const orgAPICall = await getUnifiedOrgDetails();
      if (userAPICall && orgAPICall.status === 200) {
        const managerType = getManagerType(orgAPICall?.data?.objects?.[0]?._source?.managers,
          userAPICall?.data?.objects?.[0]?.id);
        formSubmitResponseEvent(true, 'success', managerType);
        await fireClevertapProfilePush(userAPICall, orgAPICall);
        getRedirectRoute().then((route) => {
          Router.push(route);
        });
      } else if (orgAPICall.response.status === 404) {
        const trackObj = {
          category: 'registration',
          action: 'submit',
          label: 'success',
        };
        logEvent(trackObj);
        formSubmitResponseEvent(true, 'success');
        logGtagEvent('registration_success');
        window.localStorage.setItem('new_user', '1');
        Router.push('/employer-zone/job-posting/add/new/');
      }
    } else if ([400, 401].includes(apiCall.response.status)) {
      setFormErrorMessage(apiCall?.response?.data?.message?.login_otp);
      setFormErrorMessage(
        apiCall?.response?.data?.message?.login_otp || apiCall?.response?.data?.message,
      );
      formSubmitResponseEvent(true);
      setLoginInProgress(false);
    } else {
      setFormErrorMessage(
        apiCall?.response?.data?.message?.login_otp || apiCall?.response?.data?.message,
      );
      setLoginInProgress(false);
    }
  };

  const onValuesChanged = (): void => {
    // Handle Form Values Changed Here
    if (!isUserInputEventSent) {
      pushClevertapEvent('Mobile Start');
      setUserInputEventSent(true);
    }
  };

  const getOTPScreen = (
    <>
      <Form.Item
        label={(
          <Space>
            <Text>Mobile Number</Text>
            <Tooltip title="This mobile will need to be verified to post a job.">
              <InfoCircleFilled style={{ color: '#1B2D93' }} />
            </Tooltip>
          </Space>
        )}
        required={false}
        name="mobile"
        rules={[{
          pattern: MobileRegexPattern,
          message: 'Please input valid mobile number!',
        }, {
          required: true,
          message: 'Please input mobile number!',
        }, {
          validator: checkUser,
        }]}
        style={{ marginTop: '20px' }}
      >
        <Input className="text-base mobile-input" prefix="+91" placeholder="7417185512" />
      </Form.Item>
      <Form.Item style={{ margin: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          className="br-8"
          block
        >
          Get OTP
        </Button>
      </Form.Item>
    </>
  );

  const setOTPScreen = (
    <>
      <Form.Item
        label={(
          <Space>
            <Text>Mobile Number</Text>
            <Tooltip title="This mobile will need to be verified to post a job.">
              <InfoCircleFilled style={{ color: '#1B2D93' }} />
            </Tooltip>
          </Space>
        )}
        required={false}
        name="mobile"
        rules={[{
          pattern: MobileRegexPattern,
          message: 'Please input valid mobile number!',
        }, {
          required: true,
          message: 'Please input mobile number!',
        }, {
        // validator: isUserValid,
        }]}
        style={{ marginTop: '20px' }}
      >
        <Input className="text-base  mobile-input" prefix="+91" placeholder="7417185512" />
      </Form.Item>
      <Form.Item
        label={(<Text>OTP (One Time Password)</Text>)}
        // name="fpEmail"
        name="mobileOTP"
        required={false}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            message: 'Please input OTP!',
          }, {
            pattern: OTPRegexPattern,
            message: 'Please input valid OTP!',
          },
        ]}
      >
        <OtpInput
          numInputs={5}
          inputStyle="otp-input"
        />

      </Form.Item>
      <Row>
        <Text>
          Didn&apos;t receive an OTP?
          {' '}
          <Button
            type="link"
            className="text-bold p-all-0"
            onClick={mobileOTPgenerator}
            disabled={disableResendOTP.disableFlag}
          >
            Resend OTP
          </Button>
          <Text>
            {' '}
            {disableResendOTP.disableCounter === 0 || `(${30 - disableResendOTP.disableCounter}s)`}
          </Text>
        </Text>

      </Row>
      <br />
      <Form.Item
        style={{ margin: 0 }}
      >
        <Button
          type="primary"
          htmlType="submit"
          className="br-8"
          block
        >
          Submit
        </Button>
      </Form.Item>
      {formErrorMessage ? (
        <Paragraph className="text-small otp-warning">
          <Alert message={formErrorMessage} type="error" className="text-small form-error" showIcon />
        </Paragraph>
      ) : ''}
    </>
  );
  return (
    <>
      <Form
        form={registerForm}
        className="unified-form"
        layout="vertical"
        onFinish={currentForm === 'getOTP' ? getOTPHandler : loginHandler}
        onValuesChange={onValuesChanged}
      >
        {currentForm === 'getOTP' ? getOTPScreen : setOTPScreen}
        <Text>
          Existing user?
          <Button
            type="link"
            className="text-bold p-all-12"
            onClick={passwordLoginHandler}
          >
            Login using password

          </Button>
        </Text>
      </Form>

      {emailModalVisible ? <LoginModal modalHandler={setEmailModalVisible} /> : ''}
    </>
  );
};

export default RegistrationFormComponent;
