import {
  Button,
  Col, Form, Input, message, Modal, Row, Space, Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { getOrganizationData } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { postEmployerTicket } from 'service/organization-service';
import { getUserProfile } from 'service/userInfoService';
import {
  EmailRegexPattern, JobTitlePattern, MobileRegexPattern, TitlePattern,
} from 'utils/constants';
import usePersistedState from 'utils/usePersistedState';
import { getAccessToken } from 'utils/browser-utils';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';

require('components/Layout/CustomerSupportAction/customerSupportActionModal.less');

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PropsType {
  title: string;
  description: string;
  source: string;
  closeHandler: () => void;
  isLoggedInPage: boolean
  text:string
}
const CustomerSupportActionModal = (props: PropsType): JSX.Element => {
  const {
    title, description, source, closeHandler, isLoggedInPage, text,
  } = props;
  const [currentScreen, setCurrentScreen] = useState('form');
  const [isInProgress, setIsInProgress] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  // Persisted State
  const [orgData, setOrgData] = usePersistedState('org_data', '');
  const [userData, setUserData] = usePersistedState('user_data', '');

  const [supportForm] = Form.useForm();

  const sendEmployerTicket = async (postObj):Promise<{ok: boolean}> => {
    const res = await postEmployerTicket(postObj, isLoggedInPage);
    return res;
  };

  const onFormError = (errors): void => {
    pushClevertapEvent('Customer Support', {
      Type: 'Submit',
      Status: 'F',
      Error: errors?.errorFields?.[0]?.errors?.[0],
    });
  };

  const onFormSubmit = async (values): Promise<void> => {
    setIsInProgress(true);
    const postObj = {
      name: values.name || 'Not Specified',
      contact_number: values.contact_number || 'Not Specified',
      email: values.email || 'Not Specified',
      organization: values.organization || 'Not Specified',
      organization_type: orgData && orgData.isPaidClient ? 'Paid' : 'Free',
      query: values.query || 'Not Specified',
      raise_from: source,
    };
    const res = await sendEmployerTicket(postObj);
    if (res) {
      setIsInProgress(false);
      pushClevertapEvent(`${title === 'Need a Customized Plan?' ? 'Custom Assessment' : 'Customer Support'}`, {
        Type: 'Submit',
        Status: 'S',
      });
      setCurrentScreen('formSuccess');
    } else {
      message.error('Some Error Occured! Please try after some time.');
      pushClevertapEvent(`${title === 'Need a Customized Plan?' ? 'Custom Assessment' : 'Customer Support'}`, {
        Type: 'Submit',
        Status: 'F',
      });
      setIsInProgress(false);
    }
  };

  const onValuesChange = (): void => {
    if (!isFormFilled) {
      if (title === 'Need a Customized Plan?') {
        pushClevertapEvent('Custom Assessment', {
          Type: 'Start',
        });
      } else {
        pushClevertapEvent('Customer Support', {
          Type: 'details_add',
        });
      }

      setIsFormFilled(true);
    }
  };

  useEffect(() => {
    const setOrganizationData = async ():Promise<void> => {
      const data = await getOrganizationData();
      setOrgData(data);
    };

    const setUserProfile = async ():Promise<void> => {
      const data = await getUserProfile();
      setUserData(data);
    };
    if (getAccessToken()) {
      setIsLoggedIn(true);
      if (!orgData) {
        setOrganizationData();
      }
      if (!userData) {
        setUserProfile();
      }

      if (userData && orgData) {
        setVisible(true);
      }
    } else {
      setVisible(true);
    }
  }, [orgData, userData, isLoggedInPage, setOrgData, setUserData]);

  return (
    <Modal
      title={currentScreen === 'form' ? (
        <Row>
          <Col xs={{ span: 20, offset: 0 }} lg={{ span: 16, offset: 0 }}>
            <Space direction="vertical">
              <Paragraph>
                <Text className="title text-semibold text-white">{title}</Text>
              </Paragraph>
              <Paragraph>
                <Text type="secondary" className="text-small text-white">{description}</Text>
              </Paragraph>
            </Space>
          </Col>
        </Row>
      ) : null}
      footer={null}
      visible={visible}
      onCancel={closeHandler}
      width={520}
      style={{ top: 50 }}
      className="customer-support-action-modal"
      destroyOnClose
    >
      {currentScreen === 'form' ? (
        <Row gutter={0} align="middle" justify="center">
          {/* Form */}
          <Col xs={{ span: 20, offset: 0 }}>
            <Form
              name="login"
              form={supportForm}
              onFinishFailed={onFormError}
              onFinish={onFormSubmit}
              onValuesChange={onValuesChange}
              layout="vertical"
              hideRequiredMark
              size="large"
              style={{ marginTop: 20 }}
              initialValues={{
                organization: orgData && orgData?.name,
                name: userData && userData.first_name ? `${userData.first_name} ${userData.last_name}` : '',
                contact_number: userData && userData?.mobile,
                email: userData && userData?.email,
              }}
            >

              {/* Name */}
              <Form.Item
                label={(<span className="text-small">Name</span>)}
                name="name"
                style={{ marginBottom: 10 }}
                rules={[{
                  required: true,
                  message: 'Please input first name',
                },
                {
                  max: 100,
                  message: 'Name cannot be more than 100 characters',
                },
                {
                  pattern: TitlePattern,
                  message: 'Name is not valid',
                }, {
                  whitespace: true,
                  message: 'Name cannot be empty',
                }]}
              >
                <Input
                  className="text-base"
                  autoComplete="new-password"
                  autoFocus={!isLoggedIn}
                />
              </Form.Item>

              {/* Phone Number */}
              <Form.Item
                label={(<span className="text-small">Phone Number</span>)}
                name="contact_number"
                style={{ marginBottom: 10 }}
                rules={[{
                  pattern: MobileRegexPattern,
                  message: 'Please input valid phone number',
                }, {
                  required: true,
                  message: 'Please input phone number',
                }]}
              >
                <Input
                  className="text-base"
                  autoComplete="new-password"
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label={(<span className="text-small">Email ID</span>)}
                name="email"
                style={{ marginBottom: 10 }}
                rules={[
                  {
                    required: true,
                    message: 'Please input Email ID!',
                  }, {
                    pattern: EmailRegexPattern,
                    message: 'Please input valid Email ID!',
                  },
                ]}
              >
                <Input
                  className="text-base"
                  autoComplete="new-password"
                />
              </Form.Item>

              {/* Your Organization */}
              <Form.Item
                label={(<span className="text-small">Organization Name</span>)}
                name="organization"
                style={{ marginBottom: 10 }}
                rules={[{
                  required: true,
                  message: 'Please input your organization name',
                }, {
                  max: 100,
                  message: 'Organization name cannot be more than 100 characters',
                }, {
                  pattern: JobTitlePattern,
                  message: 'Organization Name is not valid',
                }, {
                  whitespace: true,
                  message: 'Name cannot be empty',
                }]}
              >
                <Input
                  disabled={orgData && orgData?.name}
                  className="text-base"
                  autoComplete="new-password"
                />
              </Form.Item>

              {/* Query */}
              <Form.Item
                label={(<span className="text-small">Tell us your requirements</span>)}
                name="query"
                style={{ marginBottom: 30 }}
                rules={[{
                  required: true,
                  message: 'Please input your query',
                }, {
                  whitespace: true,
                  message: 'Query cannot be empty',
                }]}
              >
                <TextArea
                  autoFocus={!!isLoggedIn}
                  className="text-base"
                  placeholder="Describe your problem/query in brief"
                  autoSize={{ minRows: 4, maxRows: 10 }}
                />
              </Form.Item>

              {/* Submit */}
              <Form.Item style={{ marginBottom: 10 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="full-width text-semibold text-base"
                  loading={isInProgress}
                >
                  Send
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      ) : ''}

      {currentScreen === 'formSuccess' ? (
        <Row className="success-modal">
          <Col xs={{ span: 18 }} lg={{ span: 12, offset: 0 }}>
            <Row>
              <Col span={24} className="title">
                <Text>
                  {text}
                </Text>
              </Col>
            </Row>
            <Paragraph>
              <Text type="secondary" className="text-small">
                We have received you request.
                Our sales executive will reach out to you soon!
              </Text>
            </Paragraph>
          </Col>
          <Col xs={{ span: 6 }} lg={{ span: 12, offset: 0 }} className="custom-plan-success">
            <CustomImage
              src="/images/pricing-plan/custom-plan-success.svg"
              width={164}
              height={182}
              alt="Success"
            />
          </Col>
        </Row>
      ) : ''}
    </Modal>

  );
};

export default CustomerSupportActionModal;
