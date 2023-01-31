import {
  Alert,
  Button,
  Col, Row, Space, Typography,
} from 'antd';
import React from 'react';
import CustomImage from 'components/Wrappers/CustomImage';
import { SettingsFieldInterface } from './settingsPageUtils';

const { Text } = Typography;

const MobileSettings = (props: SettingsFieldInterface): JSX.Element => {
  const { state, onEdit } = props;

  const handleOnClick = (): void => {
    onEdit(state?.loggedInManager?.mobileNo ? 'changeMobileNo' : 'addNewMobileNo');
  };

  return (
    <Row className="p-all-16" gutter={[0, 12]}>
      <Col span={24}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" className="display-flex" size={16}>
              <div className="display-flex">
                <CustomImage
                  src="/images/settings/blackPhoneIcon.svg"
                  width={24}
                  height={24}
                  alt="phone icon"
                />
              </div>
              <Space direction="vertical" size={0}>
                <Text className="field-label">Mobile no.</Text>
                <Space direction="horizontal" align="center" size={4}>
                  <Text className="field-value">
                    {
                      state?.loggedInManager?.mobileNo || 'Not added'
                    }
                  </Text>
                  {
                    state?.loggedInManager?.mobileNo && (
                      state?.loggedInManager?.mobileVerified
                        ? (
                          <CustomImage
                            src="/images/settings/verifiedGreenIcon.svg"
                            height={12}
                            width={12}
                            alt="verified icon"
                          />
                        ) : (
                          <Button
                            type="link"
                            className="p-all-0 text-small text-bold"
                            onClick={(): void => onEdit('verifyMobile')}
                          >
                            Verify?
                          </Button>
                        ))
                  }
                </Space>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button
              type="link"
              className="text-small p-all-0 text-bold"
              onClick={handleOnClick}
            >
              {state?.loggedInManager?.mobileNo ? 'Change' : '+ Add'}
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default MobileSettings;
