import {
  Button, Col, Form, Input, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import snackBar from 'components/Notifications';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { OrganizationDetailsType, stripHtmlTags } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { patchOrgDetails } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';

interface PropsI{
  visibleModal:boolean,
  onCancel:()=>void;
  data:OrganizationDetailsType;
  patchrequest :(any)=>void
}
const { Text } = Typography;
const AboutModal = (props:PropsI):JSX.Element => {
  const {
    visibleModal, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    // console.log(formData);
    const patchobj = {
      description: formData.about,
      id: data.id,
    };

    const res = await patchOrgDetails(patchobj, data.id);

    if ([200, 201, 202].indexOf(res.status) > -1) {
      pushClevertapEvent('Profile About Company', { Type: 'Save', Status: 'Success' });
      patchrequest('success');
      onCancel();
      setSubmitInProgress(false);
    } else {
      pushClevertapEvent('Profile About Company', { Type: 'Save', Status: 'Failure' });
      snackBar({
        title: 'Your details cannot be saved right now Plesae try again after some time',
        description: '',
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
      setSubmitInProgress(false);
    }
  };
  const wordCheck = (_rule, viewValue):Promise<void> => {
    const strippedText = viewValue.toString().replace(/(<([^>]+)>)/ig, '').replace(/\u00A0/g, ' ');
    const splitArray = strippedText.split(' ');
    const splitArrayLength = splitArray.length;

    if (splitArrayLength < 10) {
      return Promise.reject(new Error('Please write at least 10 words about your company'));
    }
    return Promise.resolve();
  };
  return (
    <Modal
      visible={!!visibleModal}
      onCancel={onCancel}
      title={isMobile ? (
        <Row key="job-details" className="ct-title" gutter={16}>
          <Col onClick={onCancel}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col className="ct-v-auto"><Text className="title">About your Company</Text></Col>
        </Row>
      ) : 'About your Company'}
      okText="Save & Close"
      width={556}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      footer={null}
      closable={false}
    >
      <Form
        layout="vertical"
        initialValues={{
          about: stripHtmlTags(data.description),

        }}
        onFinish={finishHandler}
      >

        <Form.Item
          label={`About ${data.name}`}
          name="about"
          rules={[{
            validator: wordCheck,

          }]}
        >
          <Input.TextArea
            className="ct-app-actions-feedback-input"
            autoSize={{ minRows: 6 }}

          />
        </Form.Item>
        {isMobile
          ? (
            <div className="m-ct-feedback-modal-footer-mobile">
              <Button
                htmlType="submit"
                type="primary"
                className="green-primary-btn"
                loading={submitInProgress}
                // className="ct-cancel-btn"
                // onClick={finishHandler}
                // onClick={():void => {
                //   pushClevertapEvent('Profile About Company', { Type: 'Save' });
                // }}
              >
                Save & Close

              </Button>

            </div>
          )
          : (
            <>
              <Button
                htmlType="submit"
                className="ct-cancel-btn"
                onClick={():void => {
                  onCancel();
                  pushClevertapEvent('Profile About Company', { Type: 'Cancel' });
                }}
              >
                Cancel

              </Button>
              <Button
                htmlType="submit"
                className="ct-save-btn"
                loading={submitInProgress}
                // onClick={finishHandler}
                // onClick={():void => {
                //   pushClevertapEvent('Profile About Company', { Type: 'Save' });
                // }}
              >
                Save & Close

              </Button>
            </>
          )}
      </Form>

    </Modal>

  );
};
export default AboutModal;
