/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable camelcase */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-nested-ternary */
import {
  Alert, Button, Col, Form, Input, Modal, Row, Typography,
} from 'antd';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import { LinksConstants } from 'constants/index';
import Router from 'next/router';
import React, { useState } from 'react';
import { getJobsStats } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { setCookie } from 'service/cookie-manager';
import {
  getUserInfo, initiateResetPasswordAPI, loginViaPassword, recognizeUserAPI,
} from 'service/login-service';
import { getOrgDetails, getOrgPricingStats } from 'service/organization-service';
import { getLatestPricingPlan } from 'utils';
import { pushClevertapEvent, pushClevertapOnUserLogin, pushClevertapProfile } from 'utils/clevertap';
import { EmailRegexPattern } from 'utils/constants';

require('components/StaticPages/Common/LoginModal/LoginModal.component.less');

const { Paragraph, Text } = Typography;

const LoginModal = (props: { modalHandler }): JSX.Element => {
  const [loginForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  // Currently we have 3 screens in login Modal
  // Default screen is main login screen
  // Main Login Screen: login
  // Forgot Password screen: forgotPassword
  // Forgot Password success: forgotPasswordSuccess
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isForgotPasswordInProgress, setForgotPasswordInProgress] = useState(false);
  const [isUserInputEventSent, setUserInputEventSent] = useState(false);
  const [isForgotPasswordFilled, setIsForgotPasswordFilled] = useState(false);

  const formSubmitResponseEvent = (apiError, status = 'NA'): void => {
    const formValues = loginForm.getFieldsValue();
    const formErrors = loginForm.getFieldsError();
    const { email } = formValues;
    let errors: string | {} = 'NA';
    if (!apiError) {
      errors = formErrors && formErrors
        .filter((t) => t.errors.length)
        .map((x) => x.name && x.name[0]);
    } else {
      errors = status === 'success' ? 'NA' : 'Invalid credentials provided';
    }
    pushClevertapEvent('Email login submit', {
      Email: email,
      Status: status === 'success' ? 'S' : 'F',
      Error: errors && errors.toString(),
    });
  };

  const getRedirectRoute = async (): Promise<string> => {
    const defaultRoute = '/employer-zone/jobs/';
    return defaultRoute;
  };

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
      'KYC Status': orgInfo?.verification_info?.status,
      'Org Name': orgInfo?.name,
      'Org Category': orgInfo?.type,
      'Company Location': orgInfo?.city?.name,
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

  // Refactored loginUser to accommodate axios call
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const loginUser = async (postObj) => {
    const apiCall = await loginViaPassword(postObj);
    if ([200, 201, 202].includes(apiCall?.status)) {
      const userData = apiCall?.data;
      const { access_token, jwt } = userData;
      setLoginInProgress(false);
      formSubmitResponseEvent(true, 'success');
      setCookie('access_token', access_token, { path: '/' });
      setCookie('jwt', jwt, {});
      const userAPICall = await getUserInfo(true);
      const orgAPICall = await getOrgDetails();
      if (userAPICall && orgAPICall) {
        await fireClevertapProfilePush(userAPICall, orgAPICall);
      }
      getRedirectRoute().then((route) => {
        Router.push(route);
      });
    } else if (apiCall.response.status === 401) {
      setFormErrorMessage(apiCall?.response?.data?.message);
      setFormErrorMessage(
        apiCall?.response?.message?.login_otp || apiCall?.response?.data?.message,
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

  const onLoginSubmit = (formData): void => {
    setLoginInProgress(true);
    const { email, password } = formData;
    const postData = {
      username: email,
      password,
      client_id: config.CLIENT_ID,
    };
    loginUser(postData);
  };

  const onValuesChanged = (formData): void => {
    // Handle Form Values Changed Here
    if (!isUserInputEventSent) {
      pushClevertapEvent('Email login start');
      setUserInputEventSent(true);
    }
  };

  const forgotPasswordValueChangeHandler = (): void => {
    if (!isForgotPasswordFilled) {
      pushClevertapEvent('Forgot Password', {
        Type: 'email ID start',
      });
      setIsForgotPasswordFilled(true);
    }
  };

  const handleScreenChange: Function = (screen: string) => {
    const email = loginForm.getFieldValue('email');
    if (screen) {
      switch (screen) {
        case 'login':
          setCurrentScreen('login');
          break;
        case 'forgotPassword':
          setCurrentScreen('forgotPassword');
          if (email) { setUserEmail(email); }
          break;
        case 'forgotPasswordSuccess':
          setCurrentScreen('forgotPasswordSuccess');
          if (email) { setUserEmail(email); }
          break;
        default:
          setCurrentScreen('login');
      }
    }
  };

  const handleForgotPassword = (): void => {
    pushClevertapEvent('Forgot Password', {
      Type: 'Forgot Password',
    });
    handleScreenChange('forgotPassword');
  };

  const onLoginSubmitError = (): void => {
    // Handle Errors which are not fixed via form validator
    formSubmitResponseEvent(false);
  };

  const checkExistingUser = async (_rule, value: string): Promise<boolean|void> => {
    if (value && EmailRegexPattern.test(value)) {
      const response = await recognizeUserAPI(value,
        { isForm: true, withAuth: false, errorMessage: '' });
      const userData = await response.data;
      if (userData) {
        if (userData && userData.organization_status === 'O_RJ') {
          throw new Error('Your request for Account has been rejected.');
        } if (userData && userData.user_type) {
          switch (userData.user_type) {
            case 'ER':
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
        throw new Error(response.response.data.message);
      }
    }
    return true;
  };

  // Refactored initiateForgotPassword to accommodate for axios call
  const initiateForgotPassword = (postObj): void => {
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
        setForgotPasswordInProgress(false);
        handleScreenChange('forgotPasswordSuccess');
      } else {
        setForgotPasswordInProgress(false);
      }
    }).catch(() => {
      setForgotPasswordInProgress(false);
    });
  };

  const onForgotPasswordSubmit = (formData): void => {
    setForgotPasswordInProgress(true);
    const postObj = {
      email: formData && formData.fpEmail,
    };
    initiateForgotPassword(postObj);
    pushClevertapEvent('Forgot Password', {
      Type: 'email ID submit',
    });
  };

  return (
    <Modal
      title={null}
      footer={null}
      visible
      onCancel={(): void => props.modalHandler(false)}
      width={420}
      style={{ top: 50, zIndex: 1000 }}
    >
      {/* Main Login Flow */}
      {currentScreen === 'login' ? (
        <Row gutter={0} align="middle" justify="center">
          <Col xs={{ span: 24, offset: 0 }} className="text-center">
            <Paragraph>
              <Text className="h5">Login</Text>
            </Paragraph>
            <Paragraph>
              <Text type="secondary" className="text-small">For Employers only</Text>
            </Paragraph>
          </Col>
          <Col xs={{ span: 20, offset: 0 }}>
            <Form
              name="login"
              form={loginForm}
              onFinish={onLoginSubmit}
              onFinishFailed={onLoginSubmitError}
              layout="vertical"
              hideRequiredMark
              size="large"
              className="login-form"
              onValuesChange={onValuesChanged}
            >
              <Form.Item
                label={(<span className="text-small">Your Email</span>)}
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Please input Email ID!',
                  },
                  {
                    pattern: EmailRegexPattern,
                    message: 'Please input valid Email ID',
                  },
                  {
                    validator: checkExistingUser,
                  },
                ]}
              >
                <Input
                  className="text-base"
                  autoFocus
                  autoComplete="new-password"
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label={(<span className="text-small">Password</span>)}
                name="password"
                rules={[{
                  required: true,
                  message: 'Please provide a password!',
                }, {
                  min: 6,
                  message: 'Password must be atleast 6 characters',
                }]}
              >
                <Input.Password
                  size="large"
                  className="text-base"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Paragraph className="text-center">
                <Button type="link" className="text-small forgot-password-btn" onClick={handleForgotPassword}>
                  Forgot Password?
                </Button>
              </Paragraph>

              {/* Submit */}
              <Form.Item style={{ marginBottom: 10 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className=" full-width text-bold text-base registration-submit-btn"
                  loading={isLoginInProgress}
                >
                  LOG IN
                </Button>
              </Form.Item>

              {formErrorMessage ? (
                <Paragraph className="text-small">
                  <Alert message={formErrorMessage} type="error" className="text-small form-error" showIcon />
                </Paragraph>
              ) : ''}
            </Form>
          </Col>
        </Row>
      ) : ''}

      {/* Forgot Password Flow */}
      {currentScreen === 'forgotPassword' ? (
        <Row gutter={0} align="middle" justify="center">
          <Col xs={{ span: 16, offset: 0 }} className="text-center" style={{ marginTop: 10, marginBottom: 10 }}>
            <Paragraph>
              <Text className="h5">Forgot Password?</Text>
            </Paragraph>
          </Col>
          <Col xs={{ span: 20, offset: 0 }}>
            <Form
              name="forgotPassword"
              form={forgotPasswordForm}
              initialValues={{
                fpEmail: userEmail || '',
              }}
              onValuesChange={forgotPasswordValueChangeHandler}
              onFinish={onForgotPasswordSubmit}
              layout="vertical"
              hideRequiredMark
              size="large"
              className="forgot-password-form"
            >
              <Form.Item
                label={(<span className="text-small">Your Email</span>)}
                name="fpEmail"
                rules={[
                  {
                    required: true,
                    message: 'Please input Email ID!',
                  }, {
                    pattern: EmailRegexPattern,
                    message: 'Please input valid Email ID!',
                  }, {
                    validator: checkExistingUser,
                  },
                ]}
              >
                <Input
                  className="text-base"
                  placeholder="Your Email"
                  autoFocus
                />
              </Form.Item>

              {/* Submit */}
              <Form.Item style={{ marginBottom: 10 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="registration-submit-btn full-width text-semibold text-small"
                  loading={isForgotPasswordInProgress}
                >
                  SUBMIT
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      ) : ''}

      {/* Forgot Password Success */}
      {currentScreen === 'forgotPasswordSuccess' ? (
        <Row gutter={0} align="middle" justify="center">
          <Col xs={{ span: 16, offset: 0 }} className="text-center" style={{ marginTop: 10, marginBottom: 20 }}>
            <Paragraph>
              <Text className="h5">Forgot Password?</Text>
            </Paragraph>
          </Col>
          <Col xs={{ span: 20, offset: 0 }}>
            <Paragraph>
              <div
                className="center-block display-flex flex-justify-content-center"
                style={{ marginTop: 32, marginBottom: 20 }}
              >
                <CustomImage
                  src="/images/static-pages/login/forgot-password.svg"
                  width={42}
                  height={48}
                  alt="Forgot Password"
                  className="img-responsive center-block"
                />
              </div>
            </Paragraph>
            <Paragraph style={{ marginBottom: '15px !important' }}>
              <Text>
                {`We have sent an verification email to ${userEmail}.`}
                <br />
                Click on the link in email ID to reset the Password.
              </Text>
            </Paragraph>
            <br />
            <Paragraph>
              <Text>If you haven&apos;t received email, please check your spam folder.</Text>
            </Paragraph>
          </Col>
        </Row>
      ) : ''}
    </Modal>
  );
};

export default LoginModal;
