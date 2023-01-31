import {
  Button, Col, Form, Input, Row, Typography,
} from 'antd';
import snackBar from 'components/Notifications/index';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import { AppConstants } from 'constants/index';
import Head from 'next/head';
import React, { useState } from 'react';
import router from 'routes';
import { setCookie } from 'service/cookie-manager';
import { resetPassword, resetPasswordPatchObjType } from 'service/login-service';

require('screens/public/PasswordReset/passwordReset.less');

const { Text, Paragraph } = Typography;

type PropsType={
  emailId:string;
  hashCode: string;
}

const EmailVerification = (props:PropsType) :JSX.Element => {
  const { emailId, hashCode } = props;
  const [form] = Form.useForm();
  const [accessToken, setAccessToken] = useState('');
  const validateConfirmPassword = (_rule, value):Promise<void> => {
    const newPwd = form.getFieldValue('newPwd');
    if (value && newPwd !== value) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    return Promise.resolve();
  };
  const showErrorNotification = ():void => snackBar({
    title: 'Some Error Occoured',
    description: 'Try resetting the password again!',
    duration: 8,
    notificationType: 'error',
    placement: 'topRight',
    iconName: '',
  });

  const onFinishHandler = async (formData):Promise<void> => {
    const patchObject:resetPasswordPatchObjType = {
      email: emailId,
      hash_code: hashCode,
      new_password: formData.newPwd,
      client_id: config.CLIENT_ID,
    };
    const apiCall = await resetPassword(patchObject);
    if ([200, 201, 202].indexOf(apiCall.status) !== -1) {
      const response = await apiCall.data;
      if (response.access_token) {
        setAccessToken(response.access_token);
      } else {
        showErrorNotification();
      }
    } else {
      showErrorNotification();
    }
  };

  const loginUser = ():void => {
    setCookie(AppConstants.AUTH_ACCESS_COOKIE_NAME, accessToken, { path: '/' });
    router.Router.push('/employer-zone/jobs');
  };

  return (
    <>
      <Head>
        <title>
          {`Reset Password | ${AppConstants.APP_NAME}`}
        </title>
      </Head>
      <Row className="password-reset-container" align="middle" justify="center">
        {accessToken ? (
          <Col span={22} className="congratulations-container">
            <Paragraph>
              <Text className="title">
                Congratulations!
              </Text>
            </Paragraph>
            <Paragraph>
              <CustomImage
                src="/images/static-pages/login/forgot-password.svg"
                alt="mail-icon"
                className="bottom"
                width={42}
                height={48}
              />
            </Paragraph>
            <Text className="text-medium">
              Your password has been successfully changed
              <br />
              Please login to continue!&nbsp;
              <Button
                type="link"
                className="login-btn"
                onClick={loginUser}
              >
                Click here to Login
              </Button>
            </Text>
          </Col>
        )
          : (
            <Col span={22} className="details-container">
              <Text className="title">Reset Password</Text>
              <Form
                name="passwordResetForm"
                layout="vertical"
                size="large"
                form={form}
                onFinish={onFinishHandler}
                className="password-reset-form"
                hideRequiredMark
                preserve={false}
              >
                <Form.Item
                  label="New Password"
                  name="newPwd"
                  validateTrigger="onBlur"
                  rules={[{
                    required: true,
                    message: 'Please enter the new password',
                  }, {
                    min: 6,
                    message: 'Password should contain atleast 6 characters',
                  },
                  {
                    max: 255,
                    message: 'Password cannot be more than 255 characters',
                  }]}
                >
                  <Input.Password size="large" className="pwd-input" />
                </Form.Item>
                <Form.Item
                  label="Confirm New Password"
                  name="confirmPwd"
                  validateTrigger="onBlur"
                  dependencies={['newPwd']}
                  rules={[{
                    required: true,
                    message: 'Please enter the confirm password',
                  }, {
                    min: 6,
                    message: 'Password should contain atleast 6 characters',
                  },
                  {
                    max: 255,
                    message: 'Password cannot be more than 255 characters',
                  }, {
                    validator: validateConfirmPassword,
                  },
                  ]}
                >
                  <Input.Password size="large" className="pwd-input" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="submit-btn"> Submit</Button>
                </Form.Item>
              </Form>
            </Col>
          )}
      </Row>
    </>
  );
};

export default EmailVerification;
