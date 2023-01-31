import {
  Button, Col, Row, Typography,
} from 'antd';
import UnverifiedModal from 'components/UnverifiedEmailNotification/UnverifiedModal';
import React, { useEffect, useState, useContext } from 'react';
import RouterObject from 'routes';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { insertSpaces, pushClevertapEvent } from 'utils/clevertap';
import { isMobile } from 'mobile-device-detect';
import UnverifiedContext from 'components/Context/UnverifiedContext';
import snackBar from 'components/Notifications';

require('components/UnverifiedEmailNotification/UnverifiedEmailNotification.less');

const { Paragraph, Text } = Typography;
// eslint-disable-next-line camelcase
interface IUserDataInterface {
  email: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  mobile: string|null;
}

const getCurrentPage = (): string => {
  const match = RouterObject.match(window.location.href);
  const currPage = match.route
    ? (insertSpaces(match.route.name))
    : null;
  return currPage || 'NA';
};

const UnverifiedEmailNotification = (): JSX.Element => {
  // const abTestFlow = window.localStorage.getItem('GOVariant');
  const [isModalVisible, setModalVisibility] = useState(false);
  const mobileMenu = !!isMobile;
  const verifyStatus = useContext(UnverifiedContext);
  // eslint-disable-next-line camelcase
  // eslint-disable-next-line max-len
  const [userData, setUserData] = useState<IUserDataInterface>({
    email: '', emailVerified: true, mobileVerified: true, mobile: verifyStatus.mobile,
  });

  const openVerificationModal = (): void => {
    if (userData?.mobile === null) {
      snackBar({
        title: 'Mobile Number does not exist',
        description: 'Please provide a mobile number before verification',
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
    } else {
      setModalVisibility(true);
    }
    pushClevertapEvent('Special Click', {
      Type: 'Verify contact',
    });
  };

  useEffect(() => {
    getCurrentPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!verifyStatus.contextInitialized) {
      const getuserData = async (): Promise<void> => {
        const apiCall = await getLoggedInUser();
        const userDetails = await apiCall?.data;

        const currentPage = getCurrentPage();
        if (userDetails?.objects?.length) {
          verifyStatus.setEmailVerified(userDetails?.objects[0]?.email_verified);
          verifyStatus.setMobileVerified(userDetails?.objects[0]?.mobile_verified);
          verifyStatus.setMobile(userDetails?.objects[0]?.mobile);
          setUserData({
            email: userDetails?.objects[0]?.email,
            emailVerified: userDetails?.objects[0]?.email_verified,
            mobileVerified: userDetails?.objects[0]?.mobile_verified,
            mobile: userDetails?.objects[0]?.mobile,
          });
          if (!userDetails?.objects[0]?.email_verified) {
            if (currentPage && currentPage === 'Job Details') {
              setModalVisibility(true);
              pushClevertapEvent('Verify popup Load');
            }
          }
        }
      };
      verifyStatus.setContextInitialized(true);
      getuserData();
    }
  }, [verifyStatus]);

  useEffect(() => ():void => {
    setModalVisibility(false);
  }, []);

  return (
    <>
      {(verifyStatus && !(verifyStatus.mobileVerified && verifyStatus.emailVerified)) ? (
        <Row align="middle" justify="space-between" className="unverified-email-wrapper">
          <Col
            xs={{ span: 13, offset: 0 }}
            md={{ span: 15, offset: 0 }}
          >
            {!mobileMenu
              ? (
                <Paragraph>
                  {`Verify your ${!verifyStatus.mobileVerified ? 'mobile' : 'email address'} to unlock multiple account benefits.`}
                </Paragraph>
              )
              : (
                <Paragraph>
                  <div>
                    <Text strong>{`Verify your ${!verifyStatus.mobileVerified ? 'mobile' : 'email address'}`}</Text>
                  </div>
                  <span style={{ fontSize: '10px' }}>to unlock multiple account benefits.</span>
                </Paragraph>
              )}

          </Col>
          <Col
            className="unverified-btn-wrapper"
            xs={{ span: 10, offset: 0 }}
            md={{ span: 7 }}
          >
            <Button
              className="unverified-email-btn"
              onClick={openVerificationModal}
            >
              {`Verify ${!verifyStatus.mobileVerified ? 'Mobile' : 'Email'} `}
            </Button>
          </Col>
          {isModalVisible ? <UnverifiedModal isEmailModalVisible /> : ''}
        </Row>
      ) : ''}
    </>
  );
};

export default UnverifiedEmailNotification;
