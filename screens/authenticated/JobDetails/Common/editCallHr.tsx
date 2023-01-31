import {
  Button, Col, Form, Input, Modal, Radio, Row,
  Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { UserDetailsType } from 'lib/authenticationHOC';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { pushClevertapEvent } from 'utils/clevertap';
import { MobileRegexPattern, TitlePattern } from 'utils/constants';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

const { Text, Paragraph } = Typography;

interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
  loggedInUserDetails:UserDetailsType|null
}

const JobCallHr = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest, loggedInUserDetails,
  } = props;
  const [state, setState] = useState({
    formVisible: (data?.shareContact || data?.isCallPocNull) ? '1' : '0',

  });
  const [submitInProgress, setSubmitInProgress] = useState(false);
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createPostObj = (formData) => {
    const postObject = {
      id: data.id,
      share_contact_to_public: state.formVisible === '1',
      call_poc: {},
    };
    if (state.formVisible === '1') {
      postObject.call_poc = {
        name: formData.name,
        contact: formData.contact,
      };
    } else {
      postObject.call_poc = {
        name: data.callPoc.name,
        contact: data.callPoc.contact,
      };
      // delete postObject.call_poc;
    }

    return postObject;
  };
  const [form] = Form.useForm();
  const setCallPocDetails = (): void => {
    form.setFieldsValue({
      name: `${loggedInUserDetails?.firstName}${loggedInUserDetails?.lastName}`,
      contact: loggedInUserDetails?.mobile,
    });
  };
  if (data.callPoc === null) {
    setCallPocDetails();
  }
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = createPostObj(formData);
    // console.log(obj);
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
      title="Call HR"
    >
      <Form
        name="callHrForm"
        layout="vertical"
        size="large"
        hideRequiredMark
        form={form}
        onFinish={finishHandler}
        initialValues={{
          contact: data?.callPoc ? data?.callPoc?.contact : '',
          name: data?.callPoc ? data?.callPoc?.name : '',
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
              <Col span={24} className="text-center text-small text-disabled m-jobDetails-callhr" style={{ marginTop: '16px' }}>
                With “Call HR enabled”,
                candidates can reach out to
                you directly over the call from 9AM - 8PM from MON to SAT
              </Col>
            </Row>
          </Col>

        </Row>

        <Paragraph style={{ paddingBottom: 12 }}>
          <Text>Allow candidates to contact you directly?</Text>
        </Paragraph>

        {/* Allow Candidates Directly */}
        <Radio.Group
          onChange={(event): void => {
            setState((prevState) => (
              { ...prevState, formVisible: event.target.value }
            ));
          }}
          disabled={!data?.callHrEnabled}
          defaultValue={state.formVisible}
          style={{ marginBottom: 20 }}
        >
          <Radio.Button value="1" style={{ fontSize: 14 }}>Yes</Radio.Button>
          <Radio.Button value="0" style={{ fontSize: 14 }}>No</Radio.Button>
        </Radio.Group>

        {/* POC Details */}
        {(state.formVisible === '1' && data?.callHrEnabled) ? (
          <Row gutter={16}>

            {/* Name */}
            <Col span={12}>
              <Form.Item
                name="name"
                label="Your name"
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
        ) : null}
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
                onClick={():void => {
                  pushClevertapEvent('Call HR', { Type: 'Confirm' });
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
export default JobCallHr;
