// - Employer Jobs Tab Desktop
// - Created by Koushik on 12/08/2020

import URLSearchParams from '@ungap/url-search-params';
import {
  Button, Col, Pagination, Radio, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import NoCredits from 'components/StaticPages/Common/NoCredits';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import AppConstants from 'constants/constants';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { UserDetailsType } from 'lib/authenticationHOC';
import Head from 'next/head';
import Script from 'next/script';
import React, { useEffect } from 'react';
import router from 'routes';
import {
  getFlatJobsData,
  getJobsStats, getOrganisationDetails,
  IJobsTabData,
  IJobsTabDispatch,
  JobsStatsType, JobType,
  updateSlotsDataObjectType,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import JobCards from 'screens/authenticated/JobsTab/Desktop/jobCards';
import SideLayout from 'screens/authenticated/JobsTab/Desktop/sideLayout';
import { getOrgPricingStats } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';
import EmptyJobs from './EmptyJobs';

require('screens/authenticated/JobsTab/Desktop/jobsTab.less');

dayjs.extend(calendar);

const { Text } = Typography;

interface StateInterface {
  jobs: JobType[],
  dataLoading: boolean,
  currentTab: string,
  showUnverifiedEmailNotification: boolean,
}

interface IProps{
  userDetails: UserDetailsType|null;
  state: IJobsTabData;
  dispatch: (data: IJobsTabDispatch) =>void;
}

export type OrgJobsStatsType = {
  dataLoaded: boolean;
} & JobsStatsType;

const Tabs = ['open', 'drafts', 'unapproved', 'paused', 'closed'];

const isNumeric = (value):boolean => /^-?\d+$/.test(value);

const JobsTab = (props:IProps): JSX.Element => {
  const { userDetails, state, dispatch } = props;

  const initJobsStats = (data) : void => {
    if (data) {
      let total = 0;
      const keys = Object.keys(data);
      for (let i = 0; i < keys.length; i += 1) {
        if (data[keys[i]]) {
          total += +data[keys[i]];
        }
      }
      if (total) {
        dispatch({
          type: 'UPDATEJOBSTABSTATE',
          payload: {
            ...data,
            dataLoaded: true,
          },
        });
      } else {
        dispatch({
          type: 'UPDATEJOBSTABSTATE',
          payload: {
            orgHasNoJobs: true,
          },
        });
      }
    }
  };

  // eslint-disable-next-line consistent-return
  const initPricingAndUnlockInfo = async ():Promise<void|null> => {
    // used promise chain, so that it doesn't block jobs data
    const data = await getOrganisationDetails();
    if (data?.orgId) {
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          ...data,
        },
      });

      const jobStatsCall = getJobsStats(data.orgId);
      const pricingStatsCall = getOrgPricingStats(data?.orgId);

      const jobStatsResponse = await jobStatsCall;
      const pricingStatsResponse = await pricingStatsCall;

      if (jobStatsResponse) {
        initJobsStats(jobStatsResponse);
      }

      if ([200, 201, 202].includes(pricingStatsResponse?.status)) {
        dispatch({
          type: 'UPDATEJOBSTABSTATE',
          payload: {
            ...pricingStatsResponse?.data,
          },
        });
      }
    }
  };
  /**
 * Sets the Pricing and Unlock contacts info of the organisation
 * @returns {void}
 */
  // const initPricingAndUnlockInfo = (): void => {
  //   // Used promise chain, so that it doesn't block jobs data
  //   // First we'll get the organisation Details and then verify
  //   // If the employer has posted any jobs or not
  //   // If he/she didn't post any jobs, we'll show welcome banner
  //   getOrganisationDetails()
  //     .then((data) => {
  //       if (data && data.orgId) {
  //         initJobsStats(data.orgId);
  //         setOrgDetails(data);
  //         return getNewPricingStats(data.orgId);
  //       }
  //       return null;
  //     })
  //     .then((data) => {
  //       if (data) {
  //         setPricingStats((prevState) => ({
  //           ...prevState,
  //           ...data,
  //         }));
  //       }
  //     });
  // };

  /**
 * Sets the Initial data in jobs Tab ( Open jobs and page 1 )
 * @returns {Promise<void>}
 */
  const initData = async (currentTab:string, offset:number): Promise<void> => {
    const data = await getFlatJobsData(currentTab || state.currentTab,
      state.limit, offset || state.offset);
    if (data && data.jobs && data.jobs.length) {
      dispatch({
        type: 'INITJOBSDATA',
        payload: {
          jobs: data.jobs,
          dataLoading: false,
          currentTab: currentTab || state.currentTab,
          totalJobs: data.totalJobs,
          offset,
        },
      });
    } else {
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          dataLoading: false,
        },
      });
    }
  };

  /**
 * Function which is used to get additional job data (when page changes) or jobs of another type
 * @param {string} tab - Type of jobs (open,closed,paused,drafts,unapproved)
 * @param {number} limit - limit on how many jobs to be returned at a time.
 * @param {number} offset - offset
 * @param {string} tabChange - tabs is changed or not
 * @returns {Promise<void>}
 */
  const getMoreJobData = async (tab: string, limit: number,
    offset: number, tabChange: boolean): Promise<void> => {
    window.scrollTo(0, 0); // Scrolls to top if the user is at the bottom of the page
    const data = await getFlatJobsData(tab, limit, offset);
    if (data?.jobs) {
      const { jobs } = data;
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          jobs,
          dataLoading: false,
          totalJobs: data.totalJobs,
          offset: tabChange ? 0 : offset,
        },
      });
    } else {
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          dataLoading: false,
        },
      });
    }
  };
  useEffect(() => {
    // Getting Params from the URL
    // No params - Open jobs tab will be showed
    let currentTab = '';
    let offset = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams && urlParams.get('tab');
    const pageNumberParam = urlParams && urlParams.get('page');
    if (tabParam && Tabs.indexOf(tabParam) !== -1) {
      currentTab = tabParam;
    }
    if (pageNumberParam && isNumeric(pageNumberParam) && +pageNumberParam > 0) {
      offset = state.limit * (+pageNumberParam - 1);
    }
    initPricingAndUnlockInfo();
    setTimeout(() => {
      initData(currentTab, offset);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.refresh]);

  /**
 * Function which is trigrred when change in radio button happens
 * @param {MouseEvent} event - mouse click event object
 * @returns {void}
 */
  const radioBtnChangeHandler = (event): void => {
    if (event && event.target && event.target.value) {
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          currentTab: event.target.value,
          dataLoading: true,
          totalJobs: 0,
        },
      });
      pushClevertapEvent('Special Click',
        {
          Type: 'Job State',
          value: event.target.value,
        });
      getMoreJobData(event.target.value, state.limit, 0, true);
      router.Router.pushRoute('MyJobs', { tab: event.target.value });
    }
  };

  /**
 * Function which handles the page changes ( common for top and bottom pagination )
 * @param {number} page - page number
 * @returns {void}
 */
  const pageChangeHandler = (page: number): void => {
    if (page) {
      let offset = 0;
      if (page > ((state.offset / state.limit) + 1)) {
        offset = state.offset
          + (
            state.limit * (
              page - (
                (state.offset / state.limit) + 1)));
      } else if (page < ((state.offset / state.limit) + 1)) {
        offset = state.offset
          - (
            state.limit * (
              (
                (state.offset / state.limit) + 1) - page));
      }
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          dataLoading: true,
        },
      });
      getMoreJobData(state.currentTab, state.limit, offset, false);
      router.Router.pushRoute('MyJobs', { tab: state.currentTab, page });
    }
  };

  /**
 * Function to update the jobs data when a job is renewed
 * @param {string} validTill - new expiry date of job
 * @param {string} jobId - ID of the job to be updated
 * @returns {void}
 */
  const updateJobsData = (validTill:string, jobId:string):void => {
    let updatedJobsData:Array<JobType> = [] as Array<JobType>;
    let updateDataFlag = false;
    if (!validTill) return;
    if (state.currentTab === 'paused' && jobId) {
      updatedJobsData = state.jobs.filter((item) => item.id !== jobId);
      updateDataFlag = true;
    } else if (state.currentTab === 'open' && jobId) {
      updatedJobsData = [...state.jobs];
      const index = updatedJobsData.findIndex(
        (item) => item.id === jobId,
      );
      if (index !== -1) {
        const dataCopy = {
          ...updatedJobsData[index],
          vaildTill: dayjs(validTill).format('DD MMM YYYY'),
          banner: 'activeTip',
        };
        updatedJobsData[index] = dataCopy;
        updateDataFlag = true;
      }
    }
    if (updateDataFlag) {
      if (state.currentTab === 'paused') {
        dispatch({
          type: 'UPDATEJOBSTABSTATE',
          payload: {
            paused: state.paused - 1,
          },
        });
      }
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          jobs: updatedJobsData,
        },
      });
    }
  };

  const updateJobsSlotsData = (updateObject:updateSlotsDataObjectType, jobId: string):void => {
    if (updateObject.startDate) {
      const updatedJobsData = [...state.jobs];
      const index = updatedJobsData.findIndex(
        (item) => item.id === jobId,
      );
      if (index !== -1) {
        const dataCopy = {
          ...updatedJobsData[index],
          recentSlot: dayjs(new Date(updateObject.startDate)).calendar(new Date()),
        };
        updatedJobsData[index] = dataCopy;
        dispatch({
          type: 'UPDATEJOBSTABSTATE',
          payload: {
            jobs: updatedJobsData,
          },
        });
      }
    }
  };

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Jobs | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Jobs | ${AppConstants.APP_NAME}`}
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
        {!state.dataLoading ? (
          <>
            {state.orgHasNoJobs ? (
              <Row className="greeting-layout">
                <Col span={24}>
                  <Row>
                    {/* Unverified Email Notification */}
                    {state.showUnverifiedEmailNotification ? (
                      <UnverifiedEmailNotification />
                    ) : ''}
                  </Row>
                  <Row>

                    <Col span={24} className="greeting" style={{ marginTop: 20 }}>
                      <Text>
                        {`Welcome ${userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : ''}, Let’s start building your team!`}
                      </Text>
                    </Col>
                  </Row>
                  <Row>

                    <Col span={24} className="greeting">
                      <CustomImage
                        src="/images/jobs-tab/welcome-banner.svg"
                        width={320}
                        height={164}
                        alt="welcome banner"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} className="post-a-job-btn">
                      <Button
                        type="primary"
                        onClick={(): void => router.Router.pushRoute('NewJobPosting')}
                      >
                        Start Posting Job
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            ) : (
              <Row>
                {
                  state?.pricing_stats?.total_pricing_stats?.JP?.remaining === 0 ? (
                    <Col span={24} className="m-top-12">
                      <NoCredits />
                    </Col>
                  ) : null
                }

                <Col span={24}>
                  <Row gutter={[24, 24]} className="jobs-tab-container" justify="space-between">
                    <Col span={16} className="main-layout">
                      {/* Unverified Email Notification */}
                      {state.showUnverifiedEmailNotification ? (
                        <UnverifiedEmailNotification />
                      ) : ''}
                      {/* Different Tabs and Top Pagination  */}
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Radio.Group value={state.currentTab} onChange={radioBtnChangeHandler} buttonStyle="solid" className="radio-group">
                            {Tabs.map((item) => (
                              <Radio.Button value={item} key={item}>
                                {item}
                                <Text className="font-bold color-charcoal-3 text-base stat">{state[item]}</Text>
                              </Radio.Button>
                            ))}
                          </Radio.Group>
                        </Col>
                        <Col className="text-small color-charcoal-8 top-pagination">
                          <Pagination
                            size="small"
                            current={(state.offset / state.limit) + 1}
                            pageSize={state.limit}
                            total={state.totalJobs}
                            showTotal={(totalrecord, range): string => `showing ${range[0]}-${range[1]} of ${totalrecord} jobs`}
                            showSizeChanger={false}
                            onChange={pageChangeHandler}
                          />
                        </Col>
                      </Row>
                      {/* Job cards  */}
                      {/* TODO: Change the logic to as per new pricing plan
                      remainingFreeCredits,
                      remainingJPCredits
                        */}
                      { (state[state.currentTab] || !state.dataLoading) ? (
                        <JobCards
                          jobs={state.jobs}
                          dataLoading={state.dataLoading}
                          currentTab={state.currentTab}
                          remainingFreeCredits={
                            state.pricing_stats?.total_pricing_stats?.JP?.remaining
                            || 0
                          }
                          remainingJPCredits={
                            state.pricing_stats?.total_pricing_stats?.JP?.remaining
                            || 0
                          }
                          loggedInUserId={userDetails ? userDetails.userId : ''}
                          updateJobsData={updateJobsData}
                          updateJobsSlotsData={updateJobsSlotsData}
                          orgDetails={{
                            orgId: state.orgId,
                            offices: state.offices,
                            managers: state.managers,
                            contactsUnlocksLeft: state.contactsUnlocksLeft,
                          }}
                          // setRefresh={setRefresh}
                          dispatch={dispatch}
                          refresh={state.refresh}
                          pricingStats={state.pricing_stats}
                        />
                      ) : (
                        <EmptyJobs tab={state.currentTab} />
                      )}
                    </Col>
                    <Col span={8}>
                      {/* Side Layout: Pricing Info & Unlock contacts Info */}
                      <SideLayout
                        pricingStats={state.pricing_stats?.total_pricing_stats}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col span={24}>
                  {/* Bottom Pagination */}
                  <Row className="jobs-tab-container" justify="space-between">
                    <Col className="main-layout bottom-pagination">
                      <Pagination
                        size="small"
                        current={(state.offset / state.limit) + 1}
                        pageSize={state.limit}
                        total={state.totalJobs}
                        hideOnSinglePage
                        showSizeChanger={false}
                        onChange={pageChangeHandler}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
          </>
        ) : ''}
      </Container>
    </>
  );
};

export default JobsTab;
