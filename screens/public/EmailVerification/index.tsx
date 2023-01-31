import React from 'react';
import {
  Row, Col, Typography, Button,
} from 'antd';
import router from 'next/router';
import { resendEmailAPI } from 'service/login-service';
import snackBar from 'components/Notifications/index';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/public/EmailVerification/emailVerification.less');

const { Text } = Typography;

type PropsType={
  email:string;
  userId:string;
  status: string;
  hashCode: string;
}

const EmailVerification = (props:PropsType) :JSX.Element => {
  const {
    status, email, userId, hashCode,
  } = props;

  const resendVerificationLink = async ():Promise<void> => {
    const postObj = { new_email: email };
    const apiCall = await resendEmailAPI(userId, postObj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      snackBar({
        title: 'Email Sent Successfully!!',
        description: `Email has been successfully sent to ${email}.It might take upto 30 seconds to reflect in your email account`,
        duration: 8,
        notificationType: 'success',
        placement: 'topRight',
        iconName: '',
      });
    } else {
      snackBar({
        title: 'Some Error Occured!!',
        description: `Due to some Internal Error. Email was not sent to ${email}. We recommend you to try again after some time!`,
        duration: 0,
        notificationType: 'error',
        placement: 'topRight',
        iconName: '',
      });
    }
  };

  const retryVerification = ():void => {
    router.push(`/verify/email/?username=${email}&hash_code=${hashCode}`);
  };
  return (
    <Row className="email-verification-container">
      <Col lg={{ span: 12 }} className="details-container">
        <CustomImage
          src={`/images/static-pages/email-verification/${status === 'expired' ? 'email-link-expired' : 'email-link-expired'}.svg`}
          alt={status === 'expired' ? 'email link expired' : 'email verification failed'}
          className="p-top-sm"
          width={75}
          height={82}
        />
        <Text className="verification-status">
          {status === 'expired'
            ? `The email verification link sent to ${email} has expired.`
            : 'We were not able to verify your email ☹️'}
        </Text>
        <Text className="p-top-8">
          {status === 'failed' ? 'Please try again later' : ''}
        </Text>
        {status === 'expired' ? (
          <Button
            onClick={resendVerificationLink}
            className="resend-button"
          >
            Re-send Verification Link
          </Button>
        ) : (
          <Button
            onClick={retryVerification}
            className="resend-button"
          >
            Retry
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default EmailVerification;
