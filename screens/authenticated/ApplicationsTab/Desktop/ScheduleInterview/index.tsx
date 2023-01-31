/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined, RightOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import {
  Button, Col, Drawer, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { tConvert, videoType } from 'constants/enum-constants';
import moment from 'moment';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { CMSInterface, OrganizationDetailsType, recommmendTemplatesType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/scheduleInterview.less');

const ConfirmedWithCandidate = dynamic(() => import('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/ConfirmedWithCandidate'), { ssr: false });
const NotConfirmedWithCandidate = dynamic(() => import('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/NotConfirmedWithCandidate'), { ssr: false });
const SuggestedTemplates = dynamic(() => import('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/SuggestedTemplates'), { ssr: false });

const { Paragraph, Text } = Typography;
interface interviewI{
  closeModal:()=>void;
  orgDetails:OrganizationDetailsType;
  applicationId:string;
  recommenedTemplates: recommmendTemplatesType| null;
  jobId:string;
  candidateName: string;
  jobType:string;
  updateApplicationData: (id: string) => void;
  clevertype:string;
  cms: CMSInterface;
}
const ScheduleInterview = (props: interviewI): JSX.Element => {
  const {
    closeModal, orgDetails, applicationId, jobId, recommenedTemplates, candidateName,
    updateApplicationData, clevertype,
    jobType, cms,
  } = props;
  let startDate; let endDate; let duration; let start;
  let end; let pocName; let poccontact; let type; let interviewAddress;
  let startMonth; let endMonth;
  const [page, setPage] = useState(() => {
    if (recommenedTemplates) return 3;
    return 0;
  });
  const videoTypeFormat = ['HANG_VID', 'WHATSAPP_VID', 'VID', 'OTHER'];
  const successForCAR = ():void => {
    Modal.success({
      icon: false,
      okButtonProps: {
        type: 'default',
        className: 'invite-success',
      },
      content: (
        <div>
          <Paragraph className="invite-heading-top"> Interview Invite Sent!</Paragraph>
          <CustomImage
            src="/svgs/interviewInvite.svg"
            alt="second"
            width={48}
            height={48}
            className="interview-invite-top"
          />
          <div className="page-0-btn-divider title-divider" />
          <div style={{ marginBottom: '10px' }}>
            {type === 'FACE' ? <Paragraph className="invite-heading">Face to Face Interview slots</Paragraph> : ''}
            {videoTypeFormat.indexOf(type) > -1 ? <Paragraph className="invite-heading">Video Interview slots:</Paragraph> : ''}
            {type === 'TELE' ? <Paragraph className="invite-heading">Telephonic  Interview slots</Paragraph> : ''}
          </div>
          <Row style={{ marginBottom: '10px' }}>
            <CalendarOutlined style={{ marginRight: '10px' }} />
            {startDate}
            {startMonth === endMonth ? '' : startMonth}
            {endDate !== '' ? (
              <div>
                -
                {endDate}
                {endMonth}
              </div>
            ) : ''}
          </Row>
          <Row style={{ marginBottom: '10px' }}>
            <Col span={11}>
              <ClockCircleOutlined style={{ marginRight: '10px' }} />
              {start}
              -
              {end}
            </Col>
            |
            <Col span={8} style={{ marginLeft: '2px' }}>
              {duration || 60}
              {' '}
              mins each
            </Col>
          </Row>
          <Row style={{ marginBottom: '10px' }}>
            {videoTypeFormat.indexOf(type) > -1 ? (
              <div>
                <VideoCameraOutlined style={{ marginRight: '10px' }} />
                {videoType(type)}
              </div>
            ) : ''}
            {type === 'FACE' ? (
              <div className="m-r-10">
                <CustomImage src="/svgs/office.svg" alt="office" width={16} height={16} />
                {interviewAddress[0]}
              </div>
            ) : ''}
          </Row>
          <div className="m-r-10">
            {' '}
            <CustomImage src="/svgs/callbutton.svg" height={20} width={20} alt="contact" />
            Point of Contact:
            <Row style={{ paddingLeft: '2rem' }}>
              {pocName}
              {type === 'WHATSAPP_VID' || type === 'FACE' || type === 'TELE'
                ? (
                  <p>
                    (+91-
                    {poccontact}
                    )
                  </p>
                )
                : <Paragraph style={{ paddingLeft: '0.5rem' }}>{poccontact}</Paragraph>}
            </Row>
          </div>
        </div>),
      onOk() { },
    });
  };

  const info = ():void => {
    Modal.info({

      icon: false,
      okButtonProps: {
        type: 'default',
        className: 'invite-success',
      },
      content: (
        <div>
          <Paragraph className="m-carousel-content">Slots are already added</Paragraph>
        </div>
      ),
      onOk() { },
    });
  };

  const success = ():void => {
    Modal.success(
      {
        icon: false,
        okButtonProps: {
          type: 'default',
          className: 'invite-success',
        },
        content: (
          <div>
            <Paragraph className="m-carousel-content">Interview slots added!</Paragraph>
            <div className="invite-img">
              <CustomImage src="/svgs/slot.svg" height={200} width={200} alt="second" className="invite-img" />
              <Paragraph style={{ textAlign: 'center' }}>
                We’ve also sent out notification to all candidates waiting for interview slots
              </Paragraph>
            </div>
          </div>),
        onOk() {},
      },
    );
  };

  const handleNCAR = (data):void => {
    if (data === 'success') { success(); } else { info(); }
  };
  const handleinviteData = (msg, data?, address?):void => {
    // console.log(data);
    if (msg === 'success') {
      type = data[0].interview_type;
      duration = data[0].duration;
      startDate = (moment(data[0].date)).format('D');
      startMonth = (moment(data[0].date)).format('MMM');
      endMonth = data.length > 1 ? moment(data[data.length - 1].date).format('MMM') : '';
      endDate = data.length > 1 ? moment(data[data.length - 1].date).format('D') : '';
      start = tConvert(data[0].start);
      end = tConvert(data[0].end);
      interviewAddress = address;
      pocName = data[0].poc_data.name;
      poccontact = data[0].poc_data.contact;
      successForCAR();
    } else { info(); }
  };

  const getDrawerContent = ():JSX.Element|null => {
    if (page === 0) {
      return (
        <>
          <Row>
            <Col span={24}>
              <Paragraph className="body-title">Have you already fixed interview timings with Candidate?  </Paragraph>
            </Col>
          </Row>
          <Row className="p-top-24">
            <Col span={24}>
              <Button
                className="page-0-button"
                onClick={(): void => setPage(1)}
              >
                <Row align="middle" justify="space-between">
                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                    <CustomImage
                      src="/images/application-tab/AlreadyConfirmedIcon.svg"
                      alt="already confirmed icon"
                      width={48}
                      height={48}
                    />
                    <Text style={{ paddingLeft: 10 }}>
                      Yes, Already confirmed with candidate
                    </Text>
                  </Col>
                  <Col>
                    <RightOutlined />
                  </Col>
                </Row>
              </Button>
            </Col>
          </Row>
          <div className="page-0-btn-divider" />
          <Row>
            <Col span={24}>
              <Button
                className="page-0-button"
                onClick={(): void => setPage(2)}
              >
                <Row align="middle" justify="space-between">
                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                    <CustomImage
                      src="/images/application-tab/AddSlotsIcon.svg"
                      alt="add slots icon"
                      width={48}
                      height={48}
                    />
                    <Text style={{ paddingLeft: 10 }}>
                      No. Send timings to candidates
                    </Text>
                  </Col>
                  <Col>
                    <RightOutlined />
                  </Col>
                </Row>
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    if (page === 1) {
      return (
        <>
          <Row>
            <Col>
              <Button className="back-arrow-btn" onClick={():void => setPage(0)}>
                <ArrowLeftOutlined style={{ fontSize: '1.5rem' }} />
              </Button>
            </Col>
            <Col span={14}>
              <Row>
                <Col span={24}>
                  <Paragraph className="body-title">
                    If already confirmed with candidate,
                    <br />
                    add Interview details here
                  </Paragraph>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Paragraph className="body-sub-title">
                    We’ll send out interview reminders accordingly
                  </Paragraph>
                </Col>
              </Row>
            </Col>
            <Col span={8} className="page1-icon">
              <div className="p-right-sm">
                <CustomImage
                  src="/images/application-tab/AlreadyConfirmedIcon64x64.svg"
                  alt="add slots icon"
                  width={64}
                  height={64}
                />
              </div>
            </Col>
          </Row>
          <div className="page-0-btn-divider title-divider" />
          <Row>
            <Col span={24}>
              <ConfirmedWithCandidate
                orgDetails={orgDetails}
                applicationId={applicationId}
                invite={jobType === 'NCAR' ? handleNCAR : handleinviteData}
                updateApplicationData={updateApplicationData}
                closeModal={closeModal}
                candidateName={candidateName}
                clevertype={clevertype}
                cms={cms}
              />
            </Col>
          </Row>
        </>
      );
    }
    if (page === 2) {
      return (
        <>
          <Row>
            <Col>
              <Button className="back-arrow-btn" onClick={():void => setPage(0)}>
                <ArrowLeftOutlined style={{ fontSize: '1.5rem' }} />
              </Button>
            </Col>
            <Col span={14}>
              <Row>
                <Col span={24}>
                  <Paragraph className="body-title">
                    Tell us when you will be free to take interviews
                  </Paragraph>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Paragraph className="body-sub-title">
                    Candidates can see those timings and book accordingly
                  </Paragraph>
                </Col>
              </Row>
            </Col>
            <Col span={8} className="page1-icon">
              <div className="p-right-sm">
                <CustomImage
                  src="/images/application-tab/AddSlotsIcon64x64.svg"
                  alt="add slots icon"
                  width={64}
                  height={64}
                />
              </div>
            </Col>
          </Row>
          <div className="page-0-btn-divider title-divider" />
          <Row>
            <Col span={24}>
              <NotConfirmedWithCandidate
                orgDetails={orgDetails}
                applicationId={applicationId}
                jobId={jobId}
                invite={jobType === 'NCAR' ? handleNCAR : handleinviteData}
                updateApplicationData={updateApplicationData}
                closeModal={closeModal}
                jobtype={jobType}
                candidateName={candidateName}
                clevertype={clevertype}
                cms={cms}
              />
            </Col>
          </Row>
        </>
      );
    }
    if (page === 3) {
      return (
        <>
          <Row align="middle">
            <Col span={24}>
              <SuggestedTemplates
                slotsDetails={recommenedTemplates}
                closehandler={closeModal}
                updateApplicationData={updateApplicationData}
                clevertype={clevertype}
                applicationId={applicationId}
              />
            </Col>
          </Row>
          <Row align="middle" className="m-top-24">
            <Col span={24} style={{ textAlign: 'center' }}>
              <Paragraph>
                OR
              </Paragraph>
            </Col>
          </Row>
          <Row align="middle" className="m-top-24">
            <Col span={24} style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                className="add-new-timings-btn"
                onClick={():void => {
                  setPage(0);
                  pushClevertapEvent(clevertype, { Type: 'Another Interview Slot' });
                }}
              >
                Add Another Interview Slot
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return null;
  };

  return (
    // Drawer has multiple pages
    // page 0 : Asking employer to add slots or already confirmed with candidate,
    // page 1 : Already confirmed with candidate page
    // page 2 : Add Slots
    // page 3 : Suggest already added slots (page 0 will appear if there are no suggested slots)
    <Drawer
      visible
      width={680}
      className="schedule-interview-drawer"
      title={`Schedule Interview ${candidateName ? ` for ${candidateName}` : ''}`}
      onClose={closeModal}
      maskStyle={{ background: 'rgb(0, 20, 67,0.8)' }}
    >
      {getDrawerContent()}
    </Drawer>
  );
};
export default ScheduleInterview;
