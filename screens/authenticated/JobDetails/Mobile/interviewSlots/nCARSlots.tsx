import {
  Button, Card, Col, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';
import { JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';

const AddMobileWalkinSlots = dynamic(() => import('screens/authenticated/JobsTab/Mobile/addSlots'), { ssr: false });

const { Paragraph, Text } = Typography;

type PropsModel = {
  orgData: OrgDetailsType,
  jobData: JobDetailsType,
  patchrequest: (msg) => void
}

const NcarSlots = (props: PropsModel): JSX.Element => {
  const { orgData, jobData, patchrequest } = props;
  const [slotVisible, setSlotVisible] = useState(false);

  const updateJobsSlotsData = (data): void => {
    patchrequest('success');
  };

  const isAuthorisedToAddSlots = (): boolean => jobData.jobState === 'J_O' || (jobData.jobState === 'J_D' && jobData.jobStage === 'J_UA');

  return (
    <>
      <Card
        key="interview-slots"
        className="m-ncar-slots"
        extra={isAuthorisedToAddSlots() && (
          <Button
            type="primary"
            size="small"
            className="br-4"
            onClick={(): void => {
              setSlotVisible(true);
              pushClevertapEvent('Special Click', { Type: 'Add New Interview slot' });
            }}
          >
            Add Slots
          </Button>
        )}
        title={[
          <Row key="ncarSlots">
            <Col>
              <CustomImage
                src="/images/job-details/m-calendar.svg"
                width={48}
                height={48}
                alt="Calendar"
              />
            </Col>
            <Col span={16} className="m-v-auto">
              <Row>
                <Col span={24}><Paragraph className="text-medium font-bold">Interview slots</Paragraph></Col>
                <Col span={24}>
                  <Text
                    className="text-small text-normal text-red"
                  >
                    No Interview Slots Available
                  </Text>
                </Col>
              </Row>
            </Col>
          </Row>,
        ]}
      />
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

export default NcarSlots;
