import React from 'react';
import {
  Modal, Form, Input, Button,
} from 'antd';
import { forwardResumeAPI } from 'service/application-card-service';
import { EmailRegexPattern } from 'utils/constants';
import { pushClevertapEvent } from 'utils/clevertap';
import snackBar from 'components/Notifications';

require('screens/authenticated/ApplicationsTab/Desktop/applicationActions.less');

interface ResumeI{
  visible:boolean;
  handleCancel:() => void;
  applicationId:string;
}
const DownloadResume = (props:ResumeI):JSX.Element => {
  const { visible, handleCancel, applicationId } = props;

  const onFinish = async (formData) :Promise<void> => {
    const nameArr = formData.send_to.split(',');

    const postobj = {
      application_ids: applicationId,
      body: formData.body,
      subject: formData.subject,
      send_to: nameArr,
    };
    const res = await forwardResumeAPI(postobj);
    if (res.status === 201) {
      snackBar({
        title: 'Resume has been Sent Successfully!!',
        description: '',
        iconName: '',
        notificationType: 'success',
        placement: 'topRight',
        duration: 5,
      });
      pushClevertapEvent('Forward Resume Success', { Type: 'Single/Bulk', Selected: 'Y' });
      handleCancel();
    } else {
      pushClevertapEvent('Forward Resume Success', { Type: 'Single/Bulk', Selected: 'N' });
    }
  };
  return (
    <Modal
      title="Forward Selected Resume"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      maskStyle={{ background: 'rgb(0, 25, 64,0.8)' }}
    >
      <Form
        name="basic"
        onFinish={onFinish}
      >
        <Form.Item
          name="send_to"
          rules={[
            { required: true, message: 'Please enter email Id' }, {
              pattern: EmailRegexPattern,
              message: 'Please input valid Email ID!',
            }]}

        >
          <Input placeholder=" Enter comma separated Email ID" />
        </Form.Item>
        <Form.Item
          name="subject"
          rules={[
            { required: true, message: 'Please enter subject' },

          ]}
        >
          <Input placeholder=" Enter Subject" />
        </Form.Item>
        <Form.Item
          name="body"
          rules={[
            { required: true, message: 'Please enter body' },

          ]}
        >
          <Input.TextArea
            placeholder=" Enter Email Body"
            autoSize={{ minRows: 5 }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
          >
            SEND
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default DownloadResume;
