import {
  Button, Col, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import HeadComponent from 'screens/public/PremiumJobPosting/HeadComponent';
import { trackPostJobNowClick } from 'service/clevertap/common-events';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/public/PremiumJobPosting/PremiumJobPosting.component.less');

const PricingPlanComponent = dynamic(() => import('screens/public/PremiumJobPosting/PricingPlan.component'), { ssr: false });
const EndBlockCTA = dynamic(() => import('components/StaticPages/Common/EndBlockCTA/EndBlockCTA.component'), { ssr: false });

const { Title, Text, Paragraph } = Typography;

const PremiumJobPostingComponent: React.FunctionComponent = () => (
  <>
    <HeadComponent />
    {/* Banner */}
    <Row gutter={0} className="premium-posting-banner text-center" justify="center">
      <Col xs={{ span: 23 }} lg={{ span: 24, offset: 0 }}>
        <Title level={1}>
          <Text className="premium-main-title">
            Promoted Jobs
            <CustomImage src="/images/static-pages/premium-posting/icon-premium-medal.svg" width={33} height={32} alt="Premium Jobs" />
          </Text>
        </Title>
        <Title level={3} className="premium-title">
          Get 3x Applications
        </Title>
        <Title level={4} className="premium-sub-title">
          Accelerate you hiring further using our Premium Plans
        </Title>
        <Link href="/register/" prefetch={false}>
          <Button
            size="large"
            className="landing-top-btn text-white"
            onClick={(): void => {
              trackPostJobNowClick('Header');
            }}
          >
            <strong>
              Start Posting Jobs
            </strong>
          </Button>
        </Link>
      </Col>
    </Row>

    {/* Features */}
    <Row className="premium-features">
      <Container>
        <Row gutter={0} justify="space-around">
          <Col xs={{ span: 24 }} sm={{ span: 7 }} className="premium-features-section">
            <div className="premium-features-img">
              <CustomImage
                src="/images/static-pages/premium-posting/icon-premium-standout.svg"
                alt="Stand out with Premium Tag"
                className="premium-features-img"
                width={275}
                height={200}

              />
            </div>
            <Paragraph>
              <Text className="premium-features-title">
                Stand out with Promoted Tag
              </Text>
            </Paragraph>
            <Paragraph>
              <Text className="premium-features-subtitle">
                All Promoted Job Postings get more visibility through a “Promoted”
                badge and are boosted to the top in Job listings
              </Text>
            </Paragraph>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 7 }} className="premium-features-section">
            <div className="premium-features-img">
              <CustomImage
                src="/images/static-pages/premium-posting/icon-premium-unlimited-unlocks.svg"
                alt="Get Unlimited Contact unlocks"
                className="premium-features-img"
                width={274}
                height={200}

              />
            </div>
            <Paragraph>
              <Text className="premium-features-title">
                Unlock contacts of Applicants
              </Text>
            </Paragraph>
            <Paragraph>
              <Text className="premium-features-subtitle">
                Application unlocks allow you to unlock profiles of candidates
                who have applied on your job
              </Text>
            </Paragraph>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 7 }} className="premium-features-section">
            <div className="premium-features-img">
              <CustomImage
                src="/images/static-pages/premium-posting/icon-premium-db-unlock.svg"
                alt="Notify candidates with SMS & Email"
                className="premium-features-img"
                width={281}
                height={202}

              />
            </div>
            <Paragraph>
              <Text className="premium-features-title">
                Contact candidates from Database
              </Text>
            </Paragraph>
            <Paragraph>
              <Text className="premium-features-subtitle">
                Select the best candidates from our database and
                reach out to them directly
              </Text>
            </Paragraph>
          </Col>
        </Row>
      </Container>
    </Row>

    <Row className="free-unlocks-banner text-center" justify="center">
      <Col span={24}>
        <Paragraph>
          <Text strong className="free-unlocks-title">Hurray!! Free Unlimited Application Unlocks for you</Text>
        </Paragraph>
      </Col>
      <Col span={12}>
        <Paragraph>
          <Text>
            We welcome all recruiters and employers to try our platform and to
            make the deal even sweeter for you - “We are giving Free Unlimited Application Unlocks”.
          </Text>
        </Paragraph>
      </Col>
      <Col span={24}>
        <Link href="/register/" prefetch={false}>
          <Button
            size="large"
            className="landing-top-btn text-white"
            onClick={(): void => {
              trackPostJobNowClick('Header');
            }}
          >
            <strong>
              Start Hiring
            </strong>
          </Button>
        </Link>
      </Col>
      <Col span={15} style={{ fontSize: '12px' }}>
        <Text type="secondary">
          **Just create an account with us and post a job to start receiving applications.
          Any application you unlock within the first 24 hours
          of application generation, you will not be charged any credit for it.

        </Text>
      </Col>

    </Row>

    {/* Pricing */}
    <PricingPlanComponent />

    {/* Testimonials */}
    {/* <Testimonials /> */}

    {/* Clients */}
    {/* <Clients /> */}

    <EndBlockCTA />
  </>
);

export default PremiumJobPostingComponent;
