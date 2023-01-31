import { Col, Row, Typography } from 'antd';
import Container from 'components/Layout/Container';
import AppConstants from 'constants/constants';
import React from 'react';
import HeadComponent from 'screens/public/JobPostingGuidelines/HeadComponent';

require('screens/public/JobPostingGuidelines/JobPostingGuidelines.component.less');

const { Title, Text, Paragraph } = Typography;

const JobPostingGuidelinesPage: React.FunctionComponent = () => (
  <>
    <HeadComponent />

    {/* Hero Section */}
    <Row className="common-public-hero">
      <Container>
        <Row>
          <Col xs={{ span: 22, offset: 1 }} md={{ span: 16, offset: 1 }}>
            <Title level={1} className="cp-title">
              Job Posting Guidelines
            </Title>
            <Title level={2} className="cp-subtitle">
              {`When using the ${AppConstants.APP_NAME} platform,
              you must adhere to our guidelines mentioned below:`}
            </Title>
          </Col>
        </Row>
      </Container>
    </Row>

    {/* Main Content */}
    <Row className="job-posting-guidelines">
      <Container>
        <Row className="second-level">
          <Col xs={{ span: 22, offset: 1 }} md={{ span: 16, offset: 1 }}>
            <ul className="guidelines-list">
              <li>
                There should not be any direct/indirect activity which asks jobseekers
                for any amount of money.
              </li>
              <li>
                {`Any information or content you provide should not be used to redirect
                ${AppConstants.APP_NAME} users to register on any other website to get a job.`}
              </li>
              <li>All company-related information should be correct and up-to-date.</li>
              <li>
                Any information or content provided for the listing should not be inappropriate,
                offensive , nor  express discrimination based on religion, race, gender, caste or
                nationality.
              </li>
            </ul>
          </Col>
        </Row>
        <Row className="second-level">
          <Col xs={{ span: 22, offset: 1 }} md={{ span: 16, offset: 1 }}>
            <Title level={4} className="gl-note">
              Please note that your job posting will be removed and your account will be terminated
              in case we find that any information is fake, misleading, inappropriate and violates
              our guidelines. To maintain the community standards, please follow the below-mentioned
              guidelines when posting a job:
            </Title>
            <ul className="guidelines-list">
              <li>The job listing should have a clear job title and job description</li>
              <li>
                All the information about the job such as city, salary, working hours etc.,
                should be correct
              </li>
              <li>
                Any content or information for your listing should not be
                inappropriate or offensive.
              </li>
              <li>
                The job listing should not express discrimination based on religion,
                race, gender, caste, nationality.
              </li>
              <li>
                Posting fraudulent jobs is strictly prohibited.
                Indulging in fraudulent activities will result in the permanent
                deletion of your account.
              </li>
              <li>
                Do not add your Email ID, Phone Number or any other contact details in
                the Job Description or any other field in the job listing form
              </li>
            </ul>
          </Col>
        </Row>
        <Row className="second-level">
          <Col xs={{ span: 22, offset: 1 }} md={{ span: 18, offset: 1 }}>
            <Text className="gl-final-note">
              {`*Guidelines mentioned above are not exhaustive.
              ${AppConstants.APP_NAME} retains the right to remove the job listing and terminate
              the account for any reason not mentioned above in the view of job seekers’ interest.`}
            </Text>
          </Col>
        </Row>
        <Row>
          <Col
            xs={{ span: 22, offset: 1 }}
            md={{ span: 18, offset: 1 }}
            className="gl-support"
          >
            <Paragraph>
              <Text strong>Still Facing doubts? Write to us at:</Text>
            </Paragraph>
            <Paragraph>
              <a href={`mailto:${AppConstants.SUPPORT_MAIL}`}>
                {AppConstants.SUPPORT_MAIL}
              </a>
            </Paragraph>
          </Col>
        </Row>
      </Container>
    </Row>
  </>
);

export default JobPostingGuidelinesPage;
