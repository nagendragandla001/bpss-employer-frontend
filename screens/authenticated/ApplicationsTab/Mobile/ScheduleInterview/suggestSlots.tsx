/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CalendarOutlined, ClockCircleOutlined, RightOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import {
  Button, Card, Col, Divider, Modal, notification, Radio, Row, Tag, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { interviewType, videoType } from 'constants/enum-constants';
import dayjs from 'dayjs';
import moment from 'moment';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { CMSInterface, OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { suggestTemplateToCandidate } from 'service/application-service';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/addSlots.less');

const AddSlotsIntro = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/addSlotsIntro'), { ssr: false });

const { Paragraph } = Typography;

interface suggestSlotsI{
  visible:boolean;
  closehandler:()=>void;
  slotsDetails:any;
  store:OrganizationDetailsType;
  jobType:string;
  applicationId:string;
  jobId:string;
  updateApplicationData:any;
  clevertype:string;
  cms: CMSInterface;
}

const SuggestSlots = (props:suggestSlotsI):JSX.Element => {
  const {
    visible, closehandler, slotsDetails, store, jobType, applicationId, jobId,
    clevertype,
    updateApplicationData, cms,
  } = props;

  const [interviewModal, setInterviewModal] = useState(false);
  const [suggestSlotDetailsId, setSuggestSlotDetailsId] = useState(slotsDetails[0].templateId);
  const [suggestSlotDetails, setsuggestSlotDetails] = useState(slotsDetails[0]);
  const [templateInProgress, settemplateInProgress] = useState(false);
  const info = ():void => {
    Modal.info({
      icon: false,
      content: (
        <div>
          <div>Slots are already added</div>

        </div>
      ),
      onOk() { closehandler(); },
    });
  };
  const videoTypeFormat = ['HANG_VID', 'WHATSAPP_VID', 'VID', 'OTHER'];
  const success = ():void => {
    pushClevertapEvent('Suggest Slot Success', { Type: suggestSlotDetails.interviewType });
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
            width={48}
            height={48}
            className="m-interview-invite"
          />
          <Divider className="divider" />
          <div>
            {suggestSlotDetails.interviewType === 'FACE' ? <Paragraph className="invite-heading">Face to Face Interview slots:</Paragraph> : ''}
            {videoTypeFormat.indexOf(suggestSlotDetails.interviewType) > -1 ? <Paragraph className="invite-heading">Video Interview slots:</Paragraph> : ''}
            {suggestSlotDetails.interviewType === 'TELE' ? <Paragraph className="invite-heading">Telephonic  Interview slots:</Paragraph> : ''}
          </div>
          <Row style={{ fontSize: '12px' }}>
            <CalendarOutlined style={{ marginRight: '10px' }} />
            {suggestSlotDetails.StartDate}
            -
            {suggestSlotDetails.EndDate}

          </Row>
          <Row style={{ marginBottom: '10px' }}>
            <Col style={{ fontSize: '12px' }}>

              <ClockCircleOutlined style={{ marginRight: '10px' }} />
              {moment(suggestSlotDetails.interviewStartTime).format('hh:mm A')}
              -
              {moment(suggestSlotDetails.interviewEndTime).format('hh:mm A')}

            </Col>

            <Col flex="82px" style={{ fontSize: '12px', marginLeft: '0.3rem' }}>
              <span style={{ marginRight: '1.5px' }}>|</span>
              {suggestSlotDetails.interviewDuration}
              {' '}
              mins each
            </Col>
          </Row>
          <Row style={{ marginBottom: '10px' }}>
            {videoTypeFormat.indexOf(suggestSlotDetails.interviewType) > -1 ? (
              <Paragraph>
                <VideoCameraOutlined style={{ marginRight: '10px' }} />
                {videoType(suggestSlotDetails.interviewType)}
              </Paragraph>
            ) : ''}
            {suggestSlotDetails.interviewType === 'FACE' ? (
              <Paragraph style={{ fontSize: '12px' }}>
                <div className="m-right-10">
                  <CustomImage
                    src="/svgs/office.svg"
                    width={16}
                    height={16}
                    alt="office"
                    // style={{ marginRight: '10px' }}
                  />
                  {suggestSlotDetails.interviewAddress}
                </div>
              </Paragraph>
            ) : ''}
          </Row>
          <Paragraph style={{ fontSize: '12px' }}>
            {' '}
            <div className="m-right-10">
              <CustomImage
                src="/svgs/callbutton.svg"
                width={16}
                height={16}
                alt="contact"
                // style={{ marginRight: '10px' }}
              />

              Point of Contact:
              <Row style={{ paddingLeft: '2rem', fontSize: '12px' }}>
                {suggestSlotDetails.pocName}
                {suggestSlotDetails.interviewType === 'WHATSAPP_VID'
              || suggestSlotDetails.interviewType === 'FACE'
              || suggestSlotDetails.interviewType === 'TELE'
                  ? (
                    <p>
                      (+91-
                      {suggestSlotDetails.poccontact}
                      )
                    </p>
                  )

                  : <Paragraph style={{ paddingLeft: '0.5rem' }}>{suggestSlotDetails.poccontact}</Paragraph>}
              </Row>
            </div>
          </Paragraph>
        </div>),
      onOk() { closehandler(); },
    });
  };
  const interviewHandler = async () :Promise<void> => {
    settemplateInProgress(true);
    const obj = {
      id: suggestSlotDetails.applicationId,
      template_id: suggestSlotDetails.templateId,
    };
    // success();
    const res = await suggestTemplateToCandidate(obj);
    //  console.log(res);
    if (res.status !== 409) {
      settemplateInProgress(false);
      info();
    } else {
      settemplateInProgress(false);
    }
    if (res.status === 202) {
      settemplateInProgress(false);
      success();
      const responseObj = await res.data;
      const resobj = {
        // eslint-disable-next-line no-underscore-dangle
        suggestedSlotTemplateName: responseObj._source.suggested_slot_template.template.name,
        applicationStage: 'TBSI',
      };
      pushClevertapEvent('Suggest Slot Success', { Type: `${suggestSlotDetails.interviewType}` });
      updateApplicationData(resobj);
    }
  };

  const iconType = (type):JSX.Element => (
    <>
      {type === 'FACE' ? (
        <>
          {' '}
          <CustomImage
            src="/svgs/user-icon.svg"
            width={24}
            height={24}
            alt="office"
          />
          <span className="m-card-title">
            {' '}
            {interviewType(type)}
          </span>
        </>
      )
        : (type === 'TELE'
          ? (
            <>
              {' '}
              <CustomImage
                src="/svgs/contact-icon.svg"
                height={24}
                width={24}
                alt="office"
              />
              <span className="m-card-title">
                {' '}
                {interviewType(type)}
              </span>

            </>
          ) : (
            <>
              <VideoCameraOutlined />
              <span className="m-card-title">
                {' '}
                {interviewType(type)}
              </span>
            </>
          ))}

    </>

  );

  const renderInterviewDate = (dates): JSX.Element => (
    <Row justify="center" align="middle">
      {
        dates.map((date) => (
          <Col key={date.date} span={4}>
            <Paragraph className="date-name" style={{ fontSize: '10px', width: '16px' }}>{date.day[0]}</Paragraph>

            <Tag key={date.date} className="tag" color={date.day !== 'Su' && date.day !== 'Sa' ? '#00a49f' : '#d8dfe0'}>
              <p style={{
                fontSize: '8px',
                margin: '0',
              }}
              >
                {date.date}
              </p>
            </Tag>
          </Col>
        ))
      }
    </Row>
  );

  return (

    <Modal
      visible={visible}
      className="full-screen-modal m-suggest-slot"
      title={
        [
          <Row key={Math.random()}>
            <Col span={24} onClick={closehandler}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
            <Col span={24} className="slot-title">Suggest timings you’ve already added for Interview</Col>
          </Row>,
        ]
      }
      footer={null}
      onCancel={closehandler}
      closable={false}

    >
      <Row
        key={Math.random()}
        style={{ maxHeight: '55vh', overflowY: 'scroll' }}
      >
        <Radio.Group
          defaultValue={suggestSlotDetails}
          onChange={(e):void => {
            // console.log(e.target.value);
            setSuggestSlotDetailsId(e.target.value.templateId);
            setsuggestSlotDetails(e.target.value);
            pushClevertapEvent(`${clevertype}`, { Type: 'Existing Slot' });
          }}
          className="full-width"
          name="suggest-slots"
        >
          { slotsDetails.map((slot) => (

            <Col span={24} className="m-bottom-16" key={slot.templateId}>

              <Card
                title={<Radio value={slot} className="radio-suggest">{ iconType(slot.interviewType)}</Radio>}
                className={suggestSlotDetailsId === slot.templateId ? 'ac-checked-template' : 'ac-container'}
                extra={<RightOutlined />}
                key={slot.templateId}
              >
                <Row key={Math.random()}>
                  <Col span={24}>
                    <Row key={Math.random()}>
                      <Col span={12} className="font-size-12">
                        <Row key={Math.random()}>
                          <Col span={24}>
                            {`${dayjs(slot.interviewStartTime).format('D MMM')} 
                            
                            
                            ${dayjs(slot.interviewStartTime).format('D MMM') !== dayjs(slot.interviewEndTime).format('D MMM') ? `- ${dayjs(slot.interviewEndTime).format('D MMM')}` : ' '}`}
                          </Col>
                          <Col span={24}>
                            {`${dayjs(slot.interviewStartTime).format('hh:mm A')} to ${dayjs(slot.interviewEndTime).format('hh:mm A')}`}
                          </Col>
                          <Col span={24}>
                            {` ${slot.interviewDuration} mins Interview`}
                          </Col>
                        </Row>
                      </Col>
                      <Col span={12}>
                        { slot.SortedInterviewDates.length > 6
                          ? renderInterviewDate(slot.SortedInterviewDates.slice(0, 6))
                          : renderInterviewDate(slot.SortedInterviewDates) }
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24} className="sub-text">
                    {`suggested to ${slot.suggestedTo} candidates`}
                  </Col>
                </Row>
              </Card>

            </Col>

          ))}
        </Radio.Group>
      </Row>
      <Row className="text-center" key={Math.random()}>
        <Col span={24} style={{ marginTop: '4px', marginBottom: '20px' }}>
          <Button type="primary" onClick={interviewHandler} loading={templateInProgress}>Send Interview Invite</Button>
        </Col>
        <Col span={24} style={{ marginBottom: '5px' }}>OR</Col>
        <Col span={24}>
          <Button
            type="link"
            onClick={():void => {
              setInterviewModal(true);
              pushClevertapEvent(clevertype, { Type: 'Another Interview Slot' });
            }}
          >
            + Add New Interview Timings

          </Button>
        </Col>
      </Row>

      <Paragraph key={Math.random()} style={{ textAlign: 'center' }} />
      {interviewModal ? (
        <AddSlotsIntro
          visible
          closehandler={closehandler}
          store={store}
          applicationId={applicationId}
          jobId={jobId}
          jobType={jobType}
          updateApplicationData={updateApplicationData}
          clevertype={clevertype}
        />
      ) : ''}

    </Modal>
  );
};
export default SuggestSlots;
