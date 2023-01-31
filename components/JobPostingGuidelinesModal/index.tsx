import React from 'react';
import {
  Modal, Typography, Row, Col,
} from 'antd';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import AppConstants from 'constants/constants';
import CustomImage from 'components/Wrappers/CustomImage';

require('components/JobPostingGuidelinesModal/jobPostingGuidelines.less');

const { Text } = Typography;

const approvalGuidelines = [
  'There should not be any direct/indirect activity which asks jobseekers for any amount of money.',
  `Any information or content you provide should not be used to redirect ${AppConstants.APP_NAME} users to register on any other website to get a job.`,
  'All company-related information should be correct and up-to-date.',
  'Any information or content provided for the listing should not be inappropriate, offensive , nor express discrimination based on religion, race, gender, caste or nationality.'];

const rejectionGuidelines = [
  'The job listing should have a clear job title and job description',
  'All the information about the job such as city, salary, working hours etc., should be correct',
  'Any content or information for your listing should not be inappropriate or offensive.',
  'The job listing should not express discrimination based on religion, race, gender, caste, nationality.',
  'Posting fraudulent jobs is strictly prohibited. Indulging in fraudulent activities will result in the permanent deletion of your account.',
  'Do not add your Email ID, Phone Number or any other contact details in the Job Description or any other field in the job listing form',
];

const JobPostingGuidelines = ({ onCloseHandler }:{onCloseHandler: ()=>void}): JSX.Element => (
  <Modal
    visible
    title={<Text className="modal-title">Job Posting Guidelines</Text>}
    onCancel={onCloseHandler}
    footer={null}
    width={750}
    destroyOnClose
    closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
    className="jp-guidelines-modal"
    maskStyle={{ background: 'rgba(0, 20, 67, 0.8)' }}
  >
    <Row className="modal-info">
      <Col
        span={24}
        className="text-small"
        style={{
          alignItems: 'center',
          display: 'flex',
        }}
      >
        <CustomImage
          src="/images/jobs-tab/light-bulb-icon-24x24.svg"
          alt="light bulb"
          height={32}
          width={32}
          className="p-right-4"
        />
        Your job will be marked “Unapproved” or “Rejected” if it
        does not adhere to below mentioned guidelines
      </Col>
    </Row>
    <Row className="list-container">
      <Col span={24}>
        <Row className="list-title">
          <Col span={24}>
            <Text className="text-base font-bold">
              {`When using the ${AppConstants.APP_NAME} platform for posting a job, you must
              adhere to our guidelines mentioned below:`}
            </Text>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="list">
            {approvalGuidelines.map((guideline) => (
              <Row align="top" className="p-top-8" key={Math.random()}>
                <Col>
                  <div className="list-bullet" />
                </Col>
                <Col span={23}>
                  <Text className="text-small color-blue-grey-6">
                    {guideline}
                  </Text>

                </Col>
              </Row>
            ))}
          </Col>
        </Row>
        <Row className="list-title">
          <Col span={24}>
            <Text className="text-base font-bold">
              Please note that your job posting will be removed and your account will be
              terminated in case we find that any information is fake, misleading,
              inappropriate and violates our guidelines.
              To maintain the community standards, please follow
              the below-mentioned guidelines
              when posting a job:
            </Text>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="list">
            {rejectionGuidelines.map((guideline) => (
              <Row align="top" className="p-top-8" key={Math.random()}>
                <Col>
                  <div className="list-bullet" />
                </Col>
                <Col span={23}>
                  <Text className="text-small color-blue-grey-6">
                    {guideline}
                  </Text>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </Col>
    </Row>
    <Row className="modal-info-grey">
      <Col>
        <Text className="text-small ">
          {`*Guidelines mentioned above are not exhaustive.
          ${AppConstants.APP_NAME} retains the right to remove the job listing and terminate the account
          for any reason not mentioned above in the view of job seekers’ interest.`}
        </Text>
      </Col>
    </Row>
    <Row>
      <Col span={24} className="display-flex flex-justify-content-center">
        <Text className="text-base font-bold">
          Still Facing doubts? Write to us at:
        </Text>
      </Col>
    </Row>
    <Row>
      <Col span={24} className="display-flex flex-justify-content-center">
        <Text className="text-base color-cyan-8">
          {AppConstants.SUPPORT_MAIL}
        </Text>
      </Col>
    </Row>
  </Modal>
);
export default JobPostingGuidelines;
