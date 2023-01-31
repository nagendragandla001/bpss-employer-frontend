import {
  Button, Col, notification, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import AppConstants from 'constants/constants';
import { useRouter } from 'next/router';
import React from 'react';
import HeadComponent from 'screens/public/EmployerRegistrationSuccess/HeadComponent';
import { resendEmailAPI } from 'service/login-service';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import snackBar from 'components/Notifications';

require('screens/public/EmployerRegistrationSuccess/EmployerRegistrationSuccess.component.less');

const { Paragraph } = Typography;

notification.config({
  placement: 'topRight',
  duration: 5,
});

const EmployerRegistrationSuccessComponent = (): JSX.Element => {
  const router = useRouter();
  const { query: { email, uid: userID } } = router;

  // Hooks Initialization
  const [genericemail, setgenericemail] = React.useState(false);

  React.useEffect(() => {
    if (email) {
      if (email.indexOf('gmail.com') !== -1 || email.indexOf('yahoo.co.in') !== -1 || email.indexOf('yahoo.com') !== -1 || email.indexOf('outlook.com') !== -1) {
        setgenericemail(true);
      } else { setgenericemail(false); }
    }
  }, [email]);

  const resendEmail = (): void => {
    const postObj = { new_email: email };
    resendEmailAPI(userID, postObj).then((response) => {
      if ([200, 201, 202].indexOf(response.status) > -1) {
        const resData = response.data;
        resData.then(() => {
          snackBar({
            title: 'Email Sent Successfully!!',
            description: `Email has been successfully sent to ${email}.It might take upto 30 seconds to reflect in your email account`,
            iconName: '',
            notificationType: 'success',
            placement: 'topRight',
            duration: 5,
          });
        });
      }
    }).catch(() => {
      snackBar({
        title: 'Some Error Occured!',
        description: `Due to some Internal Error. Email was not sent to ${email}. We recommend you to try again after some time!`,
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
    });
  };

  const handleOnSubmit = (): void => {
    resendEmail();
    pushClevertapEvent('Resend verification mail', { Type: 'registration_flow' });
  };

  let verificationLink: string;

  const check = (): string => {
    if (email) {
      if (email.indexOf('gmail.com') !== -1) {
        verificationLink = `https://mail.google.com/mail/u/0/#search/from%3${AppConstants.APP_NAME}+in%3Aanywhere`;
      } else if (email.indexOf('yahoo.com') !== -1 || email.indexOf('yahoo.co.in') !== -1) {
        verificationLink = ' https://mail.yahoo.com/d/folders/1?.intl=in&.lang=en-IN';
      } else if (email.indexOf('outlook.com') !== -1) {
        verificationLink = ' https://outlook.live.com/mail/0/inbox';
      }
    }
    return verificationLink;
  };
  return (
    <>
      <HeadComponent />
      <Row gutter={0} className="employer-registration-success banner">
        <Container>
          <Row gutter={0} align="middle" justify="center">
            <Col xs={{ span: 22, offset: 0 }} md={{ span: 24, offset: 0 }} className="text-center">
              <Paragraph className="text-medium text-block-2">
                To start posting your first job, verify your email ID
              </Paragraph>
              <Paragraph className="text-medium font-bold text-block-3">
                { email }
              </Paragraph>
              <Paragraph className="h5 text-block-1">
                {genericemail ? (
                  <Button
                    href={check()}
                    target="_blank"
                    className="check-inbox-btn"
                    onClick={(): void => pushClevertapEvent('Check inbox', { Type: 'registration_flow' })}
                  >
                    Go to your inbox
                  </Button>
                ) : null}
              </Paragraph>
              <Paragraph className="text-small text-block-4">
                Can’t find your verification email? Check your Spam folder
              </Paragraph>
            </Col>
          </Row>
          <Row gutter={0} align="middle" justify="center">
            <Col xs={{ span: 20, offset: 0 }} md={{ span: 24, offset: 0 }} className="text-center">
              <CustomImage
                src="/images/static-pages/registration-success/employer-registration-success-1.png"
                alt="Check Updated Folder on Gmail"
                className="center-block img-block-1"
                layout
              />
            </Col>
            <Col className="text-center">
              <Paragraph className="text-base text-block-6">
                Haven&apos;t received the verification email yet?
              </Paragraph>
              <Paragraph className="text-medium text-block-7">
                <Button type="default" htmlType="submit" className="warning-btn text-medium text-base" onClick={handleOnSubmit}>
                  Resend
                </Button>
              </Paragraph>
            </Col>
          </Row>
        </Container>
      </Row>
    </>
  );
};

export default EmployerRegistrationSuccessComponent;
