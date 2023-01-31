import {
  Button,
  Col, Divider, Row, Space, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import EmailSettings from './EmailSettings';
import MobileSettings from './MobileSettings';
import { SettingsFieldInterface } from './settingsPageUtils';

const { Text } = Typography;

const UserDetails = (props: SettingsFieldInterface): JSX.Element => {
  const { state, onEdit } = props;

  return (
    <Row>
      <Col span={24}>
        <CustomImage
          src="/images/settings/banner.svg"
          width={554}
          height={116}
          className="user-name-banner"
          alt="settings page banner"
        />
        <Space className="user-name-wrapper">
          <Text className="user-name">{state?.loggedInManager ? `${state.loggedInManager.firstName} ${state.loggedInManager.lastName}` : ''}</Text>
          <Button
            type="link"
            className="p-all-0"
            onClick={(): void => onEdit('changeName')}
          >
            <CustomImage
              src="/images/settings/pencilIcon.svg"
              width={24}
              height={24}
              alt="pencil icon"
            />
          </Button>
        </Space>
      </Col>
      <Col span={24}><MobileSettings state={state} onEdit={onEdit} /></Col>
      <Col span={24}><Divider style={{ margin: 0 }} /></Col>
      <Col span={24}><EmailSettings state={state} onEdit={onEdit} /></Col>
    </Row>
  );
};

export default UserDetails;
