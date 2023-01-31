import {
  Button, Col, Form, Input, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { isUserValid } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { changeMobileNo, subscribeToWhatsApp } from 'service/accounts-settings-service';
import { generateOtp, submitOtp } from 'service/userInfoService';
import { MobileRegexPattern, OTPRegexPattern } from 'utils/constants';

require('components/VerfiyNumberModal/verfiyNumberModal.less');

const { Text } = Typography;

interface PropsInterface{
  verficationModalFor: 'callHr'|'whatsapp';
  userDetails: {mobile: string, id:string, whatsappSubscribed: boolean;};
  closeModal: ()=>void,
  onSuccessHandler: ({ mobileNo: string, whatsappSubscribed: boolean }) => void,
  updateMobileNo: (mobileNo) => void,
}

const MobileVerifyModal = (props: PropsInterface): JSX.Element => {
  const {
    userDetails, verficationModalFor, onSuccessHandler, updateMobileNo,
  } = props;
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [currentModalScreen, setCurrentModalScreen] = useState<'confirmNumberScreen'|'otpVerificationScreen'>('confirmNumberScreen');
  const [whatsAppNotificationsEnabled, setWhatsAppNotificationsEnabled] = useState(true);
  const [newMobileNumber, setNewMobileNumber] = useState(userDetails.mobile);

  const sendOtp = async (resendOtp): Promise<void> => {
    const otpPostObj = {
      reset_code_type: 'A',
    };
    const apiRespone = await generateOtp(props.userDetails.id, otpPostObj, true);
    if (apiRespone) {
      if (resendOtp) {
        setResendSuccess(true);
        setResendingOTP(false);
        setTimeout(() => {
          setResendSuccess(false);
        }, 5000);
      }
    }
  };

  const sendResponseToComponent = ():void => {
    onSuccessHandler(
      { mobileNo: newMobileNumber, whatsappSubscribed: whatsAppNotificationsEnabled },
    );
    props.closeModal();
  };
  const verifyOtpAndSubscribe = async (formData): Promise<void> => {
    const postObj = {
      otp: formData.otp,
      new_mobile: newMobileNumber,
    };
    const apiRespone = await submitOtp(props.userDetails.id, postObj, true);
    if (apiRespone) {
      if (verficationModalFor === 'whatsapp'
      || (verficationModalFor === 'callHr'
      && whatsAppNotificationsEnabled !== userDetails.whatsappSubscribed)) {
        const subscriptionChanged = await subscribeToWhatsApp(
          whatsAppNotificationsEnabled, userDetails.id,
        );
        if (subscriptionChanged) {
          sendResponseToComponent();
        }
      } else {
        sendResponseToComponent();
      }
    }
  };

  const onSubmitHandler = async (formData):Promise<void> => {
    if (currentModalScreen === 'confirmNumberScreen') {
      if (formData.mobileNo.trim() !== newMobileNumber) {
        const apiCall = await changeMobileNo({ new_mobile: formData.mobileNo }, userDetails.id);
        if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
          setNewMobileNumber(formData.mobileNo);
          updateMobileNo(formData.mobileNo);
        }
      } else {
        await sendOtp(false);
      }
      setCurrentModalScreen('otpVerificationScreen');
    } else {
      verifyOtpAndSubscribe(formData);
    }
  };

  const checkForNumberValidity = async (_rule, value:string):Promise<void> => {
    if (value.trim() === userDetails.mobile) return Promise.resolve();
    return isUserValid(_rule, value);
  };

  return (
    <Modal
      visible={!!verficationModalFor}
      width={700}
      title={null}
      onCancel={(): void => {
        if (currentModalScreen !== 'confirmNumberScreen') {
          setCurrentModalScreen('confirmNumberScreen');
        }
        props.closeModal();
      }}
      footer={null}
      className="verifyNumberModal"
      closable={false}
    >
      <Row className="modal-container">
        <Col xs={{ span: 0 }} sm={{ span: 11 }} className="modal-info">
          <Text className="text-white text-large font-bold p-bottom-sm display-block">Verify Phone Number</Text>
          <Text className="text-light-white text-small p-bottom-32 display-block">
            You will need to verify your phone number to receive mobile notifications
          </Text>
          <CustomImage src="/images/whats-app-subscription-modal/desktop-banner.svg" width={208} height={194} alt="banner" />
        </Col>
        <Col xs={{ span: 24 }} sm={{ span: 0 }} className="modal-info modal-info-mobile">
          <Text className="text-white text-large font-bold p-bottom-sm p-right-16">Verify Phone Number</Text>
          <CustomImage src="/images/whats-app-subscription-modal/mobile-banner.svg" width={208} height={194} alt="banner" />
        </Col>
        <Col xs={{ span: 24 }} sm={{ span: 13 }} className="form-wrapper">
          <Row justify="center" align="middle">
            <Col xs={{ span: 24 }} sm={{ span: 0 }}>
              <Text className="text-light-grey text-small text-center p-bottom-32 verify-info ">
                You will need to verify your phone number
                to receive whatsapp notifications
              </Text>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form
                name="VerfiyMobileForm"
                layout="vertical"
                size="large"
                onFinish={onSubmitHandler}
                hideRequiredMark
              >
                {currentModalScreen === 'confirmNumberScreen' ? (
                  <>
                    <Form.Item
                      name="mobileNo"
                      label="Confirm Phone Number"
                      className="p-bottom-24"
                      validateTrigger="onBlur"
                      initialValue={userDetails.mobile}
                      rules={[
                        {
                          required: true,
                          message: 'Please enter mobile number',
                        },
                        {
                          pattern: MobileRegexPattern,
                          message: 'Please enter a valid mobile number',
                        },
                        {
                          validator: checkForNumberValidity,
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Enter Mobile No."
                      />
                    </Form.Item>
                    {/* {verficationModalFor === 'callHr' ? (
                      <Row
                        justify="space-between"
                        align="middle"
                        className="p-bottom-24"
                      >
                        <Col>
                          <Text className="text-drak-purple">
                            Receive Whatsapp notifications
                          </Text>
                        </Col>
                        <Col>
                          <Switch
                            className="whatsapp-toggle-switch"
                            checked={whatsAppNotificationsEnabled}
                            onChange={(value):void => setWhatsAppNotificationsEnabled(value)}
                          />
                        </Col>
                      </Row>
                    ) : null} */}
                  </>
                ) : (
                  <>
                    <Form.Item
                      name="otp"
                      label="Enter OTP"
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
                    {resendSuccess ? (
                      <Row justify="end" align="middle">
                        <Col className="p-y-axis-12">
                          <Text style={{ color: '#136049', padding: '16px 0px' }}>
                            OTP Resent Successfully
                          </Text>
                        </Col>
                      </Row>
                    ) : (
                      <Row justify="end" align="middle">
                        <Col>
                          <Button
                            type="link"
                            onClick={(): void => {
                              setResendingOTP(true);
                              sendOtp(true);
                            }}
                            style={{ padding: '0', color: '#281666' }}
                          >
                            {resendingOTP ? 'Resending...' : 'Resend OTP'}
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </>
                )}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="submit-btn"
                    style={{ width: '100%' }}
                  >
                    {currentModalScreen === 'confirmNumberScreen' ? 'Get OTP' : 'Verify'}
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

export default MobileVerifyModal;
