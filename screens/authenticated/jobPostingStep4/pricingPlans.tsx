/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
import {
  Button, Col, Row, Spin, Typography,
} from 'antd';
import CustomerSupportActionModal from 'components/Layout/CustomerSupportAction/customerSupportActionModal';
import CustomImage from 'components/Wrappers/CustomImage';
// import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { trackPostJobNowClick } from 'service/clevertap/common-events';
import { pushClevertapEvent } from 'utils/clevertap';
import { Offering, PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import RefundBanner from 'components/PricingPlans/RefundBanner';

// const CustomerSupportActionModal = dynamic(() =>
// import('components/Layout/CustomerSupportAction/customerSupportActionModal'), { ssr: false });
require('screens/authenticated/jobPostingStep4/pricingPlans.less');

const { Text } = Typography;

interface PropsType {
  plans: Array<PricingPlanType>,
  buyingPlanHandler: (plan: any) => void,
  isLoggedInPage: boolean
}

const PricingPlans = (props: PropsType): JSX.Element => {
  const { plans, buyingPlanHandler, isLoggedInPage } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // TODO: Logic needs tobe refactor later. Used the least possible solution.
  const sorter = (a, b): any => {
    if (a.code === 'JP') {
      return -1;
    }
    if (b.code === 'JP') {
      return 1;
    }
    if (a.code === 'FJ') {
      return -1;
    }
    if (b.code === 'FJ') {
      return 1;
    }
    if (a.code === 'APP_UL') {
      return -1;
    }
    if (b.code === 'APP_UL') {
      return 1;
    }
    if (a.code === 'DB_UL') {
      return -1;
    }
    if (b.code === 'DB_UL') {
      return 1;
    }
    if (a.code === 'CALL_HR') {
      return -1;
    }
    if (b.code === 'CALL_HR') {
      return 1;
    }
    if (a.code === 'WI_JOBS') {
      return -1;
    }
    if (b.code === 'WI_JOBS') {
      return 1;
    }
    return a.code < b.code ? -1 : 1;
  };

  useEffect(() => {
    if (plans && plans.length > 0) {
      setLoading(false);
      plans.forEach((plan) => {
        plan.offerings.sort(sorter);
      });
    }
  }, [plans]);

  return (
    <>
      {
        !loading ? (
          <>
            <Row gutter={[24, 24]} className="d-pricing-plans">
              {
                plans.map((basePlan) => (
                  <Col span={6} key={`${basePlan.name}-${basePlan.id}`}>
                    <div className="pricing-plan">
                      <Row>
                        <Col span={24} className="text-center">
                          <Text>{basePlan.display_name}</Text>
                        </Col>
                        <Col span={24} className="text-center unit-cost">
                          <Text className="text-bold">
                            ₹
                            {basePlan.unit_cost}
                          </Text>
                        </Col>
                        <Col span={24}>
                          {
                            basePlan.offerings.map((offering: Offering) => (
                              <Row key={offering.code}>
                                {offering.code === 'JP' ? (
                                  <Col span={24} className="text-center jp">
                                    <Text className="jp-limit">{offering.limit}</Text>
                                    <Text className="jp-name">
                                      {' '}
                                      {offering.name}
                                    </Text>
                                  </Col>
                                ) : (
                                  <Col span={24} className="offer">
                                    <CustomImage
                                      className="tick"
                                      src="/images/pricing-plan/tick.svg"
                                      width={7}
                                      height={7}
                                      alt="Tick"
                                    />
                                    {
                                      offering.is_unlimited ? (
                                        <Text
                                          className="text-small"
                                          style={{ paddingLeft: 8 }}
                                        >
                                          <Text style={{ color: 'red' }}>* </Text>
                                          Unlimited
                                        </Text>
                                      ) : (
                                        <Text
                                          className="text-small"
                                          style={{ paddingLeft: 8 }}
                                        >
                                          {offering.limit > 0 ? offering.limit : ''}
                                        </Text>
                                      )
                                    }
                                    <Text className="text-bold text-small">
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
                      <Row>
                        <Col span={24} className="pricing-action">
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
                                      pushClevertapEvent('Buy Plan', {
                                        Type: 'Buy Plan',
                                        Plan: basePlan.display_name,
                                        PlanId: basePlan.id,
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
                                      className="action-btn"
                                      block
                                      onClick={(): void => trackPostJobNowClick('Body', basePlan.display_name)}
                                    >
                                      Post Job
                                    </Button>
                                  </Link>
                                )
                            }
                          </Col>
                          <Col span={24}>
                            <Text className="validity">
                              {basePlan.validity_days}
                              {' '}
                              days validity
                            </Text>
                          </Col>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                ))
              }

              <Col span={6} key="free-plan">
                <div className="pricing-plan">
                  <Row>
                    <Col span={24} className="text-center">
                      <Text>ENTERPRISE</Text>
                    </Col>
                    <Col span={24} className="text-center custom-plan">
                      <Text className="text-bold">
                        Design your plan
                      </Text>
                    </Col>
                    <Col span={24} className="text-center">
                      <Text>
                        Create a custom plan
                        that does justice for your
                        unique needs
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} className="pricing-action custom-plan-action">
                      <Button
                        type="primary"
                        className="action-btn"
                        block
                        onClick={(): void => {
                          setVisible(true);
                          pushClevertapEvent('Buy Plan', {
                            Type: 'Contact Sales',
                            Source: 'Body',
                            Plan: 'Enterprise',
                          });
                        }}
                      >
                        Contact @ Sales
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
            <RefundBanner />
            <Row>
              <Col span={24} className="text-center">
                <Text style={{ color: 'red' }}>* </Text>
                All unlimited features are subject to FUP limits.
              </Col>
              <Col span={24} className="text-center">
                #Free unlocks in 24 hours applicable with all plans till promotion is running.
              </Col>
            </Row>
          </>
        ) : (
          <Spin size="large" className="section-loader" />
        )
      }
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

export default PricingPlans;
