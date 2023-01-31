import {
  Button, Col, Row, Typography,
} from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import HeadComponent from 'screens/public/Home/HeadComponent';
import { trackStartPostingJob } from 'service/clevertap/common-events';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/public/Home/Home.less');

const Container = dynamic(() => import('components/Layout/Container'), { ssr: true });
const EndBlockCTA = dynamic(() => import('components/StaticPages/Common/EndBlockCTA/EndBlockCTA.component'), { ssr: true });

const { Title, Text, Paragraph } = Typography;
const HomeComponent: React.FunctionComponent = () => (
  <>
    <HeadComponent />

    {/* Banner */}
    <Row gutter={0} className="home-banner">
      <Container>
        <Row justify="center">

          {/* Mobile Specific: Banner Image */}
          <Col xs={{ span: 22, offset: 0 }} md={{ span: 0, offset: 0 }}>
            <CustomImage
              src="/images/static-pages/home/illustration-home.jpg"
              alt="Hire Better faster and cheaper"
              className="img-responsive"
              width={684}
              height={568}
              placeholder="blur"
            />
          </Col>

          {/* Hero Block */}
          <Col xs={{ span: 23, offset: 1 }} md={{ span: 11, offset: 0 }}>
            <Title level={1} className="home-title">
              <Text strong>
                Hire Faster,
                <br />
                Better & Cheaper
              </Text>
            </Title>
            <Title level={2} className="h2 home-subtitle">
              <Text className="h5" style={{ fontWeight: 400 }}>
                Tap into largest network of Jobseekers across the country
              </Text>
            </Title>
            <Link href="/register/" prefetch={false}>
              <Button
                size="large"
                type="primary"
                className="br-8 home-top-btn text-white"
                onClick={(): void => trackStartPostingJob('Header')}
              >
                <strong>
                  Post Job in 2 mins
                </strong>
              </Button>
            </Link>
          </Col>

          {/* Banner Image */}
          <Col xs={{ span: 0, offset: 0 }} md={{ span: 13, offset: 0 }}>
            <div className="img-responsive">
              <CustomImage
                src="/images/static-pages/home/illustration-home.jpg"
                alt="Home"
                width={684}
                height={595}
                placeholder="blur"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </Row>

    {/* Stats */}
    <Row className="home-stats-main">
      <Container>
        <Col span={24} style={{ marginTop: 32, marginBottom: 32 }}>
          <Row align="top" justify="center">
            <Col xs={{ span: 24 }} sm={{ span: 8 }} className="home-stats-block">
              <Row gutter={0} align="middle" justify="space-between">
                <Col span={16}>
                  <Text className="home-stats-title" strong>6</Text>
                  <Text className="home-stats-subtitle" strong>cr+</Text>
                </Col>
                <Col span={8} className="text-right">
                  <CustomImage
                    src="/images/static-pages/home/icon-stats-jobseekers.svg"
                    width={48}
                    height={48}
                    alt="Jobseekers registered across nation"
                    placeholder="blur"
                  />
                </Col>
              </Row>
              <Paragraph className="home-stats-desc">
                Jobseekers registered
                <br />
                across nation
              </Paragraph>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 8 }} className="home-stats-block">
              <Row gutter={0} align="middle" justify="space-between">
                <Col span={16}>
                  <Text className="home-stats-title" strong>3</Text>
                  <Text className="home-stats-subtitle" strong>lakh+</Text>
                </Col>
                <Col span={8} className="text-right">
                  <CustomImage
                    src="/images/static-pages/home/icon-stats-jobs.svg"
                    width={48}
                    height={48}
                    alt="Jobs being posted every month"
                    placeholder="blur"
                  />
                </Col>
              </Row>
              <Paragraph className="home-stats-desc">
                Jobs being posted
                <br />
                every month
              </Paragraph>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 8 }} className="home-stats-block">
              <Row gutter={0} align="middle" justify="space-between">
                <Col span={16}>
                  <Text className="home-stats-title" strong>50</Text>
                  <Text className="home-stats-subtitle" strong>lakh+</Text>
                </Col>
                <Col span={8} className="text-right">
                  <CustomImage
                    src="/images/static-pages/home/icon-stats-applications.svg"
                    width={48}
                    height={48}
                    alt="Applications created every month"
                    placeholder="blur"
                  />
                </Col>
              </Row>
              <Paragraph className="home-stats-desc">
                Applications created
                <br />
                every month
              </Paragraph>
            </Col>
          </Row>
        </Col>
      </Container>
    </Row>

    {/* Features */}
    <Row>
      <Col span={24} className="home-features-block">
        <Row
          style={{ paddingTop: 120, paddingBottom: 120 }}
        >
          <Container>
            <Row gutter={{ md: 24, xs: 0 }}>
              <Col xs={{ span: 22, offset: 1 }} sm={{ span: 12, offset: 0 }}>
                <Paragraph className="feature-title">
                  Reach out to relevant candidates
                  <span className="home-title-subtext">faster</span>
                </Paragraph>
                <Paragraph className="features-subsection">
                  <CustomImage
                    src="/images/static-pages/home/icon-home-ml.svg"
                    alt="AI based suggestions to Jobseekers"
                    className="feature-icon"
                    height={64}
                    width={64}
                    placeholder="blur"
                  />
                  <span className="h5">
                    AI based suggestions
                    <br />
                    to Jobseekers
                  </span>
                </Paragraph>
                <Paragraph className="features-subsection">
                  <CustomImage
                    src="/images/static-pages/home/icon-home-sms.svg"
                    alt="SMS & Email Blasts to increase reach"
                    className="feature-icon"
                    height={64}
                    width={64}
                    placeholder="blur"
                  />
                  <span className="h5">
                    SMS & Email Blasts to
                    <br />
                    increase reach
                  </span>
                </Paragraph>
                <Paragraph className="features-subsection">
                  <CustomImage
                    src="/images/static-pages/home/icon-home-shortlist.svg"
                    alt="Easy shortlisting of highly relevant applications"
                    className="feature-icon"
                    height={64}
                    width={64}
                    placeholder="blur"
                  />
                  <span className="h5">
                    Easy shortlisting of highly
                    <br />
                    relevant applications
                  </span>
                </Paragraph>
              </Col>
              <Col xs={{ span: 0 }} sm={{ span: 12, offset: 0 }}>
                <CustomImage
                  src="/images/static-pages/home/icon-home-features-1.svg"
                  alt="Icon Home Features"
                  className="img-responsive"
                  width={596}
                  height={449}
                  placeholder="blur"
                />
              </Col>
            </Row>
          </Container>
        </Row>

        <Row
          className="feature-block-2"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >
          <Container>
            <Row gutter={{ md: 64, xs: 0 }}>
              <Col xs={{ span: 22, offset: 1 }} sm={{ span: 12, offset: 0 }}>
                <CustomImage
                  src="/images/static-pages/home/icon-home-features-2.svg"
                  className="img-responsive"
                  alt="Receive direct calls from Jobseekers"
                  width={591}
                  height={505}
                  placeholder="blur"
                />
              </Col>
              <Col
                xs={{ span: 22, offset: 1 }}
                sm={{ span: 12, offset: 0 }}
                className="text-block"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
              >
                <Paragraph className="feature-title" style={{ paddingBottom: 17 }}>
                  Receive direct calls
                  <br />
                  from
                  <span className="home-title-subtext alternate">Jobseekers</span>
                </Paragraph>
                <Paragraph className="h5" style={{ lineHeight: '28px' }}>
                  Interested Candidates can call you on your number
                  <br />
                  during working hours 9am to 5pm
                </Paragraph>
              </Col>
            </Row>
          </Container>
        </Row>
      </Col>
    </Row>

    {/* Hire Contactless */}
    <Row className="home-features-block">
      <Container>
        <Col
          span={24}
          className="hire-contactless"
        >
          <Row gutter={{ md: 24, xs: 0 }}>
            <Col
              xs={{ span: 22, offset: 1 }}
              sm={{ span: 16, offset: 0 }}
              lg={{ span: 12, offset: 0 }}
            >
              <Paragraph className="feature-title">
                Hire
                <span className="home-title-subtext">Contactless</span>
              </Paragraph>
              <Paragraph className="features-subsection">
                <CustomImage
                  src="/images/static-pages/home/icon-contactless-1.svg"
                  alt="ML based suggestions to Jobseekers"
                  className="feature-icon"
                  width={64}
                  height={65}
                  placeholder="blur"
                />
                <span className="h5">
                  Provide your available
                  <br />
                  timing for interview
                </span>
              </Paragraph>
              <Paragraph className="features-subsection">
                <CustomImage
                  src="/images/static-pages/home/icon-contactless-2.svg"
                  alt="ML based suggestions to Jobseekers"
                  className="feature-icon"
                  width={64}
                  height={64}
                  placeholder="blur"
                />
                <span className="h5">
                  Choose from video or
                  <br />
                  phone interview options
                </span>
              </Paragraph>
              <Paragraph className="features-subsection">
                <CustomImage
                  src="/images/static-pages/home/icon-contactless-3.svg"
                  alt="ML based suggestions to Jobseekers"
                  className="feature-icon"
                  width={64}
                  height={64}
                  placeholder="blur"
                />
                <span className="h5">
                  Jobseekers can see
                  <br />
                  timeslots & book directly
                </span>
              </Paragraph>
            </Col>
            <Col xs={{ span: 22, offset: 1 }} sm={{ span: 12, offset: 0 }}>
              <CustomImage
                src="/images/static-pages/home/icon-contactless.svg"
                alt="Contactless"
                width={500}
                height={369}
                className="img-responsive"
                placeholder="blur"
              />
            </Col>
          </Row>
        </Col>
      </Container>
    </Row>

    {/* Track Applications */}
    <Row className="home-track-applications">
      <Container>
        <Col>
          <Row align="middle">
            <Col xs={{ span: 22, offset: 1 }} sm={{ span: 12, offset: 0 }}>
              <Paragraph className="home-track-title">
                Track Applications
                <br />
                with the help of
                <span className="home-title-subtext alternate">AI</span>
              </Paragraph>
            </Col>
            <Col xs={{ span: 22, offset: 1 }} sm={{ span: 12, offset: 0 }}>
              <Paragraph className="home-track-subtitle">
                Leverage AI-powered smart and intuitive Application Tracking System
                to increase your efficiency of managing your jobs and applications
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col span={24} className="home-track-image">
          <CustomImage
            src="/images/static-pages/home/icon-track-applications.svg"
            alt="Track applications"
            width={1134}
            height={320}
            placeholder="blur"
          />
        </Col>
      </Container>
    </Row>

    {/* End Block */}
    <EndBlockCTA />
  </>
);

export default HomeComponent;
