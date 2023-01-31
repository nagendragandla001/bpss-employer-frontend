import {
  Alert,
  Button,
  Col, Row, Space, Typography,
} from 'antd';
import React from 'react';
import CustomImage from 'components/Wrappers/CustomImage';
import { SettingsFieldInterface } from './settingsPageUtils';

const { Text } = Typography;

const EmailSettings = (props: SettingsFieldInterface): JSX.Element => {
  const { state, onEdit } = props;

  return (
    <Row className="p-all-16" gutter={[0, 12]}>
      <Col span={24}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" className="display-flex" size={16}>
              <div className="display-flex">
                <CustomImage
                  src="/images/settings/blackEmailIcon.svg"
                  width={24}
                  height={24}
                  alt="email icon"
                />
              </div>
              <Space direction="vertical" size={0}>
                <Text className="field-label">Email</Text>
                <Space direction="horizontal" align="center" size={4}>
                  <Text className="field-value">
                    {
                      state?.loggedInManager?.email || 'Not added'
                    }
                  </Text>
                  {state?.loggedInManager?.emailVerified && (
                    <CustomImage
                      src="/images/settings/verifiedGreenIcon.svg"
                      height={12}
                      width={12}
                      alt="verified icon"
                    />
                  )}
                </Space>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button
              type="link"
              className="text-small p-all-0 text-bold"
              onClick={(): void => onEdit('changeEmail')}
            >
              {state?.loggedInManager?.email ? 'Change' : 'Add'}
            </Button>
          </Col>
        </Row>
      </Col>
      {/* Verification Pending Banner message */}
      {
        state?.loggedInManager?.unverifiedEmail && (
          <Col span={24}>
            <Alert
              banner
              className="alert"
              showIcon={false}
              message={(
                <Space direction="vertical" size={0}>
                  <Text className="text-small">
                    Verification pending for: &nbsp;
                    {state.loggedInManager.unverifiedEmail}
                  </Text>
                  <Button
                    type="link"
                    className="p-all-0 auto-size text-small text-bold"
                    onClick={(): Promise<void> => onEdit('resendLink')}
                  >
                    Resend link
                  </Button>
                </Space>
              )}
            />
          </Col>
        )
      }
    </Row>
  );
};

export default EmailSettings;
