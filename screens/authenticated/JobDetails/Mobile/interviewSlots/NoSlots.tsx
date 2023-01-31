import React from 'react';
import {
  Card, Row, Typography, Col,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Paragraph } = Typography;

const NoSlots = (): JSX.Element => (
  <Card
    key="interview-slots"
    className="m-interview-slots-card"
    title={[
      <Row key="ncarSlots">
        <Col>
          <CustomImage
            src="/images/job-details/m-calendar.svg"
            width={48}
            height={48}
            alt="Calendar"
          />
        </Col>
        <Col span={20} className="m-v-auto">
          <Row>
            <Col span={24}><Paragraph className="text-medium font-bold">Interview slots</Paragraph></Col>
            <Col span={24}><Paragraph className="jd-description">Add interview slots</Paragraph></Col>
          </Row>
        </Col>
      </Row>,
    ]}
  />
);

export default NoSlots;
