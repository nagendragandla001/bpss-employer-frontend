import { ArrowLeftOutlined, CloseOutlined, PlusCircleFilled } from '@ant-design/icons';
import {
  Alert,
  Button, Col, Form, FormInstance, Input, Modal, Row, Select, Space, Tooltip, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { isUserValid } from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { addSecondaryManager } from 'service/accounts-settings-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { EmailRegexPattern, MobileRegexPattern, TitlePattern } from 'utils/constants';

interface POCReviewDetails{
  isPrimaryManager: boolean;
  visible: boolean;
  form: FormInstance;
  job: IJobPost;
  onClose: (value)=>void;
  onSubmitForm: (value)=>void;
  managersList: Array<IManagerList>;
}

interface IManagerList{
  managerId: string;
  name: string;
  mobile: string;
}

const { Text, Paragraph } = Typography;
const { Option } = Select;

const POCReviewModal = (props: POCReviewDetails): JSX.Element => {
  const {
    visible, form, job, onClose, onSubmitForm, managersList, isPrimaryManager,
  } = props;

  const [newPOCForm] = Form.useForm();
  const [newPOCModal, setNewPOCModal] = useState(false);
  const [newPOCEmail, setNewPOCEmail] = useState('');
  const [newPOCSuccessModal, setNewPOCSuccessModal] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const handleCancel = (): void => {
    onClose(false);
  };

  const onFinishHandler = async (formData): Promise<void> => {
    const postObj = {
      organization_id: job?.orgId,
      user_data: {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile: formData.mobileNo || undefined,
      },
    };
    pushClevertapEvent('New POC', { Type: 'Success' });
    const apiCall = await addSecondaryManager(postObj, { isForm: false, withAuth: true, errorMessage: '' });
    if (apiCall && [200, 201, 202].indexOf(apiCall.status) !== -1) {
      setNewPOCEmail(postObj?.user_data?.email);
      setNewPOCModal(false);
      setNewPOCSuccessModal(true);
    }
  };

  const EmailInputElement = (label:string):JSX.Element => (
    <Col span={24}>
      <Form.Item
        label={label}
        name="email"
        rules={[
          {
            required: true,
            message: 'Please enter an email ID',
          },
          {
            pattern: EmailRegexPattern,
            message: 'Please input valid Email ID!',
          },
          {
            validator: isUserValid,
          },
          {
            max: 200,
            message: 'Email Id cannot be more than 200 characters',
          },
        ]}
      >
        <Input type="text" />
      </Form.Item>
    </Col>
  );

  const MobileNoInputElement = (label:string, required:boolean):JSX.Element => (
    <Col span={24}>
      <Form.Item
        label={label}
        name="mobileNo"
        rules={[
          {
            required,
            message: 'Please enter mobile number',
          },
          {
            pattern: MobileRegexPattern,
            message: 'Please enter a valid mobile number',
          },
          {
            validator: isUserValid,
          },
        ]}
      >
        <Input
          prefix={(
            <CustomImage
              src="/images/settings/mobileNoPrefix.svg"
              height={22}
              width={22}
              alt="mobile no prefix"
            />
          )}
          size="large"
          className="input-with-prefix"
        />
      </Form.Item>
    </Col>
  );

  const POCSuccessModal = (): JSX.Element => (
    <Modal
      title={null}
      footer={null}
      closable
      visible
      onCancel={():void => setNewPOCSuccessModal(false)}
      className="POC-success-modal"
    >
      <Row justify="center" gutter={[0, 64]}>
        <Col span={18}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Text strong className="text-extra-base">
                Verify details of manager to add them them as
                Call POC
              </Text>
            </Col>
            <Col span={24}>
              <Row gutter={[0, 8]}>
                <Col>
                  <Text>
                    <Text strong>Step 1</Text>
                    {' '}
                    - Go to the inbox of
                    {' '}
                    {newPOCEmail}
                    {' '}
                    and verify the email
                    {' '}
                  </Text>
                </Col>
                <Col>
                  <Text>
                    <Text strong>Step 2</Text>
                    {' '}
                    - Login to employer.myrocket.co
                  </Text>
                </Col>
                <Col>
                  <Text>
                    <Text strong>Step 3</Text>
                    {' '}
                    - Verify mobile number
                  </Text>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Text>Then you will be able to add them as Call POC</Text>

            </Col>
          </Row>
        </Col>
        <Col span={18}>
          <CustomImage src="/images/job-details/add-POC-modal-image.svg" alt="success modal" width={289} height={184} />
        </Col>
      </Row>
    </Modal>
  );

  const newPOCModalContent = (): JSX.Element => (
    <Modal
      title={<Text className="settings-modal-title">Add Job Cordinator / Call POC</Text>}
      visible={newPOCModal}
      onCancel={():void => {
        if (formErrorMessage) {
          setFormErrorMessage('');
        }
        setNewPOCModal(false);
      }}
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
      className="settings-modal"
      maskStyle={{ background: 'rgba(0, 20, 67,0.8)' }}
      footer={<Button form="newPOCForm" type="primary" htmlType="submit">Add</Button>}
    >
      <Form
        id="newPOCForm"
        name="settingForm"
        layout="vertical"
        size="large"
        form={newPOCForm}
        onFinish={onFinishHandler}
        className="settings-modal-form"
        hideRequiredMark
        preserve={false}
      >
        {/* {getModalContent()} */}
        <Row>
          <Col span={24}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                {
                  required: true,
                  message: 'Please enter First Name',
                },
                {
                  pattern: TitlePattern,
                  message: 'First Name is not valid',
                },
                {
                  whitespace: true,
                  message: 'First Name cannot be empty',
                },
                {
                  max: 100,
                  message: 'First Name cannot be more than 100 characters',
                },
              ]}
              initialValue=""
            >
              <Input
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                {
                  required: true,
                  message: 'Please enter Last Name',
                },
                {
                  pattern: TitlePattern,
                  message: 'Last Name is not valid',
                },
                {
                  whitespace: true,
                  message: 'Last Name cannot be empty',
                },
                {
                  max: 100,
                  message: 'Last Name cannot be more than 100 characters',
                },
              ]}
              initialValue=""
            >
              <Input
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          {EmailInputElement('Email-ID')}
        </Row>
        <Row>
          {MobileNoInputElement('Phone No.', true)}
        </Row>
        {formErrorMessage ? (
          <Paragraph className="text-small">
            <Alert message={formErrorMessage} type="error" className="text-small form-error" showIcon />
          </Paragraph>
        ) : ''}
      </Form>
    </Modal>

  );

  return (
    <>
      <Modal
        title={isMobile
          ? [
            <Row justify="space-between" key="filter-title">
              <Col>
                <Button onClick={handleCancel} type="link">
                  <ArrowLeftOutlined />
                </Button>
                <Text strong className="text-base">Edit POC</Text>
              </Col>
            </Row>,
          ]
          : 'Edit POC'}
        visible={visible}
        onCancel={handleCancel}
        footer={false}
        width={isMobile ? '' : '25vw'}
        className={isMobile ? 'm-at-filters-modal m-candidate-modal' : ''}
        closable={!isMobile}
      >
        <Form
          name="employer-review-details"
          form={form}
          onFinish={onSubmitForm}
          layout="vertical"
          size="large"
          initialValues={{
            POCDetails:
             job?.pointOfContacts?.managerId ? job?.pointOfContacts?.managerId : undefined,
          }}
        >
          <Row align="middle" justify="start">
            <Col xs={{ span: 24 }} lg={{ span: 18 }}>
              <Form.Item label="Enter POC Details" name="POCDetails">
                <Select className="text-base text-bold">
                  {managersList?.map((manager) => (
                    <Option value={manager?.managerId} key={manager?.managerId}>{`${manager?.name} ${manager?.mobile ? `(${manager?.mobile})` : ''}`}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {isPrimaryManager
            && (
              <Col xs={{ span: 24 }} lg={{ span: 18 }}>
                <Tooltip title="CallHR for the new POC will be available after the email id and mobile number is verified and the POC logs in to the account.">
                  <Button
                    type="text"
                    onClick={():void => setNewPOCModal(true)}
                  >
                    <PlusCircleFilled style={{ color: '#1B2D93' }} />
                &nbsp;
                    <Text style={{ color: '#1B2D93' }} className="text-bold">ADD NEW POC</Text>
                  </Button>
                </Tooltip>
              </Col>
            ) }

            <Col md={{ span: 24 }} xs={{ span: 24 }} className="text-center">
              <Space align="center">
                <Button
                  size="small"
                  type="link"
                  className="text-semibold"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button size="small" type="primary" htmlType="submit">Continue</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>
      {newPOCModal ? newPOCModalContent() : null}
      {newPOCSuccessModal ? POCSuccessModal() : null}
    </>
  );
};

export default POCReviewModal;
