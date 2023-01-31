import {
  Button, Col, Form, Input, Modal, Row,
} from 'antd';
import { isMobile } from 'mobile-device-detect';
import React, { useEffect, useState } from 'react';
import { generateOtp, submitOtp } from 'service/userInfoService';
import { OTPRegexPattern } from 'utils/constants';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';

require('components/VerfiyNumberModal/verfiyNumberModal.less');

interface PropsInterface{
  modalVisible: boolean;
  UserDetails: any;
  closeModal: ()=>void;
  id:string;
  patchrequest:(string)=>void,

}

const MobileVerifyModal = (props: PropsInterface): JSX.Element => {
  const {
    UserDetails, modalVisible, closeModal, id, patchrequest,
  } = props;
  const [resendSuccess, setResendSuccess] = useState(false);

  const sendOtp = async (firstTime): Promise<void> => {
    const otpPostObj = {
      reset_code_type: 'A',
    };
    const apiRespone = await generateOtp(props.UserDetails.id, otpPostObj, true);
    if (apiRespone && !firstTime) {
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    }
  };
  const onSubmitHandler = async (formData): Promise<void> => {
    const postObj = {
      otp: formData.otp,
      new_mobile: props.UserDetails.mobile,
    };
    const apiRespone = await submitOtp(props.UserDetails.id, postObj, true);
    const response = await apiRespone.data;
    if (apiRespone) {
      const postObject = {
        id,
        share_contact_to_public: true,
        call_poc: {
          name: props.UserDetails.name,
          contact: props.UserDetails.mobile,
        },
      };
      const apiCall = await patchJobChanges(id, postObject);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        patchrequest('success');
        closeModal();
      }
    }
  };
  useEffect(() => {
    sendOtp(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Modal
      visible={modalVisible}
      title={<h4 className="text-large text-bold">Enter OTP</h4>}
      onCancel={closeModal}
      footer={null}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      // className="verifyNumberModal"
    >
      <h3 className="text-left">
        Kindly enter the
        5 digit OTP sent to your mobile number
        {' '}
        <b>
          {' '}
          + 91
          {' '}
          {UserDetails.mobile}
        </b>
      </h3>
      {/* <h3 className="text-center text-bold">
        {UserDetails.mobile}
      </h3> */}
      <Form
        name="VerfiyMobileForm"
        layout="vertical"
        size="large"
        onFinish={onSubmitHandler}
        hideRequiredMark
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
        {resendSuccess ? (
          <Row justify="end" align="middle">
            <Col>
              <p style={{ color: '#389e0d' }}>OTP Resent Successfully</p>
            </Col>
          </Row>
        ) : (
          <Row justify="start" align="middle">
            <Col>
              <Button type="link" onClick={(): Promise<void> => sendOtp(false)} style={{ padding: '0' }}>
                Resend OTP
              </Button>
            </Col>
          </Row>

        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={(): Promise<void> => sendOtp(false)} style={{ width: '100%' }}>
            VERIFY
          </Button>
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default MobileVerifyModal;
