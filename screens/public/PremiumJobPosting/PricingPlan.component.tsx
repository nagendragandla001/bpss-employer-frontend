import {
  Col, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import { LinksConstants } from 'constants/index';
import { isMobile } from 'mobile-device-detect';
import React, { useEffect, useState } from 'react';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import MobilePricingPlans from 'screens/authenticated/jobPostingStep4/mobile/mobilePricingPlans';
import PricingPlans from 'screens/authenticated/jobPostingStep4/pricingPlans';
import { getPricingInfoAPI } from 'service/login-service';

const { Text, Paragraph, Title } = Typography;

const PricingPlanComponent: React.FunctionComponent = () => {
  const [basePlans, setBasePlans] = useState<Array<PricingPlanType>>([]);

  const fetchPricingPlans = async (): Promise<void> => {
    const response = await getPricingInfoAPI(false);
    if (response && response.MONETIZATION_PLANS) {
      const filteredBasePlans = response.MONETIZATION_PLANS.filter(
        (plan: PricingPlanType) => plan.plan_type === 'BP',
      );
      filteredBasePlans.sort((prev, curr) => prev.unit_cost - curr.unit_cost);
      setBasePlans(filteredBasePlans);
    }
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  return (
    <Container>
      <Row className={isMobile ? 'job-posting-pricing p-all-16' : 'job-posting-pricing'} align="middle" justify="center">
        <Col span={24} className="text-center">
          <Title level={2} className="h1">Plans</Title>
        </Col>
        <Col span={24} className="pricing-subtitle text-center">
          <Text className="h5">Flexible plans for every business type</Text>
        </Col>
        <Col span={24}>
          {
            isMobile ? (
              <MobilePricingPlans
                plans={basePlans}
                buyingPlanHandler={(): boolean => true}
                isLoggedInPage={false}
              />
            ) : (
              <PricingPlans
                plans={basePlans}
                buyingPlanHandler={(): boolean => true}
                isLoggedInPage={false}
              />
            )
          }

        </Col>
        <Col span={24} className="text-center">
          <Paragraph className="pricing-contact-block h5">
            <Text>Looking for more?</Text>
            &nbsp;
            <Text strong>
              <a
                href={LinksConstants.CONTACT}
                target="_blank"
                rel="noreferrer"
              >
                Contact Us
              </a>
            </Text>
          </Paragraph>
        </Col>
      </Row>
    </Container>
  );
};

export default PricingPlanComponent;
