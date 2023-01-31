import {
  Button, Card, Col, Divider, Popover, Row, Tag, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { interviewType } from 'constants/enum-constants';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';
import { JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';

require('screens/authenticated/JobDetails/Mobile/interviewSlots/interviewSlots.less');

const AddMobileWalkinSlots = dynamic(() => import('screens/authenticated/JobsTab/Mobile/addSlots'), { ssr: false });

const { Paragraph, Text } = Typography;

type PropsModel = {
  interviewSlots: Array<any>,
  orgData: OrgDetailsType,
  jobData: JobDetailsType,
  patchrequest: (msg) => void
};

interface RepeatSlots {
  label: string;
  value: string;
  disabled: boolean;
}

const InterviewSlots = (props: PropsModel): JSX.Element => {
  const {
    interviewSlots, orgData, jobData, patchrequest,
  } = props;

  const [slotVisible, setSlotVisible] = useState(false);

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
          <Col key={Math.random()}>
            <Paragraph className="date-name" style={{ fontSize: '10px', width: '16px' }}>{date.label[0]}</Paragraph>
            <Tag key={date.date} className="tag" color={date.disabled ? '#7353DD' : '#d8dfe0'}>
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

  const getTime = (date): string => dayjs(date).format('H:MM a');

  const updateJobsSlotsData = (data): void => {
    patchrequest('success');
  };

  return (
    <>
      <Card
        key="m-interview-slots"
        className="m-interview-slots-card"
        extra={(jobData.jobState !== 'J_C' && jobData.jobState !== 'J_P' && jobData.jobStage !== 'J_R') && (
          <Button
            type="link"
            className="p-all-0"
            icon={(
              <CustomImage
                src="/images/job-details/jd-add-slot.svg"
                alt="Add Slot"
                width={24}
                height={24}
              />
            )}
            onClick={(): void => {
              setSlotVisible(true);
              pushClevertapEvent('Special Click', { Type: 'Add More Interview slot' });
            }}
          />
        )}
        title={[
          <Row key="slots">
            <Col>
              <CustomImage
                src="/images/job-details/m-calendar.svg"
                width={48}
                height={48}
                alt="Calendar"
              />
            </Col>
            <Col span={12} className="m-v-auto">
              <Row justify="space-between" align="middle">
                <Col><Paragraph className="text-medium font-bold ">Interview slots</Paragraph></Col>
              </Row>
            </Col>
          </Row>,
        ]}
      >
        {
          interviewSlots && interviewSlots.map((slot) => (
            <div key={Math.random()}>
              <Row key={Math.random()} className="slots">
                <Col span={24}>
                  <Text className="text-small">{interviewType(slot.slotinterviewType)}</Text>
                </Col>
                <Col span={24}>
                  <Row>
                    <Col span={12}>
                      <Row>
                        <Col span={24}>
                          <Paragraph className="text-small charcoal-8 p-top-8">
                            {`${slot.interviewStartDate.m} - ${slot.interviewEndDate.m}`}
                          </Paragraph>
                        </Col>
                        <Col span={24}>
                          <Paragraph className="text-small charcoal-8">
                            {`${getTime(slot.interviewStartTime)} to ${getTime(slot.interviewEndTime)}`}
                          </Paragraph>
                        </Col>
                        <Col key={Math.random()}>
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
                            <Button
                              type="link"
                              className="text-small details"
                              size="small"
                            >
                              Details
                            </Button>
                          </Popover>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      {renderInterviewDate(createRepeatSlot(slot.interviewDates))}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider />
            </div>
          ))
        }
      </Card>
      {
        slotVisible && (
          <AddMobileWalkinSlots
            visible={slotVisible}
            closeModal={(): void => setSlotVisible(false)}
            store={orgData}
            jobId={jobData.id}
            updateJobsSlotsData={updateJobsSlotsData}
          />
        )
      }
    </>
  );
};

export default InterviewSlots;
