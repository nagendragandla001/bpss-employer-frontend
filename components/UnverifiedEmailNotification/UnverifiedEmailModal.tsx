/* eslint-disable no-nested-ternary */
import {
  Alert, Button, Checkbox, Col, Form, FormInstance, Input, Modal, Row, Typography,
} from 'antd';
import UnverifiedContext from 'components/Context/UnverifiedContext';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import AppConstants from 'constants/constants';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { getSettingPageData, ManagerType } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { changeEmail, changeUserData, getLoggedInUser } from 'service/accounts-settings-service';
import { generateEmailOtp, submitEmailOtp } from 'service/userInfoService';
import { pushClevertapEvent, pushClevertapProfile } from 'utils/clevertap';
import { EmailRegexPattern, OTPRegexPattern } from 'utils/constants';

require('components/UnverifiedEmailNotification/UnverifiedEmailNotification.less');

const { Paragraph, Text } = Typography;

interface StateInterface {
  loggedInManager: ManagerType | null;
  resendInProgress: boolean;
  mobileNo: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  formErrorMessage: string;
}
interface IProps{
  // setEmailState : (boolean) => void;
  state: any;
  setState: (state:any) => void;
  form: FormInstance;
  abTestFlow: string;
}

const UnverifiedEmailModal = (props: IProps): JSX.Element => {
  const {
    // setEmailState,
    state, form, setState, abTestFlow,
  } = props;
  const [userEmail, setUserEmail] = useState('');
  const [currentForm, setCurrentForm] = useState('emailInput');
  const [isEmailFilled, setIsEmailFilled] = useState(false);
  // const abTestFlow = window.localStorage.getItem('GOVariant');
  const verifyStatus = useContext(UnverifiedContext);

  const subtextData = [
    {
      title: 'Post more than 1 job',
    },
    {
      title: 'Recieve important updates via mail',
    },
    {
      title: 'Hire candidates via video interviews  ',
    },
  ];
  // second parameter isResend used to keep a track of resend OTP vs initial OTP
  const generateEmailOTP = async (userID, isResend): Promise<void> => {
    const otpPostObj = {
      reset_code_type: 'EA',
    };
    const apiCall = await generateEmailOtp(
      (userID) || '', otpPostObj, true,
    );
    if (apiCall) {
      if (isResend) {
        pushClevertapEvent('Email Verification', {
          Type: 'Resend OTP',
          Status: 'S',
        });
      } else {
        pushClevertapEvent('Email Verification', {
          Type: 'Email ID submit',
          Status: 'S',
        });
      }
    } else if (isResend) {
      pushClevertapEvent('Email Verification', {
        Type: 'Resend OTP',
        Status: 'F',
      });
    } else {
      pushClevertapEvent('Email Verification', {
        Type: 'Email ID submit',
        Status: 'F',
      });
    }
  };

  const submitEmailOTP = async (formData): Promise<void> => {
    const { emailOTP } = formData;
    const postObj = {
      email: userEmail,
      hash_code: '',
      client_id: config.CLIENT_ID,
      otp: emailOTP,
    };
    const apiCall = await submitEmailOtp(postObj, true);
    if ([200, 201, 202].indexOf(apiCall.status) !== -1) {
      pushClevertapEvent('Email Verification', {
        Type: 'OTP submit',
        Status: 'S',
        Variant: abTestFlow,
      });
      pushClevertapProfile({
        'Email Verified': 'T',
      });
      setState((prevState) => ({
        ...prevState,
        isEmailVerified: true,
      }));
      // setEmailState(false);
      verifyStatus.setEmailVerified(true);
    } else if (apiCall.status === 429) {
      const message = AppConstants.ERRORS.MAX_RETRY_ERR;
      pushClevertapEvent('Email Verification', {
        Type: 'OTP Submit',
        Status: 'F',
        error: message,
        Variant: abTestFlow,
      });
      setState((prevState) => ({
        ...prevState,
        formErrorMessage: message,
      }));
    } else {
      const { message } = (await apiCall.response).data;
      pushClevertapEvent('Email Verification', {
        Type: 'OTP Submit',
        Status: 'F',
        error: message,
        Variant: abTestFlow,
      });
      setState((prevState) => ({
        ...prevState,
        formErrorMessage: message,
      }));
    }
  };

  const resendEmailOTPHandler = async (): Promise<void> => {
    setState((prevState) => ({
      ...prevState,
      resendInProgress: true,
    }));
    await generateEmailOTP(state?.loggedInManager?.id, true);
    setState((prevState) => ({
      ...prevState,
      resendInProgress: false,
    }));
  };

  const getuserData = async (): Promise<void> => {
    const apiCall = await getLoggedInUser();
    const userDetails = await apiCall.data;
    const mobileNo = (await getSettingPageData()).loggedInManager?.mobileNo;
    if (userDetails && userDetails.objects && userDetails.objects.length) {
      setState((prevState) => ({
        ...prevState,
        loggedInManager: userDetails.objects && userDetails.objects[0],
        isEmailVerified: userDetails.objects && userDetails.objects[0].email_verified,
        isMobileVerified: userDetails.objects && userDetails.objects[0].mobile_verified,
      }));
    }
  };

  const onValuesChanged = (formData) => {
    if (!isEmailFilled) {
      pushClevertapEvent('Email Verification', {
        Type: 'Email verification Start',
      });
      setIsEmailFilled(true);
    }
  };

  const updateEmailAddressHandler = (): void => {
    pushClevertapEvent('Email Verification', {
      Type: 'Update Email',
    });
  };

  const emailInputHandler = async (formData): Promise<void> => {
    const { email, emailSubscribedCheckbox } = formData;
    const emailSubscribedPatchObj = {
      id: state.loggedInManager.id,
      email_subscribed: emailSubscribedCheckbox,
    };
    const postObj = {
      new_email: email,
    };
    setUserEmail(email);
    pushClevertapEvent('Email verification', {
      Type: 'Email ID submit',
    });
    const emailSubscribedPatchCall = await changeUserData(emailSubscribedPatchObj);
    const apiCall = await changeEmail(postObj, (state.loggedInManager?.id as string));
    if ([200, 201, 202].includes(apiCall.status)
    && [200, 201, 202].includes(emailSubscribedPatchCall.status)) {
      setCurrentForm('emailVerification');
    }
  };

  const emailInput = (
    <>
      <Form.Item
        name="email"
        label="Enter email address"
        rules={[
          {
            required: true,
            message: 'This Field is required.',
          },
          {
            pattern: EmailRegexPattern,
            message: 'Please enter a valid Email ID!',
          }]}
        className="m-all-0"
      >
        <Input size="large" className="text-base m-all-0" />
      </Form.Item>
      <Form.Item
        name="emailSubscribedCheckbox"
        valuePropName="checked"
        className="m-all-0"
        style={{
          textAlign: 'left',
        }}
      >
        <Checkbox
          checked={state.isEmailSubscribed}
        >
          Receive updates on email
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="full-width modal-action-btn">
          Verify Email
        </Button>
      </Form.Item>
    </>
  );

  const emailVerification = (
    <>
      <Paragraph
        className="modal-action-desc"
      >
        Enter OTP sent to
        {' '}
        <Text strong underline>
          {/* {state?.loggedInManager?.email} */}
          {userEmail}
        </Text>
      </Paragraph>
      <Form.Item
        name="emailOTP"
        rules={[
          {
            required: true,
            message: 'This Field is required.',
          },
          {
            pattern: OTPRegexPattern,
            message: 'Please enter a valid 5 digit number sent to your email',
          }]}
        extra={<Text className="text-small">If you haven&apos;t received email, please check your spam folder.</Text>}
      >
        <Input size="large" placeholder="Enter OTP" className="text-base m-all-0" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="full-width modal-action-btn">
          Verify
        </Button>
        {state?.formErrorMessage ? <Alert message={state?.formErrorMessage} type="error" className="text-small form-error" showIcon /> : <></>}
      </Form.Item>
      <Row justify="center">
        <Col>
          <Row justify="center">
            <Button
              type="text"
              onClick={resendEmailOTPHandler}
              className="p-all-0 m-all-0 modal-otp-btn text-base"
              loading={state?.resendInProgress}
            >
              Resend OTP
            </Button>
          </Row>
          <Row justify="center">
            <Link
              href="/settings"
              as="/employer-zone/settings"
            >
              <Button
                type="text"
                className="modal-otp-btn text-base"
                onClick={updateEmailAddressHandler}
              >
                Update email address
              </Button>
            </Link>
          </Row>
        </Col>
      </Row>
    </>
  );

  return (
    <Modal
      title={null}
      footer={null}
      visible
      closable={false}
      keyboard={false}
      className="unverified-email-modal"
      width="750px"
    >
      <Row align="middle" justify="space-between">
        <Col
          xs={{ span: 24, offset: 0 }}
          md={{ span: 10, offset: 0 }}
          className="modal-section-image"
        >
          <Row gutter={8}>
            <Col xs={{ span: 13, offset: 0 }} md={{ span: 24, offset: 0 }}>
              <Paragraph
                className="unverified-modal-text"
              >
                Verify your email now!
              </Paragraph>
              <Paragraph
                className="unverified-modal-text-2"
              >
                <Col xs={{ span: 20, offset: 0 }} md={{ span: 20, offset: 0 }}>
                  <Text strong>Benefits for you</Text>
                </Col>
              </Paragraph>
              <Row>
                <ul style={{ padding: '0% 10%' }}>
                  {subtextData.map((data) => (
                    <Col>
                      <li
                        style={{
                          color: 'white',
                        }}
                      >
                        <Text type="secondary" className="text-small">
                          {data.title}
                        </Text>
                      </li>
                    </Col>
                  ))}
                </ul>
              </Row>
            </Col>
            <Col xs={{ span: 10, offset: 1 }} md={{ span: 24, offset: 0 }} className="image-center">
              <CustomImage
                src="/images/common/icon-unverified-email.svg"
                alt="Unverified Email"
                className="center-block"
                width={112}
                height={135}
              />
            </Col>
          </Row>
        </Col>
        <Col
          xs={{ span: 24, offset: 0 }}
          md={{ span: 14, offset: 0 }}
          className="modal-section-actions text-center"
        >

          <Form
            name="VerfiyEmailForm"
            form={form}
            layout="vertical"
            size="large"
            onValuesChange={onValuesChanged}
            onFinish={currentForm === 'emailInput' ? emailInputHandler : submitEmailOTP}
            hideRequiredMark
            className="full-width"
            initialValues={{
              emailSubscribedCheckbox: state?.isEmailSubscribed,
            }}
          >
            {currentForm === 'emailInput' ? emailInput : null}
            {currentForm === 'emailVerification' ? emailVerification : null}
          </Form>
        </Col>
      </Row>

    </Modal>
  );
};

export default UnverifiedEmailModal;
