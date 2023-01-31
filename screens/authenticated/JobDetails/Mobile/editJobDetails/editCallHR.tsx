import React, { useState, useEffect } from 'react';
import {
  Modal, Row, Col, Typography, Form, Radio, Button, Input,
} from 'antd';
import { has } from 'utils/common-utils';
import { TitlePattern, MobileRegexPattern } from 'utils/constants';
import { UserDetailsType } from 'lib/authenticationHOC';
import isEmpty from 'lodash/isEmpty';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';

const { Text, Paragraph } = Typography;

type PropsModel = {
  onCancel: () => void,
  jobData: JobDetailsType,
  patchrequest: (msg: string) => void,
  userDetails: UserDetailsType | null
}

const EditCallHR = (props: PropsModel): JSX.Element => {
  const {
    onCancel, jobData, patchrequest, userDetails,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState((jobData.shareContact || jobData.isCallPocNull) ? '1' : '0');

  const createPostObj = (formData) => ({
    id: jobData.id,
    share_contact_to_public: visible === '1',
    call_poc: {
      name: visible === '1' ? formData.name : jobData.callPoc.name,
      contact: visible === '1' ? formData.contact : jobData.callPoc.contact,
    },
  });

  const finishHandler = async (formData): Promise<void> => {
    setSubmitInProgress(true);
    const obj = createPostObj(formData);
    const apiCall = await patchJobChanges(jobData.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };

  const setCallPocDetails = async (): Promise<void> => {
    form.setFieldsValue({
      name: `${userDetails?.firstName} ${userDetails?.lastName}`,
      contact: userDetails?.mobile,
    });
  };

  useEffect(() => {
    if (isEmpty(jobData.callPoc)) {
      setCallPocDetails();
    }
  }, [jobData]);

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
          <Col className="m-v-auto"><Text className="title">Call HR</Text></Col>
        </Row>,
      ]}
    >
      <Form
        name="callHrForm"
        layout="vertical"
        size="large"
        hideRequiredMark
        form={form}
        onFinish={finishHandler}
        initialValues={{
          contact: has(jobData, 'callPoc.contact') ? jobData.callPoc.contact : '',
          name: has(jobData, 'callPoc.name') ? jobData.callPoc.name : '',
        }}
      >
        <Row>
          <Col xs={{ span: 24 }}>
            <Row style={{ marginBottom: 40 }}>
              <Col span={24} className="text-center">
                <CustomImage
                  src="/images/jobpost-form/Call-HR.svg"
                  alt="call Hr"
                  width={238}
                  height={104}
                />
              </Col>
              <Col span={24} className="text-center text-small text-disabled m-top-16" style={{ marginTop: '16px' }}>
                With “Call HR enabled”,
                candidates can reach out to
                you directly over the call from 9AM - 8PM from MON to SAT
              </Col>
            </Row>
          </Col>
          <Col span={24} className="text-center">
            <Row>
              <Col span={24}>
                <Paragraph style={{ paddingBottom: 12 }}>
                  <Text>Allow candidates to contact you directly?</Text>
                </Paragraph>
              </Col>
              <Col span={24}>
                {/* Allow Candidates Directly */}
                <Radio.Group
                  onChange={(event): void => {
                    setVisible(event.target.value);
                  }}
                  disabled={!jobData?.callHrEnabled}
                  defaultValue={visible}
                  style={{ marginBottom: 20 }}
                >
                  <Radio.Button value="1" style={{ fontSize: 14 }}>Yes</Radio.Button>
                  <Radio.Button value="0" style={{ fontSize: 14 }}>No</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
          </Col>
          {(visible === '1' && jobData.callHrEnabled) ? (
            <Col span={24}>
              {/* POC Details */}
              <Row gutter={16}>
                {/* Name */}
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Contact name"
                    validateTrigger={['onBlur']}
                    rules={[{
                      required: true,
                      message: 'Please enter the name',
                    }, {
                      pattern: TitlePattern,
                      message: 'Please enter a valid name',
                    }, {
                      whitespace: true,
                      message: 'Name cannot be empty',
                    }]}
                  >
                    <Input className="text-base" />
                  </Form.Item>
                </Col>

                {/* Mobile Number */}
                <Col span={12}>
                  <Form.Item
                    name="contact"
                    label="Mobile no."
                    validateTrigger={['onBlur']}
                    rules={[{
                      pattern: MobileRegexPattern,
                      message: 'Please enter valid mobile number',
                    }, {
                      required: true,
                      message: 'Please enter mobile number',
                    }]}
                  >
                    <Input className="text-base" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          ) : null}
        </Row>
        <Form.Item className="modal-action">
          <Button
            type="primary"
            block
            htmlType="submit"
            onClick={():void => {
              pushClevertapEvent('Call HR', { Type: 'Confirm' });
            }}
            loading={submitInProgress}
          >
            Confirm

          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCallHR;
