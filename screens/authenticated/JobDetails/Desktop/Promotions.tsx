import {
  Button, Card, Col, Row, Space, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

const { Text } = Typography;

interface IPromotions {
  updateFeatureJob: () => void;
}

const Promotions = (props: IPromotions): JSX.Element => {
  const { updateFeatureJob } = props;

  return (
    <Card className="promotion-banner-card">
      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Row justify="space-between">
            <Col span={12} className="jd-upgrade-app">
              Get 3X
              Applications!
            </Col>
            <Col span={12} className="text-right">
              <CustomImage
                src="/images/jobs-tab/upgrade-banner-icon.svg"
                width={40}
                height={40}
                alt="applications"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Button
            block
            className="promotion-btn"
            onClick={updateFeatureJob}
          >
            <Space>
              <CustomImage
                src="/svgs/m-premium.svg"
                width={24}
                height={24}
                alt="Premium"
              />
              <Text className="text-white">Promote this job</Text>
            </Space>
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default Promotions;
