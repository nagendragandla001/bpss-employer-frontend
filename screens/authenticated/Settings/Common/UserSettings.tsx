import {
  Button,
  Col, Row, Space, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import { SettingsFieldInterface } from './settingsPageUtils';

const { Text } = Typography;

const UserSettings = (props: SettingsFieldInterface): JSX.Element => {
  const { state, onEdit } = props;

  const handleEdit = (): void => {
    onEdit(state?.passwordExists ? 'changePwd' : 'setPwd');
  };

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Text className="label-header">Settings</Text>
      </Col>
      <Col span={24}>
        <Space>
          <CustomImage
            src="/images/settings/changePasswordIcon.svg"
            width={26}
            height={24}
            alt="password"
          />
          <Button
            type="link"
            className="alert"
            onClick={handleEdit}
          >
            {state.passwordExists ? 'Change Password' : 'Set Password'}

          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default UserSettings;
