/* eslint-disable import/no-cycle */
import { Col, Row, Typography } from 'antd';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import AddOns from 'screens/authenticated/jobPostingStep4/addOns';
// import BuyCreditsDrawer from 'screens/authenticated/jobPostingStep4/buyCreditsDrawer';
import { PricingPlanType, TitleType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import MobilePricingPlans from 'screens/authenticated/jobPostingStep4/mobile/mobilePricingPlans';
// import PricingPlans from 'screens/authenticated/jobPostingStep4/pricingPlans';
import { OrgOfficesListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
// import { logEvent } from 'utils/analytics';
import Script from 'next/script';
import config from 'config';
import dynamic from 'next/dynamic';

const BuyCreditsDrawer = dynamic(() => import('screens/authenticated/jobPostingStep4/buyCreditsDrawer'), { ssr: false });
const PricingPlans = dynamic(() => import('screens/authenticated/jobPostingStep4/pricingPlans'), { ssr: false });

require('screens/authenticated/jobPostingStep4/pricingPlansPage.less');

const { Title, Text } = Typography;

interface PropsInterface {
  orgOffices:Array<OrgOfficesListType>;
  continueAsFreeHandler: () => void;
  plans: Array<PricingPlanType>;
  addOns: Array<PricingPlanType> | null;
  title: TitleType;
  currentPlan: PricingPlanType | undefined;
}
const PricingPlansPage1 = (props: PropsInterface): JSX.Element => {
  const {
    orgOffices, continueAsFreeHandler, plans, title, currentPlan, addOns,
  } = props;
  const [showBuyCreditDrawer, setShowBuyCreditDrawer] = useState<number|''>('');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanType>();

  // const logPricingSubmitEvent = (): void => {
  //   const trackObj = {
  //     category: 'job_post',
  //     action: 'pricing_plan_submit',
  //     label: 'pricing_plan',
  //     nonInteraction: false,
  //   };
  //   logEvent(trackObj);
  // };

  const buyingPlanHandler = (plan): void => {
    setSelectedPlan(plan);
    setShowBuyCreditDrawer(plan.id);
  };

  return (
    <>
      {/* Maps Start */}
      {/* <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
      /> */}
      {/* Maps End */}
      <Row className="pricing-plans-page">
        <Col className="title">
          <Title level={isMobile ? 4 : 2}>{title.title}</Title>
          {title.description ? <Text>{title.description}</Text> : null}
        </Col>
        <Col span={24}>
          {
            !isMobile ? (
              <PricingPlans
                plans={plans}
                buyingPlanHandler={buyingPlanHandler}
                isLoggedInPage
              />
            )
              : (
                <MobilePricingPlans
                  plans={plans}
                  buyingPlanHandler={buyingPlanHandler}
                  isLoggedInPage
                />
              )
          }

          {
            showBuyCreditDrawer ? (
              <BuyCreditsDrawer
                onCloseHandler={():void => setShowBuyCreditDrawer('')}
                orgOffices={orgOffices}
                productId={showBuyCreditDrawer}
                plan={selectedPlan}
              />
            ) : null
          }
        </Col>
        <Col span={24}>
          {
            addOns ? (<AddOns plans={addOns} buyingPlanHandler={buyingPlanHandler} />) : null
          }
        </Col>
      </Row>

    </>
  );
};

export default PricingPlansPage1;
