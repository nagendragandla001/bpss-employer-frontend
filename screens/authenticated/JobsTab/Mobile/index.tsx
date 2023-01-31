/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Loading3QuartersOutlined from '@ant-design/icons/Loading3QuartersOutlined';
import URLSearchParams from '@ungap/url-search-params';
import {
  Button, Spin, Tabs, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import AppConstants from 'constants/constants';
import { JobTabs } from 'constants/enum-constants';
import dayjs from 'dayjs';
import { UserDetailsType } from 'lib/authenticationHOC';
import Head from 'next/head';
import Router from 'next/router';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import { getOrganizationData } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { PricingStatsType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import {
  getFlatJobsData,
  getJobsStats,
  getOrganisationDetails, getPricingStats, IJobsTabData, IJobsTabDispatch, JobsStatsType, JobType,
  OrgDetailsType, updateSlotsDataObjectType,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import EmptyJobsLayout from 'screens/authenticated/JobsTab/Mobile/Components/EmptyJobsLayout';
import EmptyJobTab from 'screens/authenticated/JobsTab/Mobile/Components/EmptyJobTab';
import DraftJobCard from 'screens/authenticated/JobsTab/Mobile/DraftJobCard';
import MobileJobCard from 'screens/authenticated/JobsTab/Mobile/MobileJobCard';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobsTab/Mobile/JobsTabMobile.less');

const { TabPane } = Tabs;
const { Text } = Typography;
const JobStages = ['open', 'drafts', 'unapproved', 'paused', 'closed'];

export type OrgJobsStatsType= {
  dataLoaded: boolean;
} & JobsStatsType;

interface IProps{
  userDetails: UserDetailsType|null;
  state: IJobsTabData;
  dispatch: (data: IJobsTabDispatch) =>void;
}

const JobsTab = (props:IProps):JSX.Element => {
  const { userDetails, state, dispatch } = props;

  const handleChange = (key): void => {
    // setCurrentTab(key);
    dispatch({
      type: 'UPDATEJOBSTABSTATE',
      payload: {
        currentTab: key,
      },
    });
    pushClevertapEvent('General Click', { Type: 'Job State', value: key });
    router.Router.pushRoute('MyJobs', { tab: key });
  };

  const getJobsData = async (filter): Promise<void> => {
    const data = await getFlatJobsData(filter, 10, 0);
    dispatch({
      type: 'UPDATEJOBSTABSTATE',
      payload: {
        jobs: data.jobs,
        totalJobs: data.totalJobs,
        dataLoading: false,
        offset: 0,
      },
    });
  };

  const getMoreJobsData = async (): Promise<void> => {
    if (state.dataLoading) return;

    if (state.jobs.length < state.totalJobs) {
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          dataLoading: true,
        },
      });

      const data = await getFlatJobsData(state.currentTab, 10, state.offset + 10);

      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          jobs: [...state.jobs, ...data.jobs],
          totalJobs: data.totalJobs,
          dataLoading: false,
          offset: state.offset + 10,
        },
      });
    }
  };

  const initJobsStats = async (orgId: string) : Promise<void> => {
    const data = await getJobsStats(orgId);
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
            orgDataLoaded: true,
            orgHasNoJobs: false,
          },
        });
      } else {
        dispatch({
          type: 'UPDATEJOBSTABSTATE',
          payload: {
            dataLoading: false,
            orgHasNoJobs: true,
          },
        });
      }
    }
  };

  /**
 * Sets the Pricing and Unlock contacts info of the organisation
 * @returns {void}
 */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // eslint-disable-next-line consistent-return
  const initPricingAndUnlockInfo = async ():Promise<void|null> => {
  // used promise chain, so that it doesn't block jobs data
    const data = await getOrganisationDetails();
    let pricingData;
    if (data && data.orgId) {
      initJobsStats(data.orgId);
      // setOrgData(data);
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          ...data,
        },
      });
      pricingData = await getPricingStats(data.orgId);
    } else { return null; }

    if (pricingData) {
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          ...pricingData,
        },
      });
    }
  };

  const getTabLabel = (tab): JSX.Element => (
    <>
      {tab.label}
      {' '}
      <Text className="jobs-count">{state?.[tab.key]}</Text>
    </>
  );

  /**
 * Function to update the jobs data when a job is renewed
 * @param {string} validTill - new expiry date of job
 * @param {string} jobId - ID of the job to be updated
 * @returns {void}
 */
  const updateJobsData = (validTill:string, jobId:string):void => {
    let updatedJobsData:Array<JobType> = [];
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
      // setState((prevState) => ({
      //   ...prevState,
      //   jobsData: { ...prevState.jobsData, jobs: updatedJobsData },
      // }));
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          jobs: updatedJobsData,
        },
      });
    }
  };

  const handlePostJob = (): void => {
    Router.push('/employer-zone/job-posting/add/new/');
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

  useEffect(() => {
    initPricingAndUnlockInfo();
  }, [state.refresh]);

  useEffect(() => {
    if (state?.[state.currentTab]) {
      getJobsData(state.currentTab);
    }
  }, [state.currentTab,
    state.open,
    state.closed,
    state.paused,
    state.drafts,
    state.unapproved,
    state.refresh]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams && urlParams.get('tab');
    if (tabParam && JobStages.indexOf(tabParam) !== -1) {
      // setCurrentTab(tabParam);
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          currentTab: tabParam,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="m-jobs-tab">
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
      {/* Maps Start */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${config.MAPS_API_KEY_FRONTEND}&libraries=places`}
      />
      {/* Maps End */}
      <Container>
        {!state.dataLoading ? (
          <>
            {state.orgHasNoJobs ? (
              <>
                {/* Unverified Email Notification */}
                <UnverifiedEmailNotification />
                <EmptyJobsLayout
                  userDetails={userDetails}
                  handlePostJob={handlePostJob}
                />
              </>
            ) : (
              <>
                {/* Unverified Email Notification */}
                <UnverifiedEmailNotification />
                <Tabs
                  className="m-jt-tabs"
                  activeKey={state.currentTab}
                  onChange={handleChange}
                >
                  {
                    JobTabs.map((jobTab) => (
                      <TabPane tab={getTabLabel(jobTab)} key={jobTab.key} />
                    ))
                  }
                </Tabs>
                {/* Job cards  */}
                {/* TODO: Change the logic to as per new pricing plan
                      remainingFreeCredits,
                      remainingJPCredits
                        */}
                {
                  (state[state.currentTab] || !state.orgDataLoaded)
                    ? (
                      <>
                        {
                          state.currentTab !== 'drafts'
                            ? (
                              <MobileJobCard
                                currentTab={state.currentTab}
                                dataLoading={state.dataLoading}
                                jobsData={{
                                  jobs: state.jobs,
                                  jobsCount: state.totalJobs,
                                }}
                                remainingFreeCredits={
                                  state.pricing_stats?.total_pricing_stats?.JP?.remaining
                                  || 0
                                }
                                remainingJPCredits={
                                  state?.pricing_stats?.total_pricing_stats?.FJ?.remaining
                                  || 0
                                }
                                planId={state?.pricing_stats?.plan_wise_pricing_stats[0]?.id}
                                loggedInUserId={userDetails ? userDetails.userId : ''}
                                updateJobsData={updateJobsData}
                                getMoreJobsData={getMoreJobsData}
                                orgData={{
                                  orgId: state.orgId,
                                  offices: state.offices,
                                  managers: state.managers,
                                  contactsUnlocksLeft: state.contactsUnlocksLeft,
                                }}
                                updateJobsSlotsData={updateJobsSlotsData}
                                refresh={state.refresh}
                                // setRefresh={setRefresh}
                                dispatch={dispatch}
                              />
                            )
                            : (
                              <DraftJobCard
                                dataLoading={state.dataLoading}
                                jobsData={{
                                  jobs: state.jobs,
                                  jobsCount: state.totalJobs,
                                }}
                                getMoreJobsData={getMoreJobsData}
                              />
                            )
                        }
                      </>
                    ) : (
                      <EmptyJobTab currentTab={state.currentTab} />
                    )
                }
              </>
            ) }
            <Button
              type="primary"
              className="m-post-job"
              onClick={handlePostJob}
            >
              <CustomImage
                src="/svgs/post-a-job-icon24x24.svg"
                alt="Post A Job"
                className="p-right-8"
                width={24}
                height={24}
                // style={{ paddingRight: 8 }}
              />
              Post A Job
            </Button>
          </>
        ) : ''}
      </Container>

      {/* Loading State */}
      {state.dataLoading && state[state.currentTab]
        ? <Spin className="at-mobile-spinner" indicator={<Loading3QuartersOutlined style={{ fontSize: '2rem' }} spin />} />
        : null}
    </div>
  );
};

export default JobsTab;
