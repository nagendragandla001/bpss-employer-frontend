/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
import {
  Button, Col, Row,
} from 'antd';
import { JobPostingPagePropsType } from 'common/commonInterfaces';
import Container from 'components/Layout/Container';
import AppConstants from 'constants/constants';
import has from 'lodash/has';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import ActivePlans from 'screens/authenticated/jobPostingStep4/activePlans';
import {
  JobPostingStep4StateType, PricingPlanType, PricingStatsType, TitleType,
} from 'screens/authenticated/jobPostingStep4/commonTypes';
import PricingPlansPage from 'screens/authenticated/jobPostingStep4/PricingPlansPage.component';
import { OrgOfficesListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { getPricingInfoAPI } from 'service/login-service';
import { getOrgDetails, getOrgPricingStats } from 'service/organization-service';

require('screens/authenticated/jobPostingStep4/JobPostingStep4.less');
require('lib/jobPostingHOC.less');

const getPricingStats = async (id):Promise<PricingStatsType | null> => {
  const apiCall = await getOrgPricingStats(id);
  const response = await apiCall.data;
  return response;
};

const getOrgLocations = (offices): OrgOfficesListType[] => offices.map((item) => ({
  address: item.address,
  id: item.id,
  formattedAddress: item.formattedAddress,
  mapsLink: `https://maps.google.com/?q=${item.location}`,
  placeId: item.placeId,
}));

const JobPostingFormStep4 = (props: JobPostingPagePropsType): JSX.Element => {
  const { orgstore, store, userDetails } = props;
  const nextRouter = useRouter();
  const [state, setState] = useState<JobPostingStep4StateType>({
    pricingPlansInfo: [],
    selectedPlan: 1,
    showActivePlans: false,
    showPricingPlansPage: false,
    showAddOns: false,
    showUpgradeFeatureJob: false,
    showUpgradeJP: false,
    upgraded: false,
    orgLocations: getOrgLocations((orgstore && orgstore.offices) || []),
  });
  const [orgPricingStats, setOrgPricingStats] = useState<PricingStatsType | undefined>();
  const [basePlans, setBasePlans] = useState<Array<PricingPlanType>>([]);
  const [addOns, setAddOns] = useState<Array<PricingPlanType>>([]);
  const [currentPlan, setCurrentPlan] = useState<PricingPlanType>();

  const checkUnverifiedEmail = async (): Promise<boolean> => {
    const apiCall = await getLoggedInUser();
    const userData = await apiCall.data;
    if (userData && userData.objects && userData.objects.length
      && userData.objects[0].email_verified) {
      return true;
    }
    return false;
  };

  const fetchPricingPlans = async (): Promise<void> => {
    const response = await getPricingInfoAPI(true);
    if (response && response.MONETIZATION_PLANS) {
      const filteredBasePlans = orgPricingStats?.pricing_stats.total_pricing_stats.FJ
        ? response.MONETIZATION_PLANS.filter((plan: PricingPlanType) => plan.plan_type === 'BP' && plan.name !== 'BASE_PLAN_FREE')
        : response.MONETIZATION_PLANS.filter((plan: PricingPlanType) => plan.plan_type === 'BP');
      filteredBasePlans.sort((prev, curr) => prev.unit_cost - curr.unit_cost);
      setBasePlans(filteredBasePlans);
      const filteredAddOnPlans = response.MONETIZATION_PLANS.filter((plan: PricingPlanType) => plan.plan_type === 'TUP');
      setAddOns(filteredAddOnPlans);

      setState((prevState) => ({
        ...prevState,
        showPricingPlansPage: true,
        pricingPlansInfo: filteredBasePlans,
      }));
    }
  };
  const fetchOrgPricingStats = async (): Promise<void> => {
    const orgResponse = await getOrgDetails();
    if ([200, 201, 202].includes(orgResponse.status)) {
      const response = await getPricingStats(orgResponse?.data?.objects?.[0]?._source?.id);
      if (response) {
        setCurrentPlan(response?.pricing_stats?.plan_wise_pricing_stats?.[0]);
        setOrgPricingStats(response);
      }
      if (response?.pricing_stats?.total_pricing_stats) {
        const ref = response.pricing_stats.total_pricing_stats;
        if (ref.JP && ref.JP.remaining > 0) {
          if (ref.FJ) {
            if (ref.FJ.remaining > 0) {
              // Enable Featured Jobs
              setState((prevState) => ({
                ...prevState,
                showActivePlans: true,
                showAddOns: false,
              }));
            } else {
              // Upgrade to Feature Job
              setState((prevState) => ({
                ...prevState,
                showUpgradeFeatureJob: true,
                showAddOns: true,
              }));
              fetchPricingPlans();
            }
          } else {
            // Continue as Free Plan
            setState((prevState) => ({
              ...prevState,
              showAddOns: true,
            }));
            fetchPricingPlans();
          }
        } else { // No JPs are available
          setState((prevState) => ({
            ...prevState,
            showUpgradeJP: true,
            showAddOns: false,
          }));
          fetchPricingPlans();
        }
      }
    }
  };

  const orgDetailsCompleteCheck = (orgData): boolean => orgData && orgData.name
  && orgData.type && !!orgData.industry && Object.keys(orgData.industry).length > 0;

  const continueAsFreeHandler = (): void => {
    if (orgDetailsCompleteCheck(orgstore) || checkUnverifiedEmail()) {
      if (nextRouter?.query?.id) {
        router.Router.pushRoute(
          'JobDetails',
          { id: nextRouter.query.id },
        );
      }
    } else {
      router.Router.pushRoute('CompanyProfile');
    }
  };

  const getTitle = (): TitleType => {
    const planTitle: TitleType = {
      title: `Your Current Plan is ${currentPlan?.display_name}`,
      description: 'Upgrade to a new plan that suits your requirements' || null,
    };
    if (state.showUpgradeFeatureJob) {
      planTitle.title = 'Upgrade to feature your job';
      planTitle.description = null;
    } else if (state.showUpgradeJP) {
      planTitle.title = 'You have reached the job post limit for your account';
      planTitle.description = 'Upgrade to a new plan to post more jobs';
    }

    return planTitle;
  };

  useEffect(() => {
    // if (store.pricingPlanType === 'JP') {
    //   router.Router.pushRoute(
    //     'MyJobs',
    //   );
    // } else {
    //   fetchOrgPricingStats();
    // }
    fetchOrgPricingStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Select Pricing Plan | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Select Pricing Plan | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {state.showPricingPlansPage ? (
        <>
          <PricingPlansPage
            orgOffices={state.orgLocations}
            continueAsFreeHandler={continueAsFreeHandler}
            plans={basePlans}
            title={getTitle()}
            currentPlan={currentPlan}
            addOns={state.showAddOns ? addOns : null}
          />
          <Row className="footer-container">
            <Container>
              <Row justify="end">
                <Col xs={{ span: 24 }} lg={{ span: 12 }} className="text-right">
                  <Button
                    className="text-bold br-2"
                    onClick={continueAsFreeHandler}
                  >
                    Continue with FREE plan
                  </Button>
                </Col>

              </Row>
            </Container>
          </Row>
        </>
      ) : null}

      {state.showActivePlans
        ? (
          <ActivePlans
            orgId={orgstore.id}
            orgPricingStats={orgPricingStats}
            setState={setState}
            jobStore={store}
            continueAsFreeHandler={continueAsFreeHandler}
            currentPlan={currentPlan}
          />
        ) : null}
    </div>
  );
};

export default JobPostingFormStep4;
