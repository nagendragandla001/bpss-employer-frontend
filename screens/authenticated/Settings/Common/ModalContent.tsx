import {
  Col, Row, Typography, Space, Form, Input, FormInstance, Alert,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import { OTPRegexPattern } from 'utils/constants';
import ChangePassword from './ChangePassword';
import ForgotPassword from './ForgotPassword';
import SetPassword from './SetPassword';
import {
  EmailInputElement, FirstName, LastName, MobileNoInputElement,
} from './settings';
import { SettingsStateI } from './settingsPageUtils';

const { Text, Paragraph } = Typography;

interface ModalContentI {
  state: SettingsStateI;
  form: FormInstance;
}

const ModalContent = ({ state, form }: ModalContentI): JSX.Element => (
  <>
    {
      state?.showModal === 'changeEmail' && (
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Space direction="vertical" size={4}>
              <Text>Do you want to change your email?</Text>
              <Space direction="horizontal" wrap>
                <Text>Your current email:</Text>
                <Text className="text-bold">{(state?.loggedInManager && state?.loggedInManager.email) || ''}</Text>
              </Space>
            </Space>
          </Col>

          <Col span={24}>
            {EmailInputElement('New Email')}
          </Col>
        </Row>
      )
    }
    {
      ['changeMobileNo', 'addNewMobileNo'].includes(state?.showModal) && (
        <Row gutter={[0, 12]}>
          <Col span={24}>
            {
              state?.showModal === 'addNewMobileNo' ? (
                <Text>Please add your mobile no.</Text>
              ) : (
                <Space direction="vertical" size={4}>
                  <Text>Do you want to change your contact no.?</Text>
                  <Space direction="horizontal">
                    <Text>Current mobile no.:</Text>
                    <Text className="text-bold">{`+91-${(state?.loggedInManager && state?.loggedInManager.mobileNo) || ''}`}</Text>
                  </Space>
                </Space>
              )
            }
          </Col>
          <Col span={24}>
            {MobileNoInputElement('New Mobile no.', true)}
          </Col>
        </Row>
      )
    }
    {
      ['addSecondaryManager', 'changeName'].includes(state?.showModal) && (
        <Row>
          <Col span={24}>
            <FirstName state={state} />
          </Col>
          <Col span={24}>
            <LastName state={state} />
          </Col>
          {
            state?.showModal === 'addSecondaryManager' && (
              <>
                <Col span={24}>
                  {EmailInputElement('Email-ID')}
                </Col>
                <Col span={24}>
                  {MobileNoInputElement('Phone No.', true)}
                </Col>
              </>
            )
          }
        </Row>
      )
    }
    {
      state?.showModal === 'verifyEmail' && (
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Space wrap>
              <Text>We have sent an verification email on:</Text>
              <Text className="text-bold">{state?.loggedInManager?.unverifiedEmail || ''}</Text>
            </Space>
          </Col>
          <Col span={24}>
            <Text>If you haven&apos;t received email, please check your spam folder.</Text>
          </Col>
          <Col span={24}>
            <Text>
              You will continue to receive notifications on this email
              untill you verify the updated email.
            </Text>
          </Col>
        </Row>
      )
    }
    {
      state?.showModal === 'verifyMobileNo' && (
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Space wrap>
              <Text>We have sent a 5 digit OTP to:</Text>
              <Text className="text-bold">{`+91-${state?.loggedInManager?.unverifiedMobileNo || ''}`}</Text>
            </Space>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Enter OTP"
              name="otp"
              validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: 'Please enter the OTP',
                },
                {
                  pattern: OTPRegexPattern,
                  message: 'Please enter a valid 5 digit number sent to your mobile',
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
      )
    }
    {
      state?.showModal === 'mobileNoUpdated' && (
        <Row>
          <Col span={24}>
            <Space wrap>
              <Text>We have successfully updated your mobile no. to</Text>
              <Text className="text-bold">{`+91-${state?.loggedInManager?.mobileNo || ''}`}</Text>
            </Space>
          </Col>
        </Row>
      )
    }
    {
      state?.showModal === 'mobileNoVerified' && (
        <Row>
          <Col span={24}>
            <Space wrap>
              <Text>We have successfully verified your mobile no.</Text>
              <Text className="text-bold">{`+91-${state?.loggedInManager?.mobileNo || ''}`}</Text>
            </Space>
          </Col>
        </Row>
      )
    }
    {
      state?.showModal === 'changePwd' && (
        <ChangePassword form={form} />
      )
    }
    {
      state?.showModal === 'setPwd' && (
        <SetPassword form={form} />
      )
    }
    {
      state?.showModal === 'forgotPassword' && (
        <ForgotPassword form={form} />
      )
    }
    {
      state?.showModal === 'forgotPasswordSuccess' && (
        <Space direction="vertical" size={12}>
          <div className="display-flex flex-justify-content-center">
            <CustomImage
              src="/images/static-pages/login/forgot-password.svg"
              width={42}
              height={48}
              alt="Forgot Password"
            />
          </div>

          <Space direction="horizontal" wrap>
            <Text>We have sent an verification email to</Text>
            <Text className="text-bold">
              {state?.email}
            </Text>
          </Space>
          <Text>Click on the link in email ID to reset the Password.</Text>
          <Text>If you haven&apos;t received email, please check your spam folder.</Text>
        </Space>
      )
    }
    {state?.formErrorMessage ? (
      <Paragraph className="text-small">
        <Alert message={state?.formErrorMessage} type="error" className="text-small" showIcon />
      </Paragraph>
    ) : ''}
  </>
);

export default ModalContent;
