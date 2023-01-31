import {
  Col, Row, Typography, Button,
} from 'antd';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { isMobile } from 'mobile-device-detect';
import Router from 'next/router';
import Link from 'next/link';
import AppConstants from 'constants/constants';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/public/AccessBlocked/AccessBlocked.less');

const { Text, Paragraph } = Typography;

const AccessBlockedComponent: React.FunctionComponent = () => {
  useEffect(() => {
    // If Page is accessed via Desktop,
    // Redirecting it to Homepage
    if (!isMobile) {
      Router.push('/');
    }
  }, []);
  return (
    <>
      <Head>
        <title>
          {`Access Blocked: Kindly login to your account from Desktop to post a job. | ${AppConstants.APP_NAME}`}
        </title>
      </Head>
      <Row gutter={0} className="access-blocked">
        <Col xs={{ span: 20, offset: 2 }}>
          <CustomImage
            src="/images/static-pages/common/access-blocked.svg"
            alt="Access Blocked"
            className="center-block img-responsive"
            layout
          />
          <Paragraph>
            <Text className="hero-text text-center">
              Your job is posted. Please visit Desktop for managing the job and applications
            </Text>
            <Link href="/employer-zone/job-posting/add/new/">
              <Button size="large" className="home-top-btn center-block">
                <strong>
                  Post Another Job
                </strong>
              </Button>
            </Link>
          </Paragraph>
        </Col>
      </Row>
    </>
  );
};

export default AccessBlockedComponent;
