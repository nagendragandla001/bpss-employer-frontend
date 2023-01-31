import {
  Row, Col, Card, Button, Typography, Dropdown, Menu, Space,
} from 'antd';
import React, { useState } from 'react';
import Router from 'next/router';
import { Waypoint } from 'react-waypoint';
import dayjs from 'dayjs';
import config from 'config';
import router from 'routes';
import { pushClevertapEvent } from 'utils/clevertap';
import AppConstants from 'constants/constants';
import CustomImage from 'components/Wrappers/CustomImage';
import AddMobileWalkinSlots from 'screens/authenticated/JobsTab/Mobile/addSlots';
import DuplicateJobModal from 'screens/authenticated/JobsTab/Common/DuplicateJobModal';
import {
  JobType, updateSlotsDataObjectType, OrgDetailsType, IJobsTabDispatch,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import ActiveBoost from 'screens/authenticated/JobsTab/Mobile/Components/ActiveBoost';
import PausedWarning from 'screens/authenticated/JobsTab/Mobile/Components/PausedWarning';
import UnApprovedKnowMore from 'screens/authenticated/JobsTab/Mobile/Components/UnApprovedKnowMore';
import ReOpenJob from 'screens/authenticated/JobsTab/Mobile/Components/ReopenJob';
import PremiumPromotion from 'screens/authenticated/JobsTab/Mobile/Components/PremiumPromotion';
import JobCardSkeleton from 'screens/authenticated/JobsTab/Mobile/Components/jobCardSkeleton';
import CloseJobModal from 'screens/authenticated/JobsTab/Common/CloseJobModal';
import { MobileShareDropDownMenuItems } from '../Common/ShareDropDownMenuItems';
import { MobileMoreDropDownMenuItems } from '../Common/MoreDropDownMenuItems';

const { Text, Paragraph } = Typography;

const stages = [
  {
    label: 'Applied',
    key: 'applied',
  },
  {
    label: 'Interviews',
    key: 'interviews',
  },
  {
    label: 'Selections',
    key: 'selected',
  },
];
const openStages = [{
  label: 'Applied',
  key: 'applied',
},
{ label: 'Database', key: 'database' },
];
interface PropsModel {
  jobsData: {jobs: Array<JobType>, jobsCount: number;}
  currentTab: string;
  dataLoading: boolean;
  remainingFreeCredits: number;
  remainingJPCredits: number;
  loggedInUserId: string;
  updateJobsData: (validTill: string, jobId: string) => void;
  getMoreJobsData: () => void;
  orgData: OrgDetailsType;
  updateJobsSlotsData: (updateObject:updateSlotsDataObjectType, jobId: string) => void;
  refresh: boolean;
  // setRefresh: (refresh:boolean)=>void;
  dispatch: (data: IJobsTabDispatch) =>void;
  planId:any;
}

const MobileJobCard: React.FunctionComponent<PropsModel> = (props: PropsModel) => {
  const {
    jobsData, dataLoading, currentTab,
    remainingFreeCredits, remainingJPCredits,
    loggedInUserId, updateJobsData, getMoreJobsData, orgData, updateJobsSlotsData,
    refresh, dispatch, planId,

  } = props;
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [closeJobModalFlag, setCloseJobModalFlag] = useState<boolean>(false);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const [duplicateJobModalFlag, setDuplicateJobModalFlag] = useState<boolean>(false);
  const [duplicateJobId, setDuplicateJobId] = useState<string | null>(null);

  const handleEdit = (job): void => {
    pushClevertapEvent('General Click', { Type: 'Edit Job', value: job.jobType });
    Router.push(`/employer-zone/job-posting/edit/${job.id}/job-specs`);
  };
  const handleAddSlot = (id, type): void => {
    pushClevertapEvent('General Click', { Type: 'Add slots', value: type });
    setSelectedId(id);
    setVisible(true);
  };

  const sharingPlatforms = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Linkedin', value: 'linkedIn' },
    { label: 'Twitter', value: 'twitter' },
    { label: 'Email JD', value: 'email' }];

  return (
    <>
      {
        dataLoading ? (
          <JobCardSkeleton currentTab={currentTab} />
        ) : (

          <Row className="jt-mobile-container">
            <Col span={24} className="m-show-results">
              {`Showing ${jobsData.jobsCount} jobs`}
            </Col>
            <Col span={24}>
              {
                jobsData.jobs.map((job, index) => (
                  <Card
                    key={job.id}
                    className="m-jt-card"
                    style={{ marginBottom: 16 }}
                    actions={[
                      <Space>
                        {
                          currentTab !== 'closed' && (
                            <Button
                              key="edit"
                              onClick={(): void => handleEdit(job)}
                              className="link-btn font-bold"
                              shape="round"
                              type="text"
                              size="small"
                              icon={<CustomImage src="/images/jobs-tab/m-edit.svg" width={24} height={24} alt="edit" />}
                            >
                              Edit
                            </Button>
                          )
                        }
                        {
                          currentTab === 'open'
                            && (
                              <>
                                <Dropdown
                                  // overlay={getShareDropDownMenuItems(job)}
                                  overlay={(
                                    <MobileShareDropDownMenuItems
                                      job={job}
                                    />
                                  )}
                                  trigger={['click']}
                                >
                                  <Button
                                    key="share"
                                    className="text-bold text-color link-btn"
                                    type="text"
                                    shape="round"
                                    size="small"
                                    icon={(
                                      <CustomImage
                                        src="/images/jobs-tab/m-share.svg"
                                        width={24}
                                        height={24}
                                        alt="share"
                                      />
                                    )}
                                  >
                                    Share
                                  </Button>
                                </Dropdown>
                                <Dropdown
                                  // overlay={getMoreDropDownMenuItems(job)}
                                  overlay={(
                                    <MobileMoreDropDownMenuItems
                                      job={job}
                                      currentTab={currentTab}
                                      setCloseJobModalFlag={setCloseJobModalFlag}
                                      setCloseJobId={setCloseJobId}
                                      setDuplicateJobModalFlag={setDuplicateJobModalFlag}
                                      setDuplicateJobId={setDuplicateJobId}
                                    />
                                  )}
                                >
                                  <Button
                                    key="more"
                                    className="text-bold text-color link-btn"
                                    type="text"
                                    shape="round"
                                    size="small"
                                    icon={(
                                      <CustomImage
                                        src="/images/jobs-tab/more-icon.svg"
                                        width={18}
                                        height={4}
                                        alt="share"
                                      />
                                    )}
                                  >
                                    &nbsp;
                                    More
                                  </Button>
                                </Dropdown>
                              </>
                            )
                        }
                        {(currentTab !== 'open' && currentTab !== 'drafts' && job.stage !== 'J_R') ? (
                          <Button
                            type="text"
                            className="link-btn font-bold"
                            onClick={():void => {
                              pushClevertapEvent('Special Click',
                                {
                                  Type: 'Duplicate Job',
                                  'Job Type': job.pricingPlanType,
                                  'Job State': currentTab,
                                });
                              setDuplicateJobModalFlag(true);
                              setDuplicateJobId(job.id);
                            }}
                          >
                            <CustomImage
                              src="/images/jobs-tab/duplicate-job-icon-24x24.svg"
                              height={15}
                              width={15}
                              alt="share Icon"
                              className="p-right-2"
                            />
                            Duplicate job
                          </Button>
                        ) : null}
                      </Space>,
                    ]}
                  >
                    <Row>
                      {
                        (currentTab === 'open' && job.pricingPlanType === 'JP') && (
                          <Col span={24}>
                            <Text className="m-jt-premium-banner">
                              <CustomImage src="/svgs/m-premium.svg" width={16} height={16} alt="Premium" />
                              FEATURED
                              {' '}
                            </Text>
                          </Col>
                        )
                      }
                      {
                        currentTab === 'open' && job.isActive && (
                          <Col span={24}>
                            <Text className="m-jt-active-banner">ACTIVE</Text>
                          </Col>
                        )
                      }

                      <Col span={24}>
                        <Button
                          type="link"
                          className="title-container p-all-0"
                          onClick={(): void => {
                            pushClevertapEvent('General Click', { Type: 'Job Title', value: job.jobType });
                            router.Router.pushRoute(`employer-zone/jobs/${job.id}/`);
                          }}
                        >
                          <Paragraph
                            ellipsis
                            className="text-large font-bold text-capitalize m-jt-card-title"
                          >
                            {job.title}
                          </Paragraph>
                        </Button>
                      </Col>
                      <Col span={24}>
                        <Text className="m-jt-card-subtitle">
                          {`${job.jobCityAndState ? job.jobCityAndState : job.location}${(job.totalLocations) > 0 ? ` - ${job.totalLocations} ${job.totalLocations === 1 ? 'locality' : 'localities'}`
                            : ''}`}
                        </Text>
                      </Col>
                      {
                        (currentTab === 'open' && job.banner === 'activeTip') && (
                          <ActiveBoost />
                        )
                      }
                      {
                        job.banner === 'pausedWarning' && (
                          <PausedWarning
                            job={job}
                            isPaused={false}
                            validTill={job.validTill}
                            pricingPlanType={job.pricingPlanType}
                            remainingFreeCredits={remainingFreeCredits}
                            remainingJPCredits={remainingJPCredits}
                            loggedInUserId={loggedInUserId}
                            jobId={job.id}
                            postedOn={dayjs(job.postedOn).format('DD MMM YYYY')}
                            jobTitle={job.title}
                            updateJobsData={updateJobsData}
                            orgId={orgData.orgId}
                          />
                        )
                      }
                      {
                        currentTab === 'paused' && (
                          <ReOpenJob
                            isPaused={false}
                            validTill={job.validTill}
                            pricingPlanType={job.pricingPlanType}
                            remainingFreeCredits={remainingFreeCredits}
                            remainingJPCredits={remainingJPCredits}
                            loggedInUserId={loggedInUserId}
                            jobId={job.id}
                            postedOn={dayjs(job.postedOn).format('DD MMM YYYY')}
                            jobTitle={job.title}
                            updateJobsData={updateJobsData}
                            orgId={orgData.orgId}
                          />
                        )
                      }
                      {
                        currentTab === 'unapproved' && (
                          <UnApprovedKnowMore
                            stage={job.stage}
                          />
                        )
                      }
                      {
                        currentTab === 'closed' && (
                          <Col span={24} style={{ marginTop: 16 }}>
                            <Row className="m-jt-closed-banner">
                              <Col className="m-v-auto">
                                <CustomImage
                                  src="/svgs/m-closed-tab.svg"
                                  width={32}
                                  height={32}
                                  alt="closed"
                                />

                              </Col>
                              <Col span={14} style={{ margin: 'auto 0' }}>
                                This job is now
                                {' '}
                                <span className="text-bold">Closed</span>
                              </Col>
                            </Row>
                          </Col>
                        )
                      }

                      <Col span={24} className="m-jt-total-applications">
                        {/* <Text className="m-jt-card-subtitle">
                          Total Applications:
                          {' '}
                          <span
                          className="text-bold text-color">
                          {job.applicationStats.totalApplications}</span>
                          {' '}
                        </Text> */}
                      </Col>
                      <Col span={24} style={{ marginBottom: 16 }}>
                        {currentTab === 'open' ? openStages.map((stage) => (
                          <Button
                            className="m-jt-application"
                            key={stage.key}
                            onClick={(): void => pushClevertapEvent('Special Click', {
                              Type: stage.key === 'database'
                                ? 'View Database'
                                : 'View Applications',
                              JobType: job.pricingPlanType,
                            })}
                          >
                            <Paragraph className="m-jt-application-label">
                              {stage.label}
                            </Paragraph>
                            <Paragraph className="m-jt-application-count">
                              <Paragraph>
                                {stage.key === 'applied'
                                  ? job.applicationStats.totalApplications
                                  : job.databaseRecommendationCount}
                              </Paragraph>
                            </Paragraph>
                          </Button>
                        ))
                          : stages.map((stage) => (
                            <Button
                              className="m-jt-application"
                              key={stage.key}
                              type="link"
                              onClick={(): void => pushClevertapEvent('Special Click', {
                                Type: 'View Applications',
                                JobType: job.pricingPlanType,
                              })}
                            >
                              <Row justify="center" align="middle" className="text-center">
                                <Col
                                  span={24}
                                  className="m-jt-application-label"
                                >
                                  {stage.label}
                                </Col>
                                <Col
                                  span={24}
                                  className="m-jt-application-count"
                                >
                                  {job.applicationStats[stage.key]}
                                </Col>
                              </Row>
                            </Button>
                          ))}
                      </Col>
                      {
                        (job.jobType === 'NCAR' && currentTab !== 'closed' && currentTab !== 'paused') && (
                          <Col span={24}>
                            <Row style={{ paddingTop: 8, paddingBottom: 16 }}>
                              <Col span={2} className="m-v-auto">
                                <CustomImage
                                  src="/images/jobs-tab/m-calendar.svg"
                                  width={23}
                                  height={24}
                                  alt="calendar"
                                />
                              </Col>
                              <Col span={22} className="p-left-8">
                                {
                                  job.recentSlot === '' ? (
                                    <Row justify="space-between">
                                      <Col className="text-red m-v-auto">No Interview Slots Available</Col>
                                      <Col>
                                        <Button
                                          type="primary"
                                          className="br-4"
                                          onClick={(): void => handleAddSlot(job.id, job.jobType)}
                                        >
                                          Add Slots
                                        </Button>
                                      </Col>
                                    </Row>
                                  ) : (
                                    <Row>
                                      <Col span={24} className="m-jt-semi-label">
                                        Next Walk-in Slots
                                      </Col>
                                      <Col span={24} className="m-jt-bold-label">
                                        {job.recentSlot}
                                      </Col>
                                    </Row>
                                  )
                                }
                              </Col>
                            </Row>
                          </Col>
                        )
                      }
                      {
                        (currentTab === 'open' && job.banner === 'premiumPromotion') && (
                          <PremiumPromotion
                            id={job.id}
                            plan={job.pricingPlanType}
                            remainingFreeCredits={remainingFreeCredits}
                            remainingJPCredits={remainingJPCredits}
                            refresh={refresh}
                            // setRefresh={setRefresh}
                            dispatch={dispatch}
                            planId={planId}
                          />
                        )
                      }
                    </Row>
                    {index === (jobsData.jobs.length - 1)
                      ? <Waypoint onEnter={():void => getMoreJobsData()} /> : null}
                  </Card>
                ))
              }
            </Col>
          </Row>
        )
      }
      {
        visible && (
          <AddMobileWalkinSlots
            visible={visible}
            closeModal={(): void => setVisible(false)}
            store={orgData}
            jobId={selectedId}
            updateJobsSlotsData={updateJobsSlotsData}
          />
        )
      }
      {
        closeJobModalFlag && (
          <CloseJobModal
            setCloseJobModalFlag={setCloseJobModalFlag}
            closeJobId={closeJobId}
            refresh={refresh}
            // setRefresh={setRefresh}
            dispatch={dispatch}
          />
        )
      }
      {duplicateJobModalFlag ? (
        <DuplicateJobModal
          setDuplicateJobModalFlag={setDuplicateJobModalFlag}
          duplicateJobId={duplicateJobId}
        />
      ) : null}
    </>
  );
};

export default React.memo(MobileJobCard);
