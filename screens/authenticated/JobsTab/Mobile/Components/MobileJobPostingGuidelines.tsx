/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import {
  Button, Typography, Row, Col, Space,
} from 'antd';
import RightOutlined from '@ant-design/icons/RightOutlined';
import Modal from 'antd/lib/modal/Modal';
import { pushClevertapEvent } from 'utils/clevertap';
import AppConstants from 'constants/constants';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobsTab/Mobile/Components/MobileJobPostingGuidelines.less');

const { Text } = Typography;

type PropsModel = {
  title?: string | null
}

const MobileJobPostingGuidelines = ({ title = null }: PropsModel): JSX.Element => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="jp-guidelines-container">
      <Button
        type="link"
        onClick={(): void => {
          pushClevertapEvent('Special Click', { Type: 'Know More - Unapproved' });
          setVisible(true);
        }}
        className="link-btn-blue p-all-0"
      >
        {
          title || (
            <span>
              know more
              <RightOutlined style={{ fontSize: '12px', fontWeight: 'bold' }} />
            </span>
          )
        }

      </Button>
      {visible ? (
        <Modal
          visible={visible}
          title={
            [
              <Row key={Math.random()}>
                <Col span={2} onClick={(): void => setVisible(false)}><CustomImage src="/svgs/m-close.svg" height={24} width={24} alt="Close" /></Col>
                <Col span={20} className="m-modal-title">Job Posting Guidelines</Col>
              </Row>,
            ]
          }
          onCancel={(): void => setVisible(false)}
          footer={null}
          closable={false}
          width={750}
          destroyOnClose
          className="full-screen-modal m-jp-guidelines"
          maskStyle={{ background: 'rgb(0, 47, 52,0.8)' }}
        >
          <Row className="modal-info">
            <Space>
              <Col>
                <CustomImage
                  src="/images/jobs-tab/light-bulb-icon-24x24.svg"
                  height={24}
                  width={24}
                  alt="light bulb"
                />
              </Col>
              <Col className="text-small">
                Your job will be marked “Unapproved” or “Rejected” if it
                does not adhere to below mentioned guidelines
              </Col>
            </Space>
          </Row>
          <Row className="m-list-container">
            <Col span={24}>
              <Text className="text-base font-bold">
                {`When using the ${AppConstants.APP_NAME} platform for posting a job, you must
                adhere to our guidelines mentioned below:`}
              </Text>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <ul className="list">
                    <li>
                      There should not be any direct/indirect activity which
                      asks jobseekers for any amount of money.
                    </li>
                    <li>
                      {`Any information or content you provide should not be used to redirect
                      ${AppConstants.APP_NAME} users to register on any other website to get a job.`}
                    </li>
                    <li>
                      All company-related information should be correct and up-to-date.
                    </li>
                    <li>
                      Any information or content provided for the listing should not be
                      inappropriate, offensive , nor express discrimination based on religion,
                      race, gender, caste or nationality.
                    </li>
                  </ul>
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
                <Col span={24}>
                  <ul className="list">
                    <li>
                      There should not be any direct/indirect activity which asks
                      jobseekers for any amount of money.
                    </li>
                    <li>
                      All the information about the job such as city, salary,
                      working hours etc., should be correct
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
                      Indulging in fraudulent activities will result
                      in the permanent deletion of your account.
                    </li>
                    <li>
                      Do not add your Email ID, Phone Number or any other contact details
                      in the Job Description or any other field in the job listing form
                    </li>
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="modal-info-grey">
            <Col>
              <Text className="text-small ">
                {`*Guidelines mentioned above are not exhaustive.
                ${AppConstants.APP_NAME} retains the right to remove the job listing and terminate the account for any reason not mentioned above in the view of job seekers’ interest.`}
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
      ) : null}
    </div>
  );
};

export default MobileJobPostingGuidelines;
