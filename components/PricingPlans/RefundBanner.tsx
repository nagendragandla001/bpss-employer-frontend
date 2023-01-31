import React from 'react';
import {
  Alert, Col, Row, Space, Typography,
} from 'antd';

require('components/PricingPlans/RefundBanner.less');

const { Paragraph, Text } = Typography;

const RefundBanner = (): JSX.Element => (
  <Row justify="center" className="refund-banner">
    <Col span={6}>
      <Alert
        className="br-8"
        banner
        message={(
          <Space size={16}>
            <Paragraph className="tag">
              <Space direction="vertical" size={0}>
                <Text className="main-text">30</Text>
                <Text className="sub-text">DAY</Text>
              </Space>
            </Paragraph>

            <Space direction="vertical" align="start" size={4}>
              <Text className="banner-title">Money-back guarantee</Text>
              <Text className="banner-sub-title">NO QUESTIONS ASKED</Text>
            </Space>
          </Space>
        )}
        showIcon={false}
      />
    </Col>
  </Row>
);

export default RefundBanner;
