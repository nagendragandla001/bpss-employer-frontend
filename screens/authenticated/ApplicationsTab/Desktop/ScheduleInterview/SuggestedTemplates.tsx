/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import {
  Modal, Card, Button, Row, Col, Tag, Radio, Typography,
} from 'antd';
import dayjs from 'dayjs';
import { suggestTemplateToCandidate } from 'service/application-service';
import { VideoCameraOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { interviewType, videoType } from 'constants/enum-constants';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';

const { Paragraph, Text } = Typography;

interface suggestSlotsI {
  slotsDetails:any;
  closehandler:() => void;
  updateApplicationData: (id: string) => void;
  clevertype:string;
  applicationId: string;
}

const SuggestSlots = (props:suggestSlotsI):JSX.Element => {
  const {
    slotsDetails, closehandler, updateApplicationData, clevertype, applicationId,
  } = props;

  const [suggestSlotDetailsId, setSuggestSlotDetailsId] = useState(slotsDetails[0].templateId);
  const [suggestSlotDetails, setsuggestSlotDetails] = useState(slotsDetails[0]);

  const [suggestSlotsRIP, setSuggestSlotsRIP] = useState(false);

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
            className="interview-invite"
          />
          <div className="page-0-btn-divider title-divider" />
          <div>
            {suggestSlotDetails.interviewType === 'FACE' ? <Paragraph className="invite-heading">Face to Face Interview slots:</Paragraph> : ''}
            {videoTypeFormat.indexOf(suggestSlotDetails.interviewType) > -1 ? <Paragraph className="invite-heading">Video Interview slots:</Paragraph> : ''}
            {suggestSlotDetails.interviewType === 'TELE' ? <Paragraph className="invite-heading">Telephonic  Interview slots:</Paragraph> : ''}
          </div>
          <Row style={{ marginBottom: '10px' }}>
            <CalendarOutlined style={{ marginRight: '10px' }} />

            {suggestSlotDetails.StartDate}
            -
            {suggestSlotDetails.EndDate}

          </Row>
          <Row style={{ marginBottom: '10px' }}>
            <Col span={11}>

              <ClockCircleOutlined style={{ marginRight: '10px' }} />
              {dayjs(suggestSlotDetails.interviewStartTime).format('hh:mm A')}

              {suggestSlotDetails.interviewStartTime !== suggestSlotDetails.interviewEndTime ? dayjs(suggestSlotDetails.interviewEndTime).format('hh:mm A') : ''}

            </Col>
            |
            <Col span={8}>
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
              <Paragraph>
                <div className="m-r-10">
                  <CustomImage
                    src="/svgs/office.svg"
                    width={16}
                    height={16}
                    alt="office"
                  />
                  {suggestSlotDetails.interviewAddress}
                </div>

              </Paragraph>
            ) : ''}
          </Row>
          <Paragraph>
            {' '}
            <div className="m-r-10">
              <CustomImage
                src="/svgs/callbutton.svg"
                alt="contact"
                width={16}
                height={16}
                // style={{ marginRight: '10px' }}
              />
              Point of Contact:

              <Row style={{ paddingLeft: '2rem' }}>
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
    setSuggestSlotsRIP(true);
    const obj = {
      id: suggestSlotDetails.applicationId,
      template_id: suggestSlotDetails.templateId,
    };
    // success();
    const res = await suggestTemplateToCandidate(obj);
    //  console.log(res);
    if (res.status === 409 || res.status === 400) {
      setSuggestSlotsRIP(false);
      info();
    } else if (res.status === 202) {
      setSuggestSlotsRIP(false);
      success();
      pushClevertapEvent('Suggest Slot Success', { Type: `${suggestSlotDetails.interviewType}` });
      // const resobj = {
      //   suggestedSlotTemplateName: responseObj?._source?.suggested_slot_template?.template?.name,
      //   applicationStage: 'TBSI',
      // };
      updateApplicationData(applicationId);
    } else {
      setSuggestSlotsRIP(false);
    }
  };
  const iconType = (type):JSX.Element => (
    <Row className="display-inline-flex">
      <Col>
        {['FACE', 'TELE'].indexOf(type) !== -1 ? (
          <CustomImage
            src={`/svgs/${type === 'FACE' ? 'user-icon' : 'contact-icon'}.svg`}
            alt="user"
            className="m-right-8"
            width={24}
            height={24}
          />
        )
          : <VideoCameraOutlined style={{ marginRight: '8px' }} />}
        <Text className="font-bold">
          {interviewType(type)}
        </Text>
      </Col>
    </Row>
  );

  const renderInterviewDate = (dates): JSX.Element => (
    <Row justify="end" align="middle">
      {
        dates.map((date) => (
          <Col key={date.date} className="interview-date-container">
            <Paragraph className="text-extra-small">{date.day[0]}</Paragraph>
            <Tag
              className="tag"
              key={date.date}
              color="#276ef1"
            >
              {date.date}
            </Tag>
          </Col>
        ))
      }
    </Row>
  );
  return (
    <>
      <Row>
        <Col className="suggest-template-title">
          <Text>
            Suggest timings you’ve already added for Interview
          </Text>
        </Col>
      </Row>
      <Row className="suggest-template-card">
        <Col span={24}>
          <Radio.Group
            defaultValue={suggestSlotDetails}
            onChange={(e):void => {
              setSuggestSlotDetailsId(e.target.value.templateId);
              setsuggestSlotDetails(e.target.value);
              pushClevertapEvent(`${clevertype}`, { Type: 'Existing Slot' });
            }}
            style={{ width: '100%' }}
          >
            {slotsDetails.map((slot) => (
              <Row
                key={Math.random()}
                className="m-bottom-1rem"
              >
                <Card
                  key={slot.templateId}
                  title={<Radio value={slot} className="radio-suggest">{iconType(slot.interviewType)}</Radio>}
                  className={suggestSlotDetailsId === slot.templateId ? 'checked-suggestion-template' : 'container-suggestion-template'}
                >
                  <Row>
                    <Col span={24}>
                      <Row>
                        <Col span={12} className="text-base">
                          <Row justify="space-between">
                            <Col span={24}>
                              {`${dayjs(slot.interviewStartTime).format('D MMM')} 
                                ${dayjs(slot.interviewStartTime).format('D MMM') !== dayjs(slot.interviewEndTime).format('D MMM') ? `- ${dayjs(slot.interviewEndTime).format('D MMM')}` : ' '}`}
                            </Col>
                            <Col span={24}>
                              {`${dayjs(slot.interviewStartTime).format('hh:mm A')} to ${dayjs(slot.interviewEndTime).format('hh:mm A')}`}
                            </Col>
                            <Col span={24}>
                              {`${slot.interviewDuration} mins Interview`}
                            </Col>
                          </Row>
                        </Col>
                        <Col span={12}>
                          { slot.SortedInterviewDates.length > 6
                            ? renderInterviewDate(slot.SortedInterviewDates.slice(0, 6))
                            : renderInterviewDate(slot.SortedInterviewDates) }
                          <Row justify="end">
                            <Col className="color-blue-grey-8 font-small m-top-12">
                              {`suggested to ${slot.suggestedTo} candidates`}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>

                  </Row>
                </Card>
              </Row>
            ))}
          </Radio.Group>
        </Col>
      </Row>
      <Row className="m-top-24">
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            className="add-new-timings-btn suggest-template-btn"
            onClick={interviewHandler}
            loading={suggestSlotsRIP}
          >
            Send Interview Invite
          </Button>
        </Col>
      </Row>
    </>

  );
};
export default SuggestSlots;
