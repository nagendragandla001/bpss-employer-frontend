import React, { useState } from 'react';
import {
  Modal, Form, Radio, Col, Row, Typography, Button, notification,
} from 'antd';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import { isMobile } from 'mobile-device-detect';
import { pushClevertapEvent } from 'utils/clevertap';

const { Paragraph } = Typography;
interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
}
const EditResume = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      client_approval_required: true,
      is_resume_subscribed: formData.isResumeSubscribed,
    };
    const apiCall = await patchJobChanges(data.id, obj);
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
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      title="Edit Resume"
    >
      <Form
        layout="vertical"
        initialValues={{
          isResumeSubscribed: (data.clientApprovalRequired
            && data.isResumeSubscribed)
            || !data.clientApprovalRequired,

        }}
        onFinish={finishHandler}
      >
        <Row>
          <Col span={24}>
            <Paragraph className="resume-container">
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
          </Col>
        </Row>
        {isMobile
          ? (
            <div className="m-ct-feedback-modal-footer-mobile">
              <Button
                htmlType="submit"
                type="primary"
                className="green-primary-btn"
                loading={submitInProgress}
              >
                Save Changes

              </Button>

            </div>
          )
          : (
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="m-jobdetails-submit-btn"
                onClick={(): void => {
                  pushClevertapEvent('Candidate Requirement Edit', { Type: 'Resume' });
                }}
                loading={submitInProgress}
              >
                Save Changes

              </Button>
            </Form.Item>
          ) }
      </Form>
    </Modal>
  );
};
export default EditResume;
