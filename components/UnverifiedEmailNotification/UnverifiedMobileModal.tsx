import {
  Alert,
  Button,
  Col, Form, FormInstance, Input, Modal, Progress, Row, Typography,
} from 'antd';
import UnverifiedContext from 'components/Context/UnverifiedContext';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import Link from 'next/link';
import React, { useContext, useEffect } from 'react';
import { generateOtp, submitOtp } from 'service/userInfoService';
import { pushClevertapEvent, pushClevertapProfile } from 'utils/clevertap';
import { OTPRegexPattern } from 'utils/constants';

const { Text, Paragraph } = Typography;

interface IProps{
  state: any;
  setState: (state:any) => void;
  form: FormInstance;
  abTestFlow: string;
}

const UnverifiedMobileModal = (props: IProps): JSX.Element => {
  const {
    state, form, setState, abTestFlow,
  } = props;

  const verifyStatus = useContext(UnverifiedContext);

  const submitOTP = async (formData): Promise<void> => {
    const { otp } = formData;
    if (otp) {
      setState((prevState) => ({
        ...prevState,
        formErrorMessage: '',
      }));
      const postObj = {
        otp,
        new_mobile: (state && state.mobileNo) || '',
      };
      const apiCall = await submitOtp((state.loggedInManager && state.loggedInManager.id) || '', postObj, true);
      if ([200, 201, 202].indexOf(apiCall.status) !== -1) {
        pushClevertapEvent('Verify mobile', {
          Type: 'Verify',
          Status: 'S',
          Variant: abTestFlow,
        });
        pushClevertapProfile({
          'Mobile Verified': 'T',
        });
        setState((prevState) => ({
          ...prevState,
          isMobileVerified: true,
        }));
        verifyStatus.setMobileVerified(true);
        // if (isEmailModalVisible && !state.isEmailVerified) {
        if (!state.isEmailVerified) {
          //   generateEmailOTP(state?.loggedInManager?.id, false);
        }
      } else if (await apiCall.response.status === 429) {
        const message = AppConstants.ERRORS.MAX_RETRY_ERR;
        pushClevertapEvent('Verify mobile', {
          Type: 'Verify',
          Status: message,
          Variant: abTestFlow,
        });
        setState((prevState) => ({
          ...prevState,
          formErrorMessage: message,
        }));
      } else {
        const { message } = (await apiCall.response).data;
        pushClevertapEvent('Verify mobile', {
          Type: 'Verify',
          Status: message,
          Variant: abTestFlow,
        });
        setState((prevState) => ({
          ...prevState,
          formErrorMessage: message,
        }));
      }
    }
  };
  const generateOTP = async (userID, isResend): Promise<void> => {
    const otpPostObj = {
      reset_code_type: 'A',
    };
    const apiCall = await generateOtp(
      (userID) || '', otpPostObj, true,
    );
    if (apiCall) {
      if (isResend) {
        pushClevertapEvent('Verify mobile', {
          Type: 'Resend OTP',
          Status: 'S',
        });
      } else {
        pushClevertapEvent('Verify mobile', {
          Type: 'Popup load',
          Status: 'S',
        });
      }
    } else if (isResend) {
      pushClevertapEvent('Verify mobile', {
        Type: 'Resend OTP',
        Status: 'F',
      });
    } else {
      pushClevertapEvent('Verify mobile', {
        Type: 'Popup load',
        Status: 'F',
      });
    }
  };

  const mobileResendOTPHandler = async (): Promise<void> => {
    setState((prevState) => ({
      ...prevState,
      resendInProgress: true,
    }));
    await generateOTP(state?.loggedInManager?.id, true);
    setState((prevState) => ({
      ...prevState,
      resendInProgress: false,
    }));
  };

  useEffect(() => {
    generateOTP(state?.loggedInManager?.id, false);
  }, []);

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
          <Row gutter={[16, 40]} align="middle">
            <Col xs={{ span: 12, offset: 0 }} md={{ span: 24, offset: 0 }}>
              <Paragraph
                className="unverified-modal-text"
              >
                Verify your mobile now!
              </Paragraph>

              <br />
              <Row align="middle" justify="start">
                <Col xs={{ span: 20, offset: 0 }} md={{ span: 20, offset: 0 }}>
                  <Progress percent={50} showInfo={false} status="active" trailColor="#525252" strokeColor="#566688" />
                </Col>
              </Row>
            </Col>
            <Col xs={{ span: 12, offset: 0 }} md={{ span: 24, offset: 0 }}>
              <CustomImage
                src="/images/common/icon-unverified-mobile.svg"
                alt="Unverified Mobile Number"
                className="center-block"
                width={208}
                height={188}
              />
            </Col>
          </Row>
        </Col>
        <Col
          xs={{ span: 24, offset: 0 }}
          md={{ span: 14, offset: 0 }}
          className="modal-section-actions text-center"
        >
          <Paragraph
            className="modal-action-desc"
          >
            Enter OTP sent to
            {' '}
            <Text strong>
              +91
              {state?.mobileNo}
            </Text>
          </Paragraph>
          <Form
            name="VerfiyMobileForm"
            form={form}
            layout="vertical"
            size="large"
            onFinish={submitOTP}
            hideRequiredMark
            className="full-width"
          >
            <Form.Item
              name="otp"
              rules={[
                {
                  required: true,
                  message: 'This Field is required.',
                },
                {
                  pattern: OTPRegexPattern,
                  message: 'Please enter a valid 5 digit number sent to your mobile',
                }]}
            >
              <Input size="large" placeholder="Enter OTP" className="text-base" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={submitOTP} className="full-width modal-action-btn">
                Verify
              </Button>
              {state?.formErrorMessage ? <Alert message={state?.formErrorMessage} type="error" className="text-small form-error" showIcon /> : <></>}
            </Form.Item>
          </Form>

          <Row justify="end">
            <Col>
              <Row justify="end">
                <Button
                  type="link"
                  onClick={mobileResendOTPHandler}
                  className="p-all-0 m-all-0"
                  loading={state?.resendInProgress}
                >
                  Resend OTP
                </Button>
              </Row>
              <Row justify="end">
                <Link
                  href="/settings"
                  as="/employer-zone/settings"
                >
                  <Button
                    type="link"
                    className="p-all-0 m-all-0"
                    onClick={(): void => pushClevertapEvent('Verify mobile', {
                      Type: 'Update Mobile',
                    })}
                  >
                    Update Phone Number
                  </Button>
                </Link>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

export default UnverifiedMobileModal;
