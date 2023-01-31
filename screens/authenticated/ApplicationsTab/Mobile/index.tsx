import { Tabs } from 'antd';
import UnlockContext from 'components/Context/UnlockContext';
import config from 'config';
import Script from 'next/script';
import React, { useContext, useEffect, useState } from 'react';
import router from 'routes';
import ApplicationsTabMobileScreen from 'screens/authenticated/ApplicationsTab/Mobile/ApplicationTab';
import DatabaseTab from 'screens/authenticated/ApplicationsTab/Mobile/DatabaseTab';
import { getOrganizationData } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { getPricingStats } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import usePersistedState from 'utils/usePersistedState';

const { TabPane } = Tabs;
const applicationTabs = ['applications', 'database'];
const CandidatesMobileScreen = (): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState('');
  const [orgData, setOrgData] = usePersistedState('org_data', '');
  const contactContext = useContext(UnlockContext);

  const handleStatsContext = (pricingStats): void => {
    if (pricingStats.APP_UL) {
      contactContext.setcontactUnlocksLeft(
        pricingStats.APP_UL.remaining,
      );
      contactContext.setTotalContactUnlocks(
        pricingStats.APP_UL.bought,
      );
    }
    if (pricingStats.DB_UL) {
      contactContext.setdatabaseUnlocksLeft(
        pricingStats.DB_UL.remaining,
      );
      contactContext.setTotalDatabaseUnlocks(
        pricingStats.DB_UL.bought,
      );
    }
  };

  const setOrganizationData = async (): Promise<void> => {
    const orgResponse = await getOrganizationData();
    setOrgData(orgResponse);
    const pricingStats = await getPricingStats(orgResponse?.id);
    handleStatsContext(pricingStats?.pricing_stats?.total_pricing_stats);
  };

  const init = async (): Promise<void> => {
    if (orgData?.id) {
      const data = await getPricingStats(orgData?.id);
      handleStatsContext(data?.pricing_stats?.total_pricing_stats);
    }
  };

  const handleTabChange = (key): void => {
    setSelectedTab(key);
    router.Router.pushRoute('Candidates', { tab: key });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams && urlParams.get('tab');
    if (tabParam && applicationTabs.includes(tabParam)) {
      setSelectedTab(tabParam);
    } else {
      setSelectedTab('applications');
    }
  }, []);

  useEffect(() => {
    if (!orgData) { setOrganizationData(); } else { init(); }
  }, []);

  return (
    <>

      {/* Maps Start */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
      />
      {/* Maps End */}
      <Tabs
        className="m-application-tablist"
        activeKey={selectedTab}
        onChange={handleTabChange}
      >
        <TabPane tab="Applications" key="applications">
          <ApplicationsTabMobileScreen
            context={contactContext}
            selectedTab={selectedTab}
            orgName={orgData.name}
          />
        </TabPane>
        <TabPane tab="Database" key="database">
          <DatabaseTab
            context={contactContext}
            selectedTab={selectedTab}
            orgId={orgData.id}
            orgName={orgData.name}
          />
        </TabPane>
      </Tabs>
    </>
  );
};
export default CandidatesMobileScreen;
