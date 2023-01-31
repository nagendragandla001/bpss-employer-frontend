import {
  Button,
  Card, Col, Popover, Row, Space, Typography, Tag,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import { interviewType } from 'constants/enum-constants';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';
import { getJobSlotsData } from '../Common/JobDetails.utils';

const AddSlotsDrawer = dynamic(() => import('screens/authenticated/JobsTab/Desktop/addSlots/index'), { ssr: false });

const { Text, Paragraph } = Typography;

interface IInterviewSlots {
  job: IJobPost;
  orgData: OrgDetailsType;
  updateSlot: (updateJob) => void;
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

interface IInterviewDate {
  dates: Array<any>;
}

const InterviewSlots = (props: IInterviewSlots): JSX.Element => {
  const { job, orgData, updateSlot } = props;
  const [slots, setSlots] = useState<Array<any>>([]);
  const [drawerAndModalInfo, setDrawerAndModalInfo] = useState<MandDStateInterface>({
    type: '',
    job: null,
    visible: false,
  });

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

  const fetchJobSlots = async (): Promise<void> => {
    if (job?.id) {
      const futureslotId = job?.id?.split('/');
      const response = await getJobSlotsData(futureslotId[0]);
      setSlots(response);
    }
  };

  const handleOnAddSlots = (): void => {
    setDrawerAndModalInfo({
      job: job.id,
      type: 'addSlots',
      visible: true,
    });
    pushClevertapEvent('Special Click', { Type: 'Add More Interview slot' });
  };

  const RenderInterviewDate = (interviewProps: IInterviewDate): JSX.Element => {
    const { dates } = interviewProps;
    return (
      <Row justify="end" gutter={0}>
        {
          dates.map((date) => (
            <Col key={`${date.label}-${date.value}`}>
              <Space direction="vertical" size={0} align="center">
                <Text
                  className="interview-slots m-r-6"
                >
                  {date.label[0]}
                </Text>
                <Tag
                  color={date.disabled ? '#7353DD' : '#d8dfe0'}
                  className="interview-slots"
                >
                  {date.value}
                </Tag>
              </Space>
            </Col>
          ))
        }
      </Row>
    );
  };

  useEffect(() => {
    fetchJobSlots();
  }, [job]);

  return (
    <>
      <Card
        className="jd-side-layout-card"
        title={(
          <Space>
            <CustomImage
              src="/images/job-details/jd-calendar-illustration.svg"
              width={48}
              height={48}
              alt="calendar"
            />
            <Text className="text-semibold">Interview Slots</Text>
          </Space>
        )}
        extra={(!['J_P', 'J_C'].includes(job?.state) && job.stage !== 'J_R') && (
          <Button
            type="link"
            onClick={handleOnAddSlots}
            className="ct-edit-btn"
            htmlType="submit"
            icon={(
              <CustomImage
                src="/images/job-details/jd-add-slot.svg"
                alt="open"
                width={32}
                height={32}
              />
            )}
          />
        )}
      >
        {
          slots?.length > 0 && (
            <Row gutter={[0, 16]}>
              {
                slots.map((slot) => (
                  <Col span={24} key={slot?.id}>
                    <Card bordered={false}>
                      <Row>
                        <Col span={24} className="text-small">
                          {interviewType(slot.slotinterviewType)}
                        </Col>
                        <Col span={24} className="text-small">
                          {`${(slot.interviewStartDate.m)}
                            ${dayjs(slot.interviewStartTime).format('D MMM') !== slot.interviewEndDate.m ? `- ${(slot.interviewEndDate.m)}` : ' '}`}
                        </Col>
                        <Col span={24} className="text-small">
                          {`${dayjs(slot.interviewStartTime).format('hh:mm A')} to ${dayjs(slot.interviewEndTime).format('hh:mm A')}`}
                        </Col>
                        <Col span={24} className="text-small">
                          {`${slot.interviewDuration} mins Interview`}
                        </Col>
                      </Row>
                      <Row justify="space-between">
                        <Col span={6}>
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
                              className="text-small p-all-0"
                            >
                              Details
                            </Button>
                          </Popover>
                        </Col>
                        <Col span={18}>
                          <RenderInterviewDate
                            dates={createRepeatSlot(slot?.interviewDates)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))
              }
            </Row>
          )
        }
        {
          (slots?.length === 0) && (
            <Row align="middle" gutter={[0, 10]}>
              <Col span={24} className="text-center">
                <CustomImage
                  src="/svgs/empty-interview-slots.svg"
                  width={64}
                  height={64}
                  alt="empty-slots"
                />
              </Col>
              <Col span={24} className="text-center">
                <Text className={job.stage === 'J_UA' ? 'jd-red' : 'no-slots'}>
                  {
                    job.clientApprovalRequired ? 'Add interview slots' : 'No Walk-in Slots available'
                  }
                </Text>
              </Col>
            </Row>
          )
        }
      </Card>
      {drawerAndModalInfo.type === 'addSlots' && drawerAndModalInfo.job
        ? (
          <AddSlotsDrawer
            orgDetails={orgData}
            closeDrawer={():void => setDrawerAndModalInfo({ type: '', visible: false, job: null })}
            jobId={job.id}
            updateJobsSlotsData={updateSlot}
          />
        ) : null}
    </>
  );
};

export default InterviewSlots;
