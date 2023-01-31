import { QuestionCircleFilled } from '@ant-design/icons';
import {
  Input, Typography, Form, Row, Col, Space, Popover,
} from 'antd';
import React from 'react';
import { VerificationInterface } from './settingsPageUtils';
import VerificationStatus from './VerificationStatus';

const { Text } = Typography;

const PanSettings = (props: VerificationInterface): JSX.Element => {
  const {
    state, toggleState,
  } = props;
  return (
    <Row className="p-all-16">
      <Col xs={{ span: 24 }} lg={{ span: 16 }}>
        {
          toggleState ? (
            <Form.Item
              name="pan_verification"
              label={(
                <Space direction="horizontal">
                  <Text className="label-header">PAN</Text>
                  <Popover content="PAN details as per PAN certificate">
                    <QuestionCircleFilled className="alert" />
                  </Popover>
                </Space>
              )}
              className="p-all-16"
              style={{ marginBottom: 0 }}
              rules={[{
                required: true,
                message: 'Please enter PAN number!',
              }, {
                len: 10,
                message: 'Please enter valid PAN number',
              }]}
            >
              <Input
                placeholder="Pan number"
                style={{ minWidth: 200 }}
              />
            </Form.Item>
          ) : (
            <Space direction="vertical" size={0}>
              <Space direction="horizontal">
                <Text className="label-header">PAN</Text>
                <Popover content="PAN details as per PAN certificate">
                  <QuestionCircleFilled className="alert" />
                </Popover>
              </Space>
              <Space direction="horizontal">
                <Text type="secondary">{state?.verificationInfo?.pan_verification?.value || 'PAN number'}</Text>
                {
                  ['P', 'V', 'F'].includes(state?.verificationInfo?.pan_verification?.value_status) && (
                    <VerificationStatus
                      status={state?.verificationInfo?.pan_verification?.value_status}
                      type="pan_verification"
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

export default PanSettings;
