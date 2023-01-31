import Container from 'components/Layout/Container';
/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
import AppConstants from 'constants/constants';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import {
  PricingPlanType, PricingStatsType, TitleType,
} from 'screens/authenticated/jobPostingStep4/commonTypes';
import PricingPlansPage from 'screens/authenticated/jobPostingStep4/PricingPlansPage.component';
import { OrgOfficesListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { getPricingInfoAPI } from 'service/login-service';
import { getOrgDetails, getOrgPricingStats } from 'service/organization-service';
import { getFlatOrgData, OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { Row } from 'antd';
import { fetchAllJobs } from 'service/job-posting-service';

require('screens/authenticated/jobPostingStep4/JobPostingStep4.less');

const getPricingStats = async (id):
Promise<PricingStatsType | null> => {
  const apiCall = await getOrgPricingStats(id);
  const response = await apiCall.data;
  return response;
};

interface IPricingState {
  type: string;
  featuredCredits: number;
  planId: number | undefined | null;
  upgraded: boolean;
}

const getOrgLocations = (offices): OrgOfficesListType[] => offices.map((item) => ({
  address: item.address,
  id: item.id,
  formattedAddress: item.formattedAddress,
  mapsLink: `https://maps.google.com/?q=${item.location}`,
  placeId: item.placeId,
}));

const PricingPlansView = (props): JSX.Element => {
  const [, setOrgPricingStats] = useState<PricingStatsType | undefined>();
  const [basePlans, setBasePlans] = useState<Array<PricingPlanType>>([]);
  const [addOns, setAddOns] = useState<Array<PricingPlanType>>([]);
  const [currentPlan, setCurrentPlan] = useState<PricingPlanType>();
  const [orgData, setOrgData] = useState<OrganizationDetailsType>({
    id: '',
    managers: [],
    offices: [],
  });
  const [pricingState, setPricingState] = useState<IPricingState>({} as IPricingState);
  const [state, setState] = useState<any>({
    pricingPlansInfo: [],
    selectedPlan: 1,
    upgraded: false,
    orgLocations: getOrgLocations((orgData && orgData.offices) || []),
  });

  const getOrgData = async (): Promise<void> => {
    const apiCall = await getOrgDetails();
    if (apiCall) {
      const response = await apiCall.data;
      const flatOrgData = getFlatOrgData(response);
      setOrgData(flatOrgData);
      setState((prevState) => ({
        ...prevState,
        orgLocations: getOrgLocations((flatOrgData && flatOrgData.offices) || []),
      }));
    }
  };

  const fetchPricingPlans = async (): Promise<void> => {
    const response = await getPricingInfoAPI(true);
    if (response && response.MONETIZATION_PLANS) {
      const filteredBasePlans = response.MONETIZATION_PLANS.filter((plan: PricingPlanType) => plan.plan_type === 'BP' && plan.name !== 'BASE_PLAN_FREE');
      filteredBasePlans.sort((prev, curr) => prev.unit_cost - curr.unit_cost);
      setBasePlans(filteredBasePlans);
      const filteredAddOnPlans = response.MONETIZATION_PLANS.filter((plan: PricingPlanType) => plan.plan_type === 'TUP');
      setAddOns(filteredAddOnPlans);

      setState((prevState) => ({
        ...prevState,
        pricingPlansInfo: filteredBasePlans,
      }));
    }
  };

  const fetchOrgPricingStats = async (): Promise<void> => {
    const response = orgData && orgData.id ? await getPricingStats(orgData.id) : null;
    if (response) {
      setCurrentPlan(response.pricing_stats.plan_wise_pricing_stats[0]);
      setOrgPricingStats(response);
    }
    fetchPricingPlans();
  };

  const continueAsFreeHandler = (): void => {
    router.Router.pushRoute('CompanyProfile');
  };

  const trackPricingInfo = async (): Promise<void> => {
    const jobs = await fetchAllJobs();
    if (jobs?.data?.objects?.length === 1) {
      setPricingState((prev) => ({
        ...prev,
        type: 'NEW_USER',
      }));
    } else if (jobs?.data?.objects?.length > 1) {
      // initPricingStat();
    }
  };

  const getTitle = (): TitleType => {
    const planTitle: TitleType = {
      title: `Your Current Plan is ${currentPlan?.display_name}`,
      description: 'Upgrade to a new plan that suits your requirements' || null,
    };
    return planTitle;
  };

  useEffect(() => {
    if (!orgData.id) {
      getOrgData();
    } else {
      fetchOrgPricingStats();
    }
    trackPricingInfo();
  }, [orgData]);

  return (
    <>
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
      <Container>
        <PricingPlansPage
          orgOffices={state.orgLocations}
          continueAsFreeHandler={continueAsFreeHandler}
          plans={basePlans}
          addOns={addOns}
          title={getTitle()}
          currentPlan={currentPlan}
        />
      </Container>
    </>
  );
};

export default PricingPlansView;
