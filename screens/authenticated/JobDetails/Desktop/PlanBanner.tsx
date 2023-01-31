import { Row, Col, Typography } from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

interface IPlanBanner {
  job: IJobPost
}

const { Text } = Typography;

const PlanBanner = (props: IPlanBanner): JSX.Element => {
  const { job } = props;
  return (
    <Row>
      {
        job?.pricingPlanType === 'FR' && (
          <Col span={24}>
            {
              (job?.activeTag && job?.state === 'J_O') && (
                <Text className="jd-active-banner">
                  ACTIVE
                  {' '}
                  <CustomImage
                    src="/svgs/icon-active.svg"
                    alt="active-tag"
                    width={72}
                    height={20}
                  />
                </Text>
              )
            }
          </Col>
        )
      }
      {
        job?.pricingPlanType === 'JP' && (
          <Col span={24}>
            <Text className="jd-premium-banner">
              <CustomImage
                src="/images/jobs-tab/promoted-job-icon.svg"
                width={14}
                height={14}
                alt="Premium"
              />
              {' '}
              Promoted Job
            </Text>
          </Col>
        )
      }
    </Row>
  );
};

export default PlanBanner;
