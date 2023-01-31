// - Employer Passbook Page Desktop
// - Created by Koushik on 28/07/2020

/* eslint-disable no-underscore-dangle */
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined';
import {
  Button, Card, Col, Collapse, Progress, Row, Skeleton, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import { pricingConstants } from 'constants/enum-constants';
import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Waypoint } from 'react-waypoint';
import { getSubscriptionStatus } from 'screens/authenticated/Passbook/MyPlanUtil';
import { getPassbookDetails, transactionDetails } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { getOrgDetails, getOrgPricingStats } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { has } from 'utils/common-utils';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';

require('screens/authenticated/Passbook/passbook.less');

interface StateInterface {
  dataLoading: boolean;
  passbookDetails: Array<transactionDetails>;
  orgId: string;
  totalTransactions: number;
  offset: number;
  totalRemaningJPCredits: number;
}

const { Text } = Typography;
const { Panel } = Collapse;

const Passbook = ():JSX.Element => {
  const [state, setState] = useState<StateInterface>({
    dataLoading: true,
    passbookDetails: [],
    orgId: '',
    totalTransactions: 0,
    offset: 0,
    totalRemaningJPCredits: 0,
  });
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [myPlans, setMyPlans] = useState<Array<PricingPlanType>>([]);

  const initData = async ():Promise<void> => {
    const apiCall = await getOrgDetails();
    if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
      const response = await apiCall.data;
      if (response && response.objects
        && Array.isArray(response.objects) && response.objects.length
        && response.objects[0]._id) {
        const pricingApiCall = await getOrgPricingStats(response.objects[0]._id);
        const pricingApiResponse = await pricingApiCall.data;

        if (!!pricingApiResponse && has(pricingApiResponse, 'pricing_stats.plan_wise_pricing_stats')
        && pricingApiResponse.pricing_stats.plan_wise_pricing_stats) {
          setMyPlans(pricingApiResponse.pricing_stats.plan_wise_pricing_stats);
        }

        const passbookData = await getPassbookDetails(response.objects[0]._id, 20, 0);
        setState((prevState) => ({
          ...prevState,
          dataLoading: false,
          passbookDetails: passbookData.transactions,
          orgId: response.objects[0]._id,
          totalTransactions: passbookData.noOfTransactions,
          totalRemaningJPCredits: (
            has(response.objects[0], '_source.org_pricing_stats.remaining_job_posting_credits')
            && response.objects[0]._source.org_pricing_stats.remaining_job_posting_credits) || 0,
        }));
      }
    }
    setState((prevState) => ({
      ...prevState,
      dataLoading: false,
    }));
  };

  const getPanelHeader = (plan: PricingPlanType): JSX.Element => (
    <Row
      align="middle"
      onClick={():void => {
        pushClevertapEvent('Special Click',
          {
            Type: 'Plan details',
            Plan: String(plan.display_name).toLocaleLowerCase(),
          });
      }}
    >
      <Col span={6}>
        <CustomImage
          src={`/images/my-plans/${plan.subscription_status === 'EXPIRED' ? 'expired-icon-plan-info' : 'icon-plan-info'}.png`}
          alt="Plan Info"
          height={75}
          width={87}
          // layout
          // style={{ objectFit: 'contain', maxWidth: '87px' }}
        />
      </Col>
      <Col span={9}>
        <Row>
          <Col span={24} className="plan-type">{plan.plan_type === 'BP' ? 'Plan Type' : 'Add-On'}</Col>
          <Col span={24}>
            <Text ellipsis className="plan-name">
              {String(plan.display_name).toLocaleLowerCase()}
            </Text>
          </Col>
        </Row>
      </Col>
      <Col span={9}>
        {/* 'Expires on' */}
        <Row align="middle" justify="start">
          <Col span={24} className="plan-expiry">
            {getSubscriptionStatus(plan)}
          </Col>
          <Col span={24}>
            <Link href="pricingPlans" as="employer-zone/pricing-plans/">
              <Button
                className="upgrade-plan"
                onClick={(): void => {
                  pushClevertapEvent('Upgrade Plan', {
                    Type: plan.auto_renew ? 'Upgrade Plan' : 'Buy More',
                    Plan: String(plan.display_name).toLocaleLowerCase(),
                    PlanId: plan?.id,
                  });
                }}
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

  const getMoreData = async ():Promise<void> => {
    if (requestInProgress || (state.totalTransactions <= state.passbookDetails.length)) return;
    setRequestInProgress(true);
    const passbookData = await getPassbookDetails(state.orgId, 20, state.offset + 20);
    if (passbookData && passbookData.transactions
      && passbookData.transactions.length) {
      const newPassbookDetails = [...state.passbookDetails, ...passbookData.transactions];
      setState((prevState) => ({
        ...prevState,
        dataLoading: false,
        passbookDetails: newPassbookDetails,
        offset: prevState.offset + 20,
      }));
    }
    setRequestInProgress(false);
  };
  // eslint-disable-next-line consistent-return

  useEffect(() => {
    initData();
  }, []);

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`My Plan | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`My Plan | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <div className="my-plans-container">
        <Container>
          <Row className="passbook-container" gutter={76}>
            <Col span={24}>
              <UnverifiedEmailNotification />
            </Col>
            {/* My Plans */}
            <Col xs={{ span: 24 }} lg={{ span: 12 }}>
              <Row>
                <Col span={24} className="header">
                  <Text>My Plans</Text>
                </Col>
                {state.dataLoading
                  ? <Col span={24}><Skeleton active /></Col>
                  : (
                    <Col span={24}>
                      {
                        myPlans.length > 0 ? (
                          <Collapse
                            ghost
                            expandIcon={({ isActive }): JSX.Element => (
                              <CaretRightOutlined rotate={isActive ? 90 : 0} />
                            )}
                            expandIconPosition="end"
                            className="my-plans-collapse"
                          >
                            {
                              myPlans?.map((plan: any) => (
                                <Panel
                                  key={plan.id}
                                  className={plan.subscription_status === 'EXPIRED' ? 'expired-plan' : 'active-plan'}
                                  header={getPanelHeader(plan)}
                                >
                                  <Row>
                                    {
                                      plan.offering_subscription.map((offer) => (
                                        <React.Fragment key={Math.random()}>
                                          {(['CALL_HR', 'WI_JOBS'].indexOf(offer.offering_code) !== -1) ? null
                                            : (
                                              <Col span={24} key={offer.offering_code} className="plan-details">
                                                <Row gutter={16} align="middle">
                                                  <Col span={10}>
                                                    <Text className="text-semibold">
                                                      {pricingConstants[offer.offering_code]}
                                                    </Text>
                                                  </Col>
                                                  <Col span={10}>
                                                    <Progress
                                                      className="plan-progress"
                                                      percent={
                                                        ((offer.limit - offer.remaining_credits)
                                                      / offer.limit) * 100
                                                      }
                                                      showInfo={false}
                                                    />
                                                  </Col>
                                                  <Col span={4}>
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
                        ) : (
                          <Card>
                            <Row align="middle" justify="center">
                              <Col span={12} offset={6} className="text-bold">
                                No Plans Found
                              </Col>
                            </Row>
                          </Card>
                        )
                      }
                    </Col>
                  )}
              </Row>
            </Col>

            {/* Transactions */}
            <Col xs={{ span: 24 }} lg={{ span: 12 }}>
              <Row>
                <Col span={24} className="header">
                  <Text>Your Transactions</Text>
                </Col>
                <Col span={24}>
                  <Row justify="space-between" className="txn-header">
                    <Col span={12} className="">Recent Transactions</Col>
                    <Col span={12} className="text-right">Amount</Col>
                  </Row>
                  <Row className="passbook">
                    <Col span={24}>
                      {(state.passbookDetails && state.passbookDetails.length)
                        ? state.passbookDetails.map((item, index) => (
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
                                      <Row>
                                        <Col span={24}>
                                          <Text>
                                            ₹
                                            {item.totalCredits}
                                          </Text>
                                        </Col>
                                        <Col span={24}>
                                          <Text className="txn-ref">
                                            Closing balance:&nbsp;
                                            ₹
                                            {item.closingBalance}
                                          </Text>
                                        </Col>
                                      </Row>
                                    ) : null}
                                </Col>
                              </Row>
                              <Row
                                align="middle"
                                justify="space-between"
                              >
                                <Col>
                                  <Text className="txn-date">
                                    {item.txnEndTime ? item.txnEndTime : '--'}
                                  </Text>
                                </Col>
                              </Row>
                              {index === (state.passbookDetails.length - 1)
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
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Passbook;
