import { CaretRightOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import {
  Button, Col, Collapse, Progress, Row, Spin, Typography,
} from 'antd';
import { pricingConstants } from 'constants/enum-constants';
import Link from 'next/link';
import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import { getSubscriptionStatus } from 'screens/authenticated/Passbook/MyPlanUtil';
import { transactionDetails } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/Passbook/mobile/mobileMyPlan.less');

const { Panel } = Collapse;
const { Text } = Typography;

interface PropsType {
  dataLoading: boolean;
  getMoreData: () => Promise<void>;
  plans: Array<PricingPlanType>;
  transactions:Array<transactionDetails>;
}

const MobileMyPlanHelper = (props: PropsType): JSX.Element => {
  const {
    plans, transactions, dataLoading, getMoreData,
  } = props;
  const [state, setState] = useState<any>({
    showPlans: true,
    showTransactions: false,
  });

  const handleBtn = (current: string, previous: string): void => {
    if (!state[current]) {
      setState((prevState) => ({
        ...prevState,
        [current]: true,
        [previous]: false,
      }));
    }
  };

  const getPanelHeader = (plan: PricingPlanType): JSX.Element => (
    <Row align="bottom">
      <Col span={12}>
        <Row>
          <Col span={24} className="plan-type">{plan.plan_type === 'BP' ? 'Plan Type' : 'Add-On'}</Col>
          <Col span={24} className="plan-name">{String(plan.display_name).toLocaleLowerCase()}</Col>
        </Row>
      </Col>
      <Col span={12} className="text-right">
        <Row align="middle" justify="end">
          <Col span={24} className="plan-expiry">
            {getSubscriptionStatus(plan)}
          </Col>
          <Col span={24}>
            <Link href="pricingPlans" as="employer-zone/pricing-plans/">
              <Button
                size="small"
                className="upgrade-plan"
              >
                {
                  plan.auto_renew ? 'Upgrade Plan' : 'Buy More'
                }
              </Button>
            </Link>

          </Col>
        </Row>
      </Col>
    </Row>
  );

  return (
    <Row className="passbook-drawer">
      <Col span={24} className="p-all-12">
        <Row gutter={[8, 8]} className="plans">
          <Col span={12}>
            <Button
              size="middle"
              type={state.showPlans ? 'primary' : 'default'}
              ghost={state.showPlans}
              block
              onClick={(): void => handleBtn('showPlans', 'showTransactions')}
            >
              Plans
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="middle"
              type={state.showTransactions ? 'primary' : 'default'}
              block
              ghost={state.showTransactions}
              onClick={(): void => handleBtn('showTransactions', 'showPlans')}
            >
              Recent transactions
            </Button>
          </Col>
        </Row>
      </Col>

      {/* Plans */}
      {
        state.showPlans ? (
          <Col span={24} className="p-0-12">
            <Collapse
              ghost
              accordion
              defaultActiveKey={['1']}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
              expandIconPosition="start"
              className="m-my-plans-collapse"
            >
              {
                plans?.map((plan: any) => (
                  <Panel
                    key={plan.id}
                    className={plan.subscription_status === 'EXPIRED' ? 'expired-plan' : 'active-plan'}
                    header={getPanelHeader(plan)}
                  >
                    <Row>
                      {
                        plan.offering_subscription.map((offer) => (
                          <React.Fragment key={Math.random() * offer.offering_code}>
                            {(['CALL_HR', 'WI_JOBS'].indexOf(offer.offering_code) !== -1) ? null
                              : (
                                <Col span={24} key={offer.offering_code} className="plan-details">
                                  <Row gutter={4} align="middle">
                                    <Col span={8}>
                                      <Text className="text-semibold">
                                        {pricingConstants[offer.offering_code]}
                                      </Text>
                                    </Col>
                                    <Col span={10}>
                                      <Progress
                                        className="plan-progress"
                                        percent={((offer.limit - offer.remaining_credits)
                                        / offer.limit) * 100}
                                        showInfo={false}
                                      />
                                    </Col>
                                    <Col span={6} className="text-right">
                                      <Text className="plan-remaining-credits">
                                        {offer.limit - offer.remaining_credits}
                                        /
                                      </Text>
                                      <Text className="plan-total-credits">{offer.limit}</Text>
                                    </Col>
                                  </Row>
                                </Col>
                              )}
                          </React.Fragment>
                        ))
                      }
                    </Row>
                  </Panel>
                ))
              }
            </Collapse>
          </Col>
        ) : null
      }

      {/* Recent Transactions */}
      {
        state.showTransactions ? (
          <Col span={24}>
            <Row className="passbook">
              <Col span={24}>
                {(transactions && transactions.length)
                  ? transactions.map((item, index) => (
                    <Row
                      key={item.id}
                      className="txn-details"
                    >
                      <Col span={24}>
                        <Row
                          align="top"
                          justify="space-between"
                        >
                          <Col>
                            <Row>
                              <Col>
                                <Text className="txn-title">
                                  {item.title ? item.title : '--'}
                                </Text>
                              </Col>
                            </Row>
                            {item.summaryType === 'RCH' ? (
                              <>
                                <Row>
                                  <Col>
                                    <Text className="txn-ref">
                                      Ref no:&nbsp;
                                      {item.referenceId}
                                    </Text>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <Text className="txn-date">
                                      {item.txnEndTime ? item.txnEndTime : '--'}
                                    </Text>
                                  </Col>
                                </Row>
                                {item.invoiceLink ? (
                                  <Row>
                                    <Col>
                                      <a
                                        href={item.invoiceLink}
                                        className="download-invoice"
                                        onClick={():void => {
                                          pushClevertapEvent('Special Click',
                                            {
                                              Type: 'Download Acknowledgement Receipt',
                                            });
                                        }}
                                      >
                                        Download Invoice
                                      </a>
                                    </Col>
                                  </Row>
                                ) : null}
                              </>
                            ) : null}
                          </Col>
                          <Col className="txn-amount">
                            {item.summaryType === 'RCH' && item.totalCredits
                              ? (
                                <Text>
                                  - ₹
                                  {item.totalCredits}
                                </Text>
                              ) : null}
                          </Col>
                        </Row>
                        {index === (transactions.length - 1)
                          ? <Waypoint onEnter={():Promise<void> => getMoreData()} /> : null}
                      </Col>
                    </Row>
                  )) : (
                    <Row
                      className="txn-details empty-state"
                    >
                      <Col span={24} className="flex-all-center">
                        No Recent Transactions
                      </Col>
                    </Row>
                  )}
              </Col>
            </Row>

            {dataLoading
              ? (
                <Row className="p-top-sm">
                  <Col span={24} className="display-flex flex-justify-content-center">
                    <Spin className="at-mobile-spinner" indicator={<Loading3QuartersOutlined style={{ fontSize: '2rem' }} spin />} />
                  </Col>
                </Row>
              )
              : null}
          </Col>
        ) : null
      }
    </Row>
  );
};

export default MobileMyPlanHelper;
