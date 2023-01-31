import { QuestionCircleFilled } from '@ant-design/icons';
import {
  Input, Typography, Form, Row, Col, Space, Popover,
} from 'antd';
import React from 'react';
import { VerificationInterface } from './settingsPageUtils';
import VerificationStatus from './VerificationStatus';

const { Text } = Typography;

const GSTSettings = (props: VerificationInterface): JSX.Element => {
  const {
    state, toggleState,
  } = props;
  return (
    <Row className="p-all-16">
      <Col xs={{ span: 24 }} lg={{ span: 16 }}>
        {
          toggleState ? (
            <Form.Item
              name="gst_verification"
              label={(
                <Space direction="horizontal">
                  <Text className="label-header">GST</Text>
                  <Popover content="GST details as per GST certificate">
                    <QuestionCircleFilled className="alert" />
                  </Popover>
                </Space>
              )}
              className="p-all-16"
              style={{ marginBottom: 0 }}
              rules={[{
                required: true,
                message: 'Please enter GST number!',
              }, {
                len: 15,
                message: 'Please enter valid GST number',
              }]}
            >
              <Input
                placeholder="GST number"
                style={{ minWidth: 200 }}
              />
            </Form.Item>
          ) : (
            <Space direction="vertical" size={0}>
              <Space direction="horizontal">
                <Text className="label-header">GST</Text>
                <Popover content="GST details as per GST certificate">
                  <QuestionCircleFilled className="alert" />
                </Popover>
              </Space>
              <Space direction="horizontal">
                <Text type="secondary">{state?.verificationInfo?.gst_verification?.value || 'GST number'}</Text>
                {
                  ['P', 'V', 'F'].includes(state?.verificationInfo?.gst_verification?.value_status) && (
                    <VerificationStatus
                      status={state?.verificationInfo?.gst_verification?.value_status}
                      type="gst_verification"
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

export default GSTSettings;
