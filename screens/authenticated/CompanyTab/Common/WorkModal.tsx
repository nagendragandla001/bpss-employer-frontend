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

const { Text } = Typography;
interface PropsI{
  visibleModal:boolean,
  onCancel:()=>void;
  data: OrganizationDetailsType;
  patchrequest :(any)=>void
}
const WorkModal = (props:PropsI):JSX.Element => {
  const {
    visibleModal, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    // console.log(formData);
    const patchobj = {
      why_work_here: formData.work,
      id: data.id,
    };
    const res = await patchOrgDetails(patchobj, data.id);
    if ([200, 201, 202].indexOf(res.status) > -1) {
      setSubmitInProgress(false);
      pushClevertapEvent('Profile Why work with us', { Type: 'Save', Status: 'Success' });
      onCancel();

      patchrequest('success');
    } else {
      setSubmitInProgress(false);
      pushClevertapEvent('Profile Why work with us', { Type: 'Save', Status: 'Failure' });
      snackBar({
        title: 'Your details cannot be saved right now Please try again after some time',
        description: '',
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
    }
  };
  const wordCheck = (_rule, viewValue):Promise<void> => {
    const strippedText = viewValue.toString().replace(/(<([^>]+)>)/ig, '').replace(/\u00A0/g, ' ');
    const splitArray = strippedText.split(' ');
    const splitArrayLength = splitArray.length;
    if (splitArrayLength < 10) {
      return Promise.reject(new Error('Please write at least 10 words about why work with you company.'));
    }
    return Promise.resolve();
  };
  return (
    <Modal
      visible={!!visibleModal}
      footer={null}
      onCancel={onCancel}
      closable={false}
      okText="Save & Close"
      width={556}
      title={isMobile ? (
        <Row key="job-details" className="ct-title" gutter={16}>
          <Col onClick={onCancel}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col className="ct-v-auto"><Text className="title">Why Work With Us</Text></Col>
        </Row>
      ) : 'Why Work With Us'}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
    >
      <Form
        layout="vertical"
        initialValues={{
          work: stripHtmlTags(data.whyWorkHere),

        }}
        onFinish={finishHandler}
      >

        <Form.Item
          label={`Why you should work with ${data.name}?`}
          name="work"
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
                //   pushClevertapEvent('Profile Why work with us', { Type: 'Save' });
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
                  pushClevertapEvent('Profile Why work with us', { Type: 'Save' });
                }}
              >
                Cancel

              </Button>
              <Button
                htmlType="submit"
                className="ct-save-btn"
                loading={submitInProgress}
                // onClick={():void => {
                //   pushClevertapEvent('Profile Why work with us', { Type: 'Save' });
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
export default WorkModal;
