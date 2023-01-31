/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
import RightOutlined from '@ant-design/icons/RightOutlined';
import {
  Button, Card, Col, Divider, Popover, Progress, Row, Tag, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { interviewType } from 'constants/enum-constants';
import dayjs from 'dayjs';
import { UserDetailsType } from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import router from 'routes';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';

const VerificationModal = dynamic(() => import('screens/authenticated/JobDetails/Common/verifyNumber'), { ssr: false });
const JobCallHr = dynamic(() => import('screens/authenticated/JobDetails/Common/editCallHr'), { ssr: false });
const Coordinator = dynamic(() => import('screens/authenticated/JobDetails/Desktop/coordinator'), { ssr: false });
const JobCoordinator = dynamic(() => import('screens/authenticated/JobDetails/Desktop/editCoordinator'), { ssr: false });
const AddSlotsDrawer = dynamic(() => import('screens/authenticated/JobsTab/Desktop/addSlots/index'), { ssr: false });

const { Paragraph } = Typography;

interface layoutI {
  jobData: JobDetailsType
  slotdata: any;
  orgData:OrgDetailsType;
  patchrequest:(string)=>void;
  loggedInUserDetails:UserDetailsType|null;
  verifyModal :boolean;
}
interface MandDStateInterface{
  visible:boolean;
  job: any,
  type: 'addSlots' | 'jobExpiry' | 'jobPostingGuidelinesModal' | 'activeModal' | ''
}
interface RepeatSlots {
  label: string;
  value: string;
  disabled: boolean;
}

const createRepeatSlot = (slot): Array<RepeatSlots> => {
  const finalSlots = [] as Array<RepeatSlots>;

  if (slot && Array.isArray(slot) && slot.length > 0) {
    const dates = slot.map((d) => dayjs(d.d));
    const days = slot.map((d) => d.date);
    let startDate = dates[0];
    for (let i = 0; i < 7; i += 1) {
      finalSlots.push({
        label: startDate.format('ddd'),
        value: startDate.format('DD'),
        disabled: days.includes(startDate.format('DD')),
      });
      startDate = startDate.add(1, 'd');
    }
  }
  return finalSlots;
};

const renderInterviewDate = (dates): JSX.Element => (
  <Row justify="end">
    {
      dates.map((date) => (
        <Col>
          <Paragraph className="date-name" style={{ fontSize: '10px', width: '20px' }}>{date.label[0]}</Paragraph>
          <Tag key={date.date} className="jd-tag" color={date.disabled ? '#6487d9' : '#d8dfe0'}>
            <p style={{
              fontSize: '8px',
              margin: '0',

            }}
            >
              {date.value}
            </p>
          </Tag>
        </Col>
      ))
    }
  </Row>
);

const SideLayout = (props: layoutI): JSX.Element => {
  const {
    jobData, slotdata, patchrequest, orgData, loggedInUserDetails,
    verifyModal,
  } = props;

  const [coordinatorModal, setcoordinatorModal] = useState(false);
  const [callHr, setCallHr] = useState(false);
  const [OTPModal, setOTPModal] = useState(false);
  const [drawerAndModalInfo, setDrawerAndModalInfo] = useState<MandDStateInterface>({
    type: '',
    job: null,
    visible: false,
  });

  const patchrequestHandler = (msg): void => {
    if (msg === 'success') {
      patchrequest(msg);
    }
  };
  const updateSlot = (updateobj, jobId):void => {
    if (updateobj) { patchrequest('success'); }
  };

  return (
    <>
      <Row style={{ display: 'block' }} key={Math.random() + 1}>
        {slotdata.length > 0
          ? (
            <Card className="m-bottom-16 jd-side-layout-card" style={{ zIndex: 10 }}>
              <Col span={24} key={Math.random()} className="m-bottom-16">
                <Row className="jd-bold-layout" key={Math.random() + 2}>
                  <Col key={Math.random() + 3} span={4}>
                    <CustomImage
                      src="/images/job-details/jd-calendar-illustration.svg"
                      width={48}
                      height={48}
                      alt="calendar"
                    />
                  </Col>
                  <Col key={Math.random() + 4} className="jd-bold-layout" span={15}>
                    Interview Slots
                  </Col>
                  {jobData.jobState !== 'J_C' && jobData.jobState !== 'J_P' && jobData.jobStage !== 'J_R'
                    ? (
                      <Col key={Math.random() + 5}>
                        <Button
                          type="link"
                          onClick={():void => {
                            setDrawerAndModalInfo({
                              job: jobData.id,
                              type: 'addSlots',
                              visible: true,
                            });
                            pushClevertapEvent('Special Click', { Type: 'Add More Interview slot' });
                          }}
                          className="ct-edit-btn"
                          htmlType="submit"
                          icon={(
                            <CustomImage
                              src="/images/job-details/jd-add-slot.svg"
                              alt="open"
                              width={24}
                              height={24}
                            />
                          )}
                        />
                      </Col>
                    ) : null}
                </Row>
                <Divider />
                {slotdata.map((slot) => (
                  <Card className="jd-interview-border">
                    <Row key={slot.id}>
                      <Col span={24}>
                        <Row key={slot.id + 1}>
                          <Col span={12}>
                            <Row key={slot.id} className="jd-font-12">
                              {interviewType(slot.slotinterviewType)}
                              <Col key={slot.id + 2} span={24} className="jd-font-12">
                                {`${(slot.interviewStartDate.m)}
                            ${dayjs(slot.interviewStartTime).format('D MMM') !== slot.interviewEndDate.m ? `- ${(slot.interviewEndDate.m)}` : ' '}`}
                              </Col>
                              <Col key={slot.id + 3} span={24} className="jd-font-12">
                                {`${dayjs(slot.interviewStartTime).format('hh:mm A')} to ${dayjs(slot.interviewEndTime).format('hh:mm A')}`}
                              </Col>
                              <Col key={slot.id + 4} span={24} className="jd-font-12">
                                {` ${slot.interviewDuration} mins Interview`}
                              </Col>
                            </Row>
                          </Col>
                          <Row align="middle" justify="space-between">
                            <Col key={slot.id + 5}>
                              <Popover
                                title="POC Details"
                                className="text-small"
                                content={(
                                  <div className="text-small">
                                    <p style={{ marginBottom: 5 }}>
                                      {`Name : ${slot.pocName}`}
                                    </p>
                                    <p style={{ marginBottom: 0 }}>
                                      {`Contact : ${slot.pocContact}`}
                                    </p>

                                  </div>
                                )}
                              >
                                <button
                                  type="button"
                                  className="text-small jd-details-interview-btn "
                                >
                                  Details
                                </button>
                              </Popover>
                            </Col>
                            <Col span={14}>
                              {renderInterviewDate(createRepeatSlot(
                                slot.interviewDates,
                              ))}
                              {/* {slot.interviewDates.length > 6
                              ? renderInterviewDate(createRepeatSlot(
                                slot.interviewDates.slice(0, 6),
                              ))
                              : renderInterviewDate(slot.interviewDates)} */}
                            </Col>
                          </Row>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Col>
            </Card>
          ) : (jobData.appliedJobType === 'NCAR'
            ? (
              <Col span={24} key={Math.random() + 6} className="m-bottom-16">
                <Card
                  className="jd-side-layout-card"
                  style={{ zIndex: 10 }}
                >
                  <Row key={Math.random()} align="middle">
                    <Col key={Math.random() + 7} span={4} push={1} style={{ marginTop: '1rem' }}>
                      <CustomImage src="/images/job-details/jd-empty-calendar-illustration.svg" width={32} height={32} alt="calendar" />
                    </Col>
                    <Col key={Math.random() + 8} className="jd-bold-layout" span={15}>
                      Interview Slots
                    </Col>
                  </Row>
                  <Divider />
                  <Row justify="center" key={Math.random() + 9}>
                    <CustomImage
                      src="/svgs/empty-interview-slots.svg"
                      width={64}
                      height={64}
                      alt="empty-slots"
                    />
                  </Row>
                  <Row key={Math.random() + 10} justify="center" className={jobData.jobStage === 'J_UA' ? 'jd-red' : ''}>
                    No Interview Slots Available
                  </Row>
                </Card>

                {jobData.jobState !== 'J_C' && jobData.jobState !== 'J_P' && jobData.jobStage !== 'J_R'
                  ? (
                    <Row key={Math.random() + 11} className="jd-slots-btn">
                      <Button
                        type="primary"
                        className="m-jobdetails-submit-btn"
                        onClick={():void => {
                          setDrawerAndModalInfo({
                            job: jobData.id,
                            type: 'addSlots',
                            visible: true,
                          });
                          pushClevertapEvent('Special Click', { Type: 'Add New Interview slot' });
                        }}
                      >
                        Add Interview Slots
                      </Button>
                    </Row>
                  ) : null}

              </Col>
            ) : (
              <Col key={Math.random() + 12} span={24} className="m-bottom-16">
                <Card
                  className="jd-side-layout-card"
                  style={{ zIndex: 10 }}
                >
                  <Row className="jd-bold-layout" key={Math.random()}>
                    <Col key={Math.random() + 13} span={4}>
                      <CustomImage
                        src="/images/job-details/jd-calendar-illustration.svg"
                        width={48}
                        height={48}
                        alt="calendar"
                      />
                    </Col>
                    <Col key={Math.random() + 14} className="jd-bold-layout" span={15}>
                      Interview Slots
                    </Col>
                  </Row>
                  <Divider />
                  <Row justify="center" key={Math.random() + 15}>
                    <CustomImage
                      src="/svgs/empty-interview-slots.svg"
                      width={64}
                      height={64}
                      alt="empty-slots"
                    />
                  </Row>
                  <Row justify="center" key={Math.random() + 16} className="m-bottom-16" style={{ color: '#5b787c', marginTop: '0.5rem' }}>
                    Add interview slots
                  </Row>
                </Card>
              </Col>
            )
          )}

        {jobData.shareContact
          ? (
            <Col key={Math.random() + 17} span={24} className="m-bottom-16">
              <Card className="jd-call-hr">
                <Row className="display-flex" key={Math.random() + 18}>
                  <Col key={Math.random() + 19}>
                    <CustomImage
                      src="/images/job-details/jd-call-hr.svg"
                      width={48}
                      height={48}
                      alt="call-hr"
                    />
                  </Col>
                  <Col key={Math.random() + 20} style={{ marginTop: '-10px' }}>
                    <Row className="jd-bold-layout" key={Math.random() + 21}>
                      Call HR Enabled
                      <CustomImage
                        src="/images/job-details/jd-callhr-tick.svg"
                        width={24}
                        height={24}
                        alt="call-hr"
                      />
                    </Row>
                    <Row className="jd-subheading" key={Math.random() + 22}>
                      Jobseekers can call you directly
                    </Row>
                  </Col>
                  <Col
                    key={Math.random() + 23}
                    style={{ marginLeft: '0.5rem' }}
                    className={jobData.jobState === 'J_C' ? 'jd-edit-cancel' : 'hide'}
                  >
                    <Button
                      type="link"
                      icon={(
                        <CustomImage
                          src="/images/job-details/jd-edit.svg"
                          width={18}
                          height={18}
                          alt="edit"
                        />
                      )}
                      onClick={(): void => {
                        setCallHr(true);
                        pushClevertapEvent('Call HR', { Type: 'Edit' });
                      }}
                      className="ct-edit-btn"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          ) : (
            <Col key={Math.random() + 24} span={24} className="m-bottom-16">
              {verifyModal
                ? (
                  <>
                    <Card className="jd-side-layout-card">
                      <Row className="display-flex" key={Math.random() + 25}>
                        <Col key={Math.random() + 26} span={16}>
                          <span className="jd-bold-layout"> Want to recieve direct calls from jobseekers?</span>
                          <Paragraph className="jd-subheading">Verify your phone number and get applications over a phone call!</Paragraph>
                        </Col>
                        <Col key={Math.random() + 27} offset={2}>
                          <div className="vertical-img">
                            <CustomImage
                              src="/images/job-details/jd-call-hr.svg"
                              width={48}
                              height={48}
                              alt="call-hr"
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                    <Row style={{
                      backgroundColor: ' #e9fcfb', display: 'block', paddingLeft: '2px', marginTop: '0.5rem',
                    }}
                    >
                      <Button
                        type="link"
                        style={{ paddingLeft: '5px' }}
                        onClick={(): void => {
                          setOTPModal(true);
                          pushClevertapEvent('Call HR', { Type: 'Enable' });
                        }}
                      >
                        <span className="jd-verify-number-text">
                          Click here to verify your phone number and
                          {' '}
                          <b>Enable Call HR</b>
                        </span>
                        <RightOutlined className="right-arrow" />
                      </Button>
                      {OTPModal
                        ? (
                          <VerificationModal
                            modalVisible={OTPModal}
                            UserDetails={jobData.pointOfContact[0]}
                            closeModal={():void => { setOTPModal(false); }}
                            patchrequest={patchrequestHandler}
                            id={jobData.id}
                          />
                        )
                        : null}
                    </Row>
                  </>
                ) : (
                  <Card className="jd-side-layout-card">
                    <Row className="display-flex" key={Math.random()}>
                      <Col key={Math.random() + 28} span={16}>
                        <span className="jd-bold-layout"> Want to recieve direct calls from jobseekers?</span>
                        <Paragraph className="jd-subheading">Now get applications over a phone call!</Paragraph>
                      </Col>
                      <Col key={Math.random() + 29} offset={2}>
                        <CustomImage
                          src="/images/job-details/jd-call-hr.svg"
                          width={48}
                          height={48}
                          alt="call-hr"
                        />
                      </Col>

                    </Row>

                    <Row key={Math.random() + 30} style={{ marginTop: '0.6rem' }}>
                      <Button
                        type="primary"
                        onClick={(): void => {
                          setCallHr(true);
                          pushClevertapEvent('Call HR', { Type: 'Enable' });
                        }}
                        className="jd-callhr-btn"
                      >
                        Enable Call Hr
                      </Button>
                    </Row>
                  </Card>
                )}

            </Col>
          )}
        { jobData.banner === 'premiumPromotion' || jobData.banner === 'activeTip'
          ? (
            <Col key={Math.random() + 31} span={24} className="m-bottom-16">
              <Card className="jd-side-layout-card-clr">
                <Row key={Math.random()}>
                  <Col key={Math.random() + 32} span={11} className="jd-upgrade-app">
                    Get 3X
                    Applications!
                  </Col>
                  <Col key={Math.random() + 33} offset={6}>
                    <CustomImage
                      src="/images/jobs-tab/upgrade-banner-icon.svg"
                      width={34}
                      height={36}
                      alt="applications"
                    />
                  </Col>
                </Row>

                <Button
                  className="jd-upgrade-btn"
                  type="ghost"
                  onClick={(): void => {
                    router.Router.pushRoute(
                      'PricingSelection',
                      { id: jobData.id },
                    );
                    pushClevertapEvent('Special Click',
                      { Type: 'Feature Job', JobId: `${jobData.id}` });
                  }}
                >
                  <div className="p-right-2">
                    <CustomImage
                      src="/images/jobs-tab/trending-up-icon.svg"
                      alt="upgrade banner icon"
                      width={17}
                      height={10}
                      className="jd-feature-trending"
                    />
                    Promote this job
                  </div>
                </Button>

              </Card>
            </Col>
          )
          : null}
        <Col key={Math.random() + 38} span={24} className="m-bottom-16">
          <Card className="jd-side-layout-card jd-background">
            <Row key={Math.random() + 39}>
              <Col key={Math.random() + 40} span={14} className="jd-bold-layout">
                Job Coordinators
              </Col>

              <Col key={Math.random() + 41} offset={5} className={jobData.jobState === 'J_C' ? 'jd-edit-cancel' : 'hide'}>
                <Button
                  type="link"
                  icon={(
                    <CustomImage
                      src="/svgs/add-coordinator.svg"
                      width={24}
                      height={24}
                      alt="edit"
                    />
                  )}
                  onClick={(): void => {
                    setcoordinatorModal(true);
                    pushClevertapEvent('Job Coordinator', {
                      Type: 'Add',
                    });
                  }}
                  className="ct-edit-btn"
                />
              </Col>

            </Row>
            <Divider />
            <Coordinator jobdata={jobData} patchrequest={patchrequestHandler} />

          </Card>
        </Col>
        <Col key={Math.random() + 42} span={24} className="m-bottom-16">
          <Card className="jd-completion-card jd-background">
            <Row className="display-flex" key={Math.random()}>
              <Col key={Math.random() + 43} className="jd-bold-layout" style={{ marginTop: '0px' }}>
                Job Completion:
              </Col>

              <Col key={Math.random() + 44} offset={11} className="jd-completion-score">
                {jobData?.completionScore}
                %
              </Col>

              {jobData?.completionScore
                ? (
                  <>
                    <Progress
                      type="line"
                      // success={{ percent: jobData?.completionScore.toFixed() }}
                      percent={jobData?.completionScore}
                      className="jd-profile-progress"
                      showInfo={false}
                    />

                  </>
                ) : null}

            </Row>
            <Row className="jd-subheading" key={Math.random() + 45}>
              Created On :
              {' '}
              <span className="jd-subheading">{dayjs(jobData?.createdDate).format('D MMM YYYY')}</span>
            </Row>
            <Row className="jd-subheading" key={Math.random() + 46}>
              Last modified on :
              <span className="jd-subheading">{dayjs(jobData?.modifiedDate).format('D MMM YYYY')}</span>
            </Row>
          </Card>
        </Col>
      </Row>

      {
        coordinatorModal && jobData
          ? (
            <JobCoordinator
              visible={coordinatorModal}
              data={jobData}
              onCancel={(): void => { setcoordinatorModal(false); }}
              patchrequest={patchrequestHandler}
              orgdata={orgData}
            />
          ) : null
      }
      {
        callHr ? (
          <JobCallHr
            visible={callHr}
            data={jobData}
            onCancel={(): void => { setCallHr(false); }}
            patchrequest={patchrequestHandler}
            loggedInUserDetails={loggedInUserDetails}
          />
        ) : null
      }

      {drawerAndModalInfo.type === 'addSlots' && drawerAndModalInfo.job
        ? (
          <AddSlotsDrawer
            orgDetails={orgData}
            closeDrawer={():void => setDrawerAndModalInfo({ type: '', visible: false, job: null })}
            jobId={jobData.id}
            updateJobsSlotsData={updateSlot}
          />
        ) : null}
    </>
  );
};
export default SideLayout;
