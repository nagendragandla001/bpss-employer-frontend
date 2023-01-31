import React from 'react';
import {
  Row, Col, Typography, Image,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

type PropsModel = {
  currentTab: string;
}

const EmptyJobTab = ({ currentTab }: PropsModel): JSX.Element => (
  <Row className="p-all-16">
    <Col span={24}>
      <Row>
        <Col span={24} className="placeholder-illustration">
          <CustomImage
            src="/images/jobs-tab/m-no-jobs-tab.svg"
            width={201}
            height={172}
            alt="No Jobs"
          />
        </Col>
      </Row>
      <Row justify="center" align="middle" className="margin-top-24">
        <Col span={24} className="text-center">
          <Text className="empty-text">
            There are no
            {' '}
            <span>
              {currentTab}
            </span>
            {' '}
            Jobs
          </Text>
        </Col>
      </Row>
    </Col>
  </Row>
);

export default EmptyJobTab;
