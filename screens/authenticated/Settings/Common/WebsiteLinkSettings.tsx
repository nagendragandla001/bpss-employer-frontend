import {
  Col, Form, Input, Row, Space, Typography,
} from 'antd';
import React from 'react';
import { WebsiteRegexPattern } from 'utils/constants';
import { VerificationInterface } from './settingsPageUtils';

const { Text } = Typography;

const WebsiteLinkSettings = (props: VerificationInterface): JSX.Element => {
  const {
    state, toggleState,
  } = props;
  return (
    <Row className="p-all-16">
      <Col xs={{ span: 24 }} lg={{ span: 16 }}>
        {
          toggleState ? (
            <Form.Item
              name="website"
              label={<Text className="label-header">Website link</Text>}
              style={{ marginBottom: 0 }}
              rules={[
                {
                  required: true,
                  message: 'Please enter website link!',
                },
                {
                  pattern: WebsiteRegexPattern,
                  message: 'This is not valid url',
                },
              ]}
            >
              <Input
                placeholder="www.example.com"
                style={{ minWidth: 200 }}
              />
            </Form.Item>
          ) : (
            <Space direction="vertical" size={0}>
              <Text className="label-header">Website link</Text>
              <Text type="secondary">{state.website || 'Not added'}</Text>
            </Space>
          )
        }
      </Col>
    </Row>
  );
};

export default WebsiteLinkSettings;
