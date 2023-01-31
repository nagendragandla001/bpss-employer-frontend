/* eslint-disable no-nested-ternary */
import { CalendarOutlined, ClockCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import {
  Col, Divider, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { tConvert, videoType } from 'constants/enum-constants';
import moment from 'moment';
import dynamic from 'next/dynamic';
import React from 'react';
import { OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

require('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/addSlotsIntro.less');

const Interview = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/MobileScheduleInterview'), { ssr: false });

interface IntroI{
  visible:boolean;
  closehandler:()=>void;
  applicationId:string;
  jobId:string;
  jobType:string;
  store:OrganizationDetailsType;
  updateApplicationData:any;
  clevertype:string;
}
const { Paragraph } = Typography;
const MobileIntro = (props:IntroI):JSX.Element => {
  const {
    visible, closehandler, applicationId, jobId, jobType, store, updateApplicationData,
    clevertype,
  } = props;
  let startDate; let endDate; let duration; let start;
  let end; let pocName; let poccontact; let type; let interviewAddress;
  let startMonth; let endMonth;

  const info = ():void => {
    Modal.info({
      icon: false,
      content: (
        <div>
          <Paragraph className="m-carousel-content">Slots are already added</Paragraph>
        </div>
      ),
      onOk() { closehandler(); },
    });
  };
  const success = ():void => {
    // pushClevertapEvent('Add interview slots', { Type: 'Another interview Slot' });

    Modal.success({
      icon: false,
      okButtonProps: {
        type: 'default',
        className: 'm-invite-success',
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
      onOk() { closehandler(); },
    });
  };
  const videoTypeFormat = ['HANG_VID', 'WHATSAPP_VID', 'VID', 'OTHER'];
  const successForCAR = ():void => {
    // pushClevertapEvent('Schedule Interview', { Type: 'Another interview Slot' });

    Modal.success({
      icon: false,
      okButtonProps: {
        type: 'default',
        className: 'm-invite-success',
      },
      content: (
        <div>
          <Paragraph className="invite-heading-top"> Interview Invite Sent!</Paragraph>
          <CustomImage
            src="/svgs/interviewInvite.svg"
            alt="second"
            height={48}
            width={48}
            className="m-interview-invite"
          />
          <Divider className="divider" />
          <div>
            {type === 'FACE' ? <Paragraph className="invite-heading">Face to Face Interview slots:</Paragraph> : ''}
            {videoTypeFormat.indexOf(type) > -1 ? <Paragraph className="invite-heading">Video Interview slots:</Paragraph> : ''}
            {type === 'TELE' ? <Paragraph className="invite-heading">Telephonic  Interview slots:</Paragraph> : ''}
          </div>
          <Row>

            <CalendarOutlined style={{ marginRight: '10px' }} />
            <p style={{ marginRight: '5px', fontSize: '12px' }}>
              {startDate}
              {startMonth === endMonth ? '' : startMonth}
            </p>
            {endDate !== '' ? (
              <>
                -

                <p style={{ marginLeft: '6px', fontSize: '12px' }}>
                  {endDate}
                  {endMonth}

                </p>
              </>
            ) : ''}

          </Row>
          <Row
            // gutter={30}
            style={{ marginBottom: '10px' }}
          >
            {/* <Col span={2}>

              <ClockCircleOutlined />
            </Col> */}
            <Col style={{ fontSize: '12px' }}>
              <ClockCircleOutlined style={{ marginRight: '10px' }} />
              {start}
              -
              {end}

            </Col>

            <Col flex="82px" style={{ fontSize: '12px', marginLeft: '0.3rem' }}>
              <span style={{ marginRight: '1.5px' }}>|</span>
              {duration}
              {' '}
              mins each
            </Col>
          </Row>
          <Row style={{ marginBottom: '10px' }}>
            {videoTypeFormat.indexOf(type) > -1 ? (
              <Paragraph>
                <VideoCameraOutlined style={{ marginRight: '10px' }} />
                {videoType(type)}
              </Paragraph>
            ) : ''}
            {type === 'FACE' ? (
              <Paragraph style={{ fontSize: '12px' }}>

                <CustomImage
                  src="/svgs/office.svg"
                  alt="office"
                  height={16}
                  width={16}
                  className="margin-excel"
                />
                {interviewAddress[0]}

              </Paragraph>
            ) : ''}
          </Row>
          <Paragraph style={{ fontSize: '12px' }}>
            {' '}
            <div className="m-r-10">
              <CustomImage
                src="/svgs/callbutton.svg"
                width={20}
                height={20}
                alt="contact"
                // style={{ marginRight: '10px' }}
              />
              Point of Contact:
              <Row style={{ paddingLeft: '2rem', fontSize: '12px' }}>
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
          </Paragraph>
        </div>),
      onOk() { closehandler(); },
    });
  };
  const handleNCAR = (data):void => {
    if (data === 'success') { success(); } else { info(); }
  };
  const handleinviteData = (msg, data?, address?):void => {
    if (msg === 'success') {
      type = data[0].interview_type;
      duration = data[0].duration;
      startDate = (moment(data[0].date)).format('D');
      startMonth = (moment(data[0].date)).format('MMM');
      endMonth = data.length > 1 ? moment(data[data.length - 1].date).format('MMM') : '';
      endDate = data.length > 1 ? moment(data[data.length - 1].date).format('D') : '';

      start = tConvert(data[0].start);
      end = tConvert(data[0].end);
      // eslint-disable-next-line prefer-destructuring
      interviewAddress = address;
      pocName = data[0].poc_data.name;
      poccontact = data[0].poc_data.contact;

      successForCAR();
    } else { info(); }
  };
  return (
    <>

      <Interview
        viewmodal={visible}
        closeModal={closehandler}
        applicationId={applicationId}
        store={store}
        jobId={jobId}
        invite={jobType === 'NCAR' ? handleNCAR : handleinviteData}
        jobtype={jobType}
        updateApplicationData={updateApplicationData}
        clevertype={clevertype}
      />

    </>
  );
};
export default MobileIntro;
