/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
import {
  Button, Col, Row, Typography,
} from 'antd';
import CustomerSupportActionModal from 'components/Layout/CustomerSupportAction/customerSupportActionModal';
// import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { trackPostJobNowClick } from 'service/clevertap/common-events';
import { pushClevertapEvent } from 'utils/clevertap';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import Link from 'next/link';

require('screens/authenticated/jobPostingStep4/pricingPlans.less');

// const CustomerSupportActionModal = dynamic(() =>
// import('components/Layout/CustomerSupportAction/customerSupportActionModal'), { ssr: false });

const { Text } = Typography;

interface PropsType {
  plans: Array<PricingPlanType>,
  buyingPlanHandler: (id: any) => void,
  isLoggedInPage: boolean
}

const MobilePricingPlans = (props: PropsType): JSX.Element => {
  const { plans, buyingPlanHandler, isLoggedInPage } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (plans) {
      plans.forEach((plan) => {
        plan.offerings.forEach((offer, i) => {
          if (offer.code === 'JP') {
            plan.offerings.splice(i, 1);
            plan.offerings.unshift(offer);
          }
        });
      });
    }
  }, [plans]);

  return (
    <>
      <Row className="m-pricing-plans">
        <Col span={24}>
          <Row gutter={[24, 24]}>
            {
              plans.map((basePlan) => (
                <Col span={24} key={basePlan.display_name}>
                  <div className="pricing-plan">
                    <Row>
                      <Col span={17}>
                        <Row>
                          <Col span={24} className="plan-name">
                            <Text>{basePlan.display_name}</Text>
                          </Col>
                          <Col span={24}>
                            {
                              basePlan.offerings.map((offering: any) => (
                                <Row key={offering.code}>
                                  {offering.code === 'JP' ? (
                                    <Col span={24} className="jp">
                                      <Text>{offering.limit}</Text>
                                      <Text className="text-bold text-small">
                                        {' '}
                                        {offering.name}
                                      </Text>
                                    </Col>
                                  ) : (
                                    <Col span={24} className="offer">
                                      {
                                        offering.is_unlimited ? (
                                          <Text className="text-small">Unlimited</Text>
                                        ) : (
                                          <Text className="text-small">{offering.limit > 0 ? offering.limit : ''}</Text>
                                        )
                                      }

                                      <Text>
                                        {' '}
                                        {offering.name}
                                      </Text>
                                    </Col>
                                  )}
                                </Row>
                              ))
                            }
                          </Col>
                        </Row>
                      </Col>
                      <Col span={7}>

                        <Row className="pricing-action-block">
                          <Col span={24} className="text-right unit-cost">
                            <Text className="text-bold">
                              ₹
                              {basePlan.unit_cost}
                            </Text>
                          </Col>
                          <Col span={24} className="pricing-action">
                            <Row>
                              <Col span={24} className="text-right m-b-8">
                                <Text className="validity">
                                  {basePlan.validity_days}
                                  {' '}
                                  days
                                </Text>
                              </Col>
                              <Col span={24}>

                                {
                                  isLoggedInPage
                                    ? (
                                      <Button
                                        type="primary"
                                        className="action-btn"
                                        block
                                        disabled={basePlan.name === 'BASE_PLAN_FREE'} // TODO Need to change this to current plan
                                        onClick={(): void => {
                                          buyingPlanHandler(basePlan);
                                          pushClevertapEvent('General Click', {
                                            Type: 'Buy Plan',
                                            'Plan Type': basePlan.display_name,
                                          });
                                        }}
                                      >
                                        {basePlan.name === 'BASE_PLAN_FREE' ? 'Current Plan' : 'Buy' }
                                      </Button>
                                    )
                                    : (
                                      <Link href="/register/" prefetch={false}>
                                        <Button
                                          type="primary"
                                          className="action-btn p-all-0"
                                          block
                                          disabled={basePlan.name === 'BASE_PLAN_FREE'} // TODO Need to change this to current plan
                                          onClick={(): void => trackPostJobNowClick('Body', basePlan.display_name)}
                                        >
                                          {basePlan.name === 'BASE_PLAN_FREE' ? 'Current Plan' : 'Post Job' }
                                        </Button>
                                      </Link>
                                    )
                                }
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </Col>

              ))
            }

            <Col span={24}>
              <div className="pricing-plan">
                <Row>
                  <Col span={17}>
                    <Row>
                      <Col span={24} className="jp">
                        <Text className="jp-name">Design Your Plan</Text>
                      </Col>
                      <Col span={24} className="offer">
                        <Text>
                          Create a custom plan
                          that does justice for your
                          unique needs
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={7} className="custom-plan-action">
                    <Row>
                      <Col span={24}>
                        <Button
                          type="primary"
                          className="action-btn"
                          onClick={(): void => {
                            setVisible(true);
                            pushClevertapEvent('Special Click', {
                              Type: 'Contact Sales',
                              Source: 'Body',
                              'Plan Type': 'Enterprise',
                            });
                          }}
                        >
                          Contact
                        </Button>
                      </Col>
                    </Row>
                    {/* <Button
                        type="primary"
                        className="action-btn"
                        block
                        onClick={(): void => setVisible(true)}
                      >
                        Contact
                      </Button> */}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {
        visible ? (
          <CustomerSupportActionModal
            title="Need a Customized Plan?"
            description="Let us know your requirements and our sales executive will reach out to you shortly"
            source="pricing_plan"
            closeHandler={(): void => setVisible(false)}
            isLoggedInPage={isLoggedInPage}
            text="Custom plan request received"
          />
        ) : null
      }
    </>
  );
};

export default MobilePricingPlans;
