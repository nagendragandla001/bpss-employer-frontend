import { QuestionCircleFilled } from '@ant-design/icons';
import {
  Col, Popover, Row, Space, Typography, Button, Input, Form,
} from 'antd';
import React from 'react';
import { VerificationInterface } from './settingsPageUtils';
import VerificationStatus from './VerificationStatus';

const { Text } = Typography;

const tooltipMessage = (type): string => {
  if (type === 'IND') {
    return 'Registered name as per PAN certificate';
  }

  return 'Registered company name as per GST certificate';
};

const CompanyLabel = ({ type }: any): JSX.Element => (
  <Space direction="horizontal">
    <Text className="label-header">Registered name</Text>
    <Popover content={tooltipMessage(type)}>
      <QuestionCircleFilled className="alert" />
    </Popover>
  </Space>
);

const RegisteredNameSettings = (props: VerificationInterface): JSX.Element => {
  const {
    state, toggleState,
  } = props;

  const getRequiredErrorMessage = (): string => {
    if (state?.type === 'IND') {
      return 'Please enter registered name!';
    }

    return 'Please enter registered company name!';
  };

  return (
    <Row className="p-all-16">
      <Col xs={{ span: 24 }} lg={{ span: 16 }}>
        {
          toggleState ? (
            <Form.Item
              name="registered_company_name"
              label={<CompanyLabel type={state?.type} />}
              style={{ marginBottom: 0 }}
              rules={[
                {
                  required: true,
                  message: getRequiredErrorMessage(),
                },
              ]}
            >
              <Input
                placeholder="Company name"
              />
            </Form.Item>
          ) : (
            <Space direction="vertical" size={0}>
              <CompanyLabel type={state?.type} />
              <Space direction="horizontal">
                <Text type="secondary">{state?.verificationInfo?.registered_company_name?.value || 'Company name'}</Text>
                {
                  ['P', 'V', 'F'].includes(state?.verificationInfo?.registered_company_name?.value_status) && (
                    <VerificationStatus
                      status={state?.verificationInfo?.registered_company_name?.value_status}
                      type="registered_company_name"
                    />
                  )
                }
              </Space>
            </Space>
          )
        }
      </Col>
    </Row>
  );
};

export default RegisteredNameSettings;
