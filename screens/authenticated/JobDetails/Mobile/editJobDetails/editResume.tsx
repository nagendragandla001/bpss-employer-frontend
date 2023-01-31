import React, { useState } from 'react';
import {
  Modal, Row, Col, Typography, Form, notification, Radio, Button,
} from 'antd';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import { JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';

const { Text, Paragraph } = Typography;

type PropsModel = {
  onCancel: () => void,
  patchrequest: (msg) => void,
  jobData: JobDetailsType
}
const EditResume = (props: PropsModel):JSX.Element => {
  const { onCancel, patchrequest, jobData } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      client_approval_required: true,
      is_resume_subscribed: formData.isResumeSubscribed,
    };
    const apiCall = await patchJobChanges(jobData.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };

  return (
    <Modal
      visible
      className="full-screen-modal m-jd-modal-container"
      closable={false}
      footer={null}
      destroyOnClose
      title={[
        <Row key="job-details">
          <Col onClick={onCancel}>
            <CustomImage
              src="/svgs/m-close.svg"
              width={24}
              height={24}
              alt="Close"
            />
          </Col>
          <Col className="m-v-auto"><Text className="title">Edit Resume</Text></Col>
        </Row>,
      ]}
    >
      <Form
        layout="vertical"
        initialValues={{
          isResumeSubscribed: (jobData.clientApprovalRequired
            && jobData.isResumeSubscribed)
            || !jobData.clientApprovalRequired,

        }}
        onFinish={finishHandler}
      >
        <Paragraph className="text-medium m-b-16">
          Is Resume required to apply for this job?
        </Paragraph>
        <Form.Item name="isResumeSubscribed">

          <Radio.Group
            className="radio-buttons"
          >
            <Radio.Button
              value
              style={{ fontSize: 12, paddingLeft: 20, paddingRight: 20 }}
            >
              Yes
            </Radio.Button>
            <Radio.Button
              value={false}
              style={{ fontSize: 12, paddingLeft: 20, paddingRight: 20 }}
            >
              No
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item className="modal-action">
          <Button
            type="primary"
            block
            htmlType="submit"
            onClick={(): void => {
              pushClevertapEvent('Candidate Requirement Edit', { Type: 'Resume' });
            }}
            loading={submitInProgress}
          >
            Save Changes

          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditResume;
