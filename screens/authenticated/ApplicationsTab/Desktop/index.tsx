import { Col, Row, Tabs } from 'antd';
import ApplicationFilterContainer from 'components/Candidates/ApplicationsFilterContainer';
import DatabaseFilterContainer from 'components/Candidates/DatabaseFilterContainer';
import DownloadsPage from 'components/Candidates/DownloadsPage';
import UnlockContext from 'components/Context/UnlockContext';
import Container from 'components/Layout/Container';
import NoCredits from 'components/StaticPages/Common/NoCredits';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import config from 'config';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import Script from 'next/script';
import React, { useContext, useEffect, useState } from 'react';
import { CandidateFiltersType } from 'screens/authenticated/ApplicationsTab/Common/Candidates.type';
import ApplicationsTabDesktopScreen from 'screens/authenticated/ApplicationsTab/Desktop/ApplicationTab';
import DatabaseTab from 'screens/authenticated/ApplicationsTab/Desktop/DatabaseTab';
import { getOrganizationData } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { getPricingStats } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { setUrlParams } from 'service/url-params-service';
import usePersistedState from 'utils/usePersistedState';

const { TabPane } = Tabs;
const applicationTabs = ['applications', 'database'];

interface IProps{
  jobId:any
  filter:any
}

const CandidatesDesktopScreen = (props: IProps): JSX.Element => {
  const { jobId, filter } = props;

  const { page, ...remFilter } = filter;

  let tempParams = [] as any;
  if ('filter' in remFilter) {
    if (typeof (remFilter.filter) === 'string') { tempParams.push(remFilter.filter); } else { tempParams = remFilter.filter; }
  } else {
    tempParams = Object.keys(remFilter);
  }

  const contactContext = useContext(UnlockContext);
  const [orgData, setOrgData] = usePersistedState('org_data', '');
  const [selectedTab, setSelectedTab] = useState('');
  const [pageNum, setpageNum] = useState(filter.page);
  const [applicationState, setApplicationState] = useState<CandidateFiltersType>({
    jobId,
    filter: remFilter ? tempParams : [],
  });
  const [databaseState, setDatabaseState] = useState<CandidateFiltersType>({
    jobId,
    filter: remFilter ? tempParams : [],
    jobTitle: '',
  });
  // flag to render the Donwloads Page
  const [downloadsVisible, setDownloadsVisible] = useState(false);

  const [stats, setStats] = useState({} as any);

  const handleApplicationFilter = (filterObj): void => {
    setpageNum(1);
    setApplicationState((prevState) => ({
      ...prevState,
      ...filterObj,
    }));
    setDatabaseState((prevState) => ({
      ...prevState,
      jobId: filterObj.jobId,
    }));
  };
  const handleApplicationPage = (filterObj):void => {
    setpageNum(filterObj.page);
  };

  const handleDatabaseFilter = (filterObj): void => {
    const filterObjFilters = filterObj.filter
      ? filterObj.filter.map((f) => ({ [f]: true } as any))
      : [];
    const databaseStateFilters = databaseState.filter
      ? databaseState.filter?.map((f) => ({ [f]: true } as any))
      : [];
    const params = [
      ...filterObjFilters,
      ...databaseStateFilters,
    ];
    setDatabaseState((prevState) => ({
      ...prevState,
      ...filterObj,
    }));
    setApplicationState((prevState) => ({
      ...prevState,
      jobId: filterObj.jobId,
    }));
    if (filterObj.jobId) {
      if (params) {
        params.push({ job: filterObj.jobId, tab: 'database' });
      } else {
        return;
      }
    } else if (params) {
      params.push({ job: databaseState.jobId, tab: 'database' });
    } else {
      return;
    }
    if (!('filter' in filterObj)) {
      setDatabaseState((prevState) => ({
        ...prevState,
        filter: [],
      }));
    }
  };

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
    const data = await getPricingStats(orgResponse?.id);
    handleStatsContext(data?.pricing_stats?.total_pricing_stats);
    setStats(data?.pricing_stats?.total_pricing_stats);
  };

  const init = async (): Promise<void> => {
    if (orgData?.id) {
      const data = await getPricingStats(orgData?.id);
      handleStatsContext(data?.pricing_stats?.total_pricing_stats);
      setStats(data?.pricing_stats?.total_pricing_stats);
    }
  };

  const handleTabChange = (key): void => {
    if (key === 'database') {
      setApplicationState((prevState) => ({
        ...prevState,
        filter: [],
      }));
    }
    if (key === 'applications') {
      setDatabaseState((prevState) => ({
        ...prevState,
        filter: [],
      }));
    }
    setSelectedTab(key);
    setUrlParams([{ job: applicationState.jobId, tab: key }]);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams && urlParams.get('tab');
    const pageParam = urlParams && urlParams.get('page');
    if (pageParam) { setpageNum(parseInt(pageParam, 10)); } else { setpageNum(1); }

    if (tabParam && applicationTabs.includes(tabParam)) {
      setSelectedTab(tabParam);
    } else {
      setSelectedTab('applications');
    }
  }, []);

  useEffect(() => {
    if (!orgData) { setOrganizationData(); } else { init(); }
  }, []);

  useEffect(() => {
    if (selectedTab === 'applications') {
      setUrlParams([{
        filter: applicationState.filter, job: applicationState.jobId, page: pageNum, tab: 'applications',
      }]);
    } else if (selectedTab === 'database') {
      setUrlParams([{
        filter: databaseState?.filter, job: databaseState?.jobId, page: pageNum, tab: 'database',
      }]);
    }
  }, [applicationState, pageNum, databaseState, selectedTab]);

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Applications | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Applications | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      {/* Maps Start */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
      />
      {/* Maps End */}
      <Container>
        <UnverifiedEmailNotification />
        {downloadsVisible
          ? (
            <DownloadsPage
              orgId={orgData.id}
              setDownloadsVisible={setDownloadsVisible}
            />
          )
          : (
            <Row className="m-top-24" gutter={[24, 24]}>
              {
                stats?.JP?.remaining === 0 && (
                  <Col span={24}>
                    <NoCredits />
                  </Col>
                )
              }
              <Col span={8}>
                {
                  selectedTab === 'applications'
                    ? (
                      <ApplicationFilterContainer
                        context={contactContext}
                        updateFilter={handleApplicationFilter}

                      />
                    ) : null
                }
                {
                  selectedTab === 'database'
                    ? (
                      <DatabaseFilterContainer
                        context={contactContext}
                        updateFilter={handleDatabaseFilter}

                      />
                    ) : null
                }
              </Col>
              <Col span={16}>
                <Tabs
                  className="application-tablist"
                  activeKey={selectedTab}
                  onChange={handleTabChange}
                >
                  <TabPane tab="Applications" key="applications">
                    {
                      selectedTab === 'applications' ? (
                        <ApplicationsTabDesktopScreen
                          selectedTab={selectedTab}
                          applicationFilters={applicationState}
                          pageNum={pageNum}
                          updatePage={handleApplicationPage}
                          updateFilter={handleApplicationFilter}
                          context={contactContext}
                          setDownloadsVisible={setDownloadsVisible}
                          orgId={orgData.id}
                          orgName={orgData.name}
                        />
                      ) : null
                    }
                  </TabPane>
                  <TabPane tab="Database" key="database">
                    {
                      selectedTab === 'database' ? (
                        <DatabaseTab
                          selectedTab={selectedTab}
                          databaseFilters={databaseState}
                          updateFilter={handleDatabaseFilter}
                          orgId={orgData.id}
                          orgName={orgData.name}
                          context={contactContext}
                          setDownloadsVisible={setDownloadsVisible}
                        />
                      ) : null
                    }

                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          )}
      </Container>
    </>
  );
};
export default CandidatesDesktopScreen;
