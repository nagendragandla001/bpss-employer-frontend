import { Col, Row, Typography } from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

const { Text } = Typography;

interface IEmptyJobs {
  tab: string;
}

const EmptyJobs = (props: IEmptyJobs): JSX.Element => {
  const { tab } = props;

  return (
    <Row>
      <Col span={24}>
        <Row className="padding-top-2rem">
          <Col span={24} className="flex-all-center">
            <CustomImage
              src="/images/jobs-tab/no-jobs-banner.svg"
              width={201}
              height={172}
              alt="no jobs banner"
            />
          </Col>
        </Row>
        <Row justify="center" align="middle" className="margin-top-24">
          <Col span={24} className="flex-all-center">
            <Text className="text-medium color-charcoal-6">{`There are no ${tab} Jobs`}</Text>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default EmptyJobs;
