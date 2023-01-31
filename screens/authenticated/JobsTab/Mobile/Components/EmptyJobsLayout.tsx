import React from 'react';
import {
  Row, Col, Typography, Button, Image,
} from 'antd';
import { UserDetailsType } from 'lib/authenticationHOC';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

type PropsModel = {
  handlePostJob: () => void;
  userDetails: UserDetailsType|null
}

const EmptyJobsLayout = ({ handlePostJob, userDetails }: PropsModel): JSX.Element => (
  <Row className="p-all-16">
    <Col span={24}>
      <Row>
        <Col span={24} className="placeholder-illustration">
          <CustomImage
            src="/images/jobs-tab/m-no-jobs.svg"
            width={293}
            height={149}
            alt="No Jobs"
          />
        </Col>
      </Row>
      <Row className="empty-data">
        <Col span={24}>
          <Text>
            {`Welcome ${userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : ''},`}
          </Text>
        </Col>
        <Col span={24}>
          <Text>
            Let’s start building your team!
          </Text>
        </Col>
        <Col span={24}>
          <Button
            type="primary"
            className="post-job"
            block
            onClick={handlePostJob}
          >
            Start Posting Job
          </Button>
        </Col>
      </Row>
    </Col>
  </Row>
);

export default EmptyJobsLayout;
