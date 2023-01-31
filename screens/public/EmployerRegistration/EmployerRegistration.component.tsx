import { LoadingOutlined } from '@ant-design/icons';
import {
  Card, Spin,
} from 'antd';
import Container from 'components/Layout/Container';
import { isMobile } from 'mobile-device-detect';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import HeadComponent from 'screens/public/EmployerRegistration/HeadComponent';
import {
  getUserInfo,
} from 'service/login-service';
import { getAccessToken } from 'utils/browser-utils';
import DesktopRegistrationComponent from './DesktopRegistrationComponent';
import MobileRegistrationComponent from './MobileRegistrationComponent';

require('screens/public/EmployerRegistration/EmployerRegistration.component.less');

const EmployerRegistrationComponent: React.FunctionComponent = () => {
  const [isAuthRequestInProgress, setAuthRequestInProgress] = useState(false);

  const [deviceType, setDeviceType] = useState('');

  const preAuthCheck = async (): Promise<void> => {
    const accessToken = getAccessToken();
    if (accessToken) {
      // Check if access_token is valid
      const apiResponse = await getUserInfo(true);
      if (apiResponse) {
        if (window?.localStorage?.getItem('new_user') === '1') {
          Router.push('/employer-zone/job-posting/add/new/');
        } else {
          Router.push('/employer-zone/jobs');
        }
        setTimeout(() => {
          setAuthRequestInProgress(false);
        }, 2000);
      }
    } else {
      setAuthRequestInProgress(false);
    }
  };

  useEffect(() => {
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    setAuthRequestInProgress(true);
    preAuthCheck();
  }, []);

  return (
    <>
      <HeadComponent />
      {!isAuthRequestInProgress
        ? (
          <>
            <Container>
              <Card bordered={false}>
                {
                  deviceType === 'mobile'
                    ? <MobileRegistrationComponent />
                    : <DesktopRegistrationComponent />
                }
              </Card>
            </Container>
          </>
        ) : (
          <>
            <div className="text-center hero-text">Checking for Authentication!</div>
            <Spin className="section-loader" indicator={<LoadingOutlined />} />
          </>
        )}
    </>
  );
};

export default EmployerRegistrationComponent;
