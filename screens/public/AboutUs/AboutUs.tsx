import {
  Col, Row, Typography,
} from 'antd';
// import Clients from 'components/StaticPages/Common/Clients/Clients.component';
// import Testimonials from 'components/StaticPages/Common/Testimonials/Testimonials.component';
import dynamic from 'next/dynamic';
import React from 'react';
import HeadComponent from 'screens/public/AboutUs/Head';
import LinksConstants from 'constants/links-constants';

require('screens/public/AboutUs/AboutUs.less');

const Container = dynamic(() => import('components/Layout/Container'), { ssr: true });

const { Title, Paragraph } = Typography;

const AboutUs: React.FunctionComponent = () => (
  <>
    <HeadComponent />

    {/* Banner */}
    <Row gutter={0} className="about">
      <Container>
        <Row>
          <Col span={24}>
            <Title level={2} className="main-title">How It All Started</Title>
          </Col>
          <Col xs={{ span: 22, offset: 1 }} md={{ span: 12, offset: 6 }}>
            <Paragraph className="main-content">
              {`${LinksConstants.APP_NAME}, formerly known as Waahjobs / Aasaanjobs, was born in 2014 as a means to address a recurring problem in the job market: access to a trustworthy database of candidates in the entry level and blue collar job segments
              was largely restricted, and the hiring process highly disorganised.
              This was due to a crippling unavailability of information regarding
              skill benchmarks as well as job requirements. It was therefore essential
              to create a repository of data containing information about jobs as well
              as candidates in this segment.`}
            </Paragraph>

            <Paragraph className="main-content">
              {`Over the years, ${LinksConstants.APP_NAME} has evolved into an end-to-end recruitment
              marketplace connecting employers, consultants and job seekers for
              jobs across hierarchies in an organization.`}
            </Paragraph>
          </Col>
        </Row>
      </Container>
    </Row>
  </>
);

export default AboutUs;
