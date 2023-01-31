import React from 'react';
import {
  Button, Col, Row, Space, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { DeleteOutlined } from '@ant-design/icons';
import { SettingsFieldInterface } from './settingsPageUtils';

const { Text } = Typography;

const ManagerSettings = (props: SettingsFieldInterface): JSX.Element => {
  const { state, onEdit } = props;

  return (
    <Row gutter={[0, 22]}>
      {
        state?.secondaryManagers?.length > 0 && (
          <Col span={24}>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <Text className="label-header main-header-label">Secondary Manager Details</Text>
              </Col>
              <Col span={24}>
                <Row gutter={[0, 20]}>
                  {
                    state?.secondaryManagers?.map((manager, index) => (
                      <Col span={24} key={manager?.id} className="setting-container p-all-16">
                        <Row>
                          <Col span={24}>
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Text className="manager-name">{`${manager.firstName} ${manager.lastName}`}</Text>
                              </Col>
                              <Col>
                                <Button
                                  type="link"
                                  className="remove-btn text-small p-all-0"
                                  onClick={(): Promise<void> => onEdit('removeManager', index)}
                                >
                                  Remove
                                  <CustomImage
                                    src="/images/settings/binIcon.svg"
                                    width={24}
                                    height={24}
                                    alt="bin icon"
                                  />
                                </Button>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={24}>
                            <Space direction="vertical">
                              <Space direction="horizontal" align="center">
                                <div className="display-flex">
                                  <CustomImage
                                    src="/images/settings/greyEmailIcon.svg"
                                    width={20}
                                    height={20}
                                    alt="settings page banner"
                                  />
                                </div>

                                <Text>{manager?.email}</Text>
                                {manager?.emailVerified && (
                                  <CustomImage
                                    src="/images/settings/verifiedGreyIcon.svg"
                                    height={12}
                                    width={12}
                                    alt="verified Icon"
                                  />
                                )}
                              </Space>
                              <Space direction="horizontal" align="center">
                                <div className="display-flex">
                                  <CustomImage
                                    src="/images/settings/greyPhoneIcon.svg"
                                    width={20}
                                    height={20}
                                    alt="settings page banner"
                                  />
                                </div>

                                <Text>{manager.mobileNo ? manager.mobileNo : 'Not added'}</Text>
                                {manager?.mobileVerified && (
                                  <CustomImage
                                    src="/images/settings/verifiedGreyIcon.svg"
                                    height={12}
                                    width={12}
                                    alt="verified Icon"
                                  />
                                )}
                              </Space>
                            </Space>
                          </Col>
                        </Row>
                      </Col>
                    ))
                  }
                </Row>
              </Col>
            </Row>
          </Col>
        )
      }
      {state?.loggedInManager && state.loggedInManager?.type === 'P' ? (
        <Col span={24} className="display-flex flex-justify-content-center">
          <Button
            type="link"
            className="text-bold"
            onClick={(): void => onEdit('addSecondaryManager')}
          >
            + Add a Manager
          </Button>
        </Col>
      ) : null}
    </Row>
  );
};

export default ManagerSettings;
