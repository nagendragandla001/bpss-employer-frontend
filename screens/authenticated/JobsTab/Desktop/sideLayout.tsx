import { Col, Row, Typography } from 'antd';
import React from 'react';
import DesktopAccountSummary from 'screens/authenticated/AccountSummary/Desktop/index';
import { TatalPricingStats } from 'screens/authenticated/jobPostingStep4/commonTypes';

const { Text } = Typography;
interface PropsType {
  pricingStats: TatalPricingStats
}

const SideLayout = (props: PropsType):JSX.Element => {
  const { pricingStats } = props;
  return (
    <Row className="side-layout">
      <Col span={24} className="side-layout stats-container">
        <Row>
          <Col span={24} className="title">
            <Text className="color-blue-grey-5 text-small font-bold">ACCOUNT SUMMARY</Text>
          </Col>
          <Col span={24}>
            <DesktopAccountSummary
              pricingStats={pricingStats}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default SideLayout;
