import React from 'react';
import {
  Modal, Form, Button, Input, Row, Col,
} from 'antd';
import { MobileRegexPattern, TitlePattern } from 'utils/constants';
import { ManagersListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobsTab/Desktop/addSlots/addNewPocModal.less');

interface PropsInterface{
  closeModal: () => void;
  addNewPocHandler: (updateObject:ManagersListType)=> void
  pocList: Array<ManagersListType>;
}
const AddNewAddressModal = (props: PropsInterface): JSX.Element => {
  const { addNewPocHandler } = props;
  const [pocForm] = Form.useForm();
  const onFinishHandler = (value): void => {
    addNewPocHandler({
      name: value.name,
      email: '',
      mobile: value.mobile,
      id: 0,
    });
  };

  const checkExisitingNumber = async (_rule, value: string): Promise<void> => {
    const exisitingItem = props.pocList.filter((item) => item.mobile === value);
    if (exisitingItem.length > 0) {
      throw new Error('This number already exists in the List');
    }
    return Promise.resolve();
  };

  const renderContent = (): JSX.Element => (
    <Form
      name="InterviewPocForm"
      layout="vertical"
      size="large"
      form={pocForm}
      onFinish={onFinishHandler}
      hideRequiredMark
    >
      <Row>
        <Col span={24} className="p-bottom-8">
          <Form.Item
            label="Name of the POC"
            name="name"
            validateTrigger={['onBlur']}
            rules={[
              {
                required: true,
                message: 'Please input POC name',
              },
              {
                max: 100,
                message: 'Name cannot be more than 100 characters',
              },
              {
                pattern: TitlePattern,
                message: 'Please enter a valid name',
              },
              {
                whitespace: true,
                message: 'Name cannot be empty',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={24} className="p-bottom-8">
          <Form.Item
            label="Phone No."
            name="mobile"
            className="form-item-title-grey"
            validateTrigger={['onBlur']}
            rules={[
              {
                pattern: MobileRegexPattern,
                message: 'Please input valid mobile number',
              },
              {
                required: true,
                message: 'Please input mobile number',
              },
              {
                validator: checkExisitingNumber,
              },
            ]}
          >
            <Input
              prefix={(
                <CustomImage
                  src="/images/settings/mobileNoPrefix.svg"
                  width={22}
                  height={22}
                  alt="+91"
                />
              )}
              className="input-with-prefix"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <Modal
      title="Add New Contact"
      footer={(
        <Button
          type="primary"
          onClick={():void => pocForm.submit()}
        >
          Save & Continue
        </Button>
      )}
      visible
      width={400}
      maskClosable
      onCancel={(): void => props.closeModal()}
      className="add-new-poc-modal"
    >
      {renderContent()}
    </Modal>
  );
};

export default AddNewAddressModal;
